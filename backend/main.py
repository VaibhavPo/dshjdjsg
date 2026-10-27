"""
FastAPI Backend for UK Day-Ahead Wind Forecast & Procurement Evaluation.
Loads January 2026 Elexon actuals and forecasts and evaluates accuracy.
"""

import os
import json
import math
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load cached Elexon datasets into memory on startup."""
    load_data()
    yield

app = FastAPI(
    title="UK Renewable Forecast Evaluation API",
    description="Evaluation of UK day-ahead wind forecasts vs actuals for wholesale power procurement.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to cached January 2026 data
BASE_DIR = os.path.dirname(__file__)
ACTUALS_PATH = os.path.join(BASE_DIR, "data", "actuals_wind_jan2026.json")
FORECASTS_PATH = os.path.join(BASE_DIR, "data", "forecasts_wind_jan2026.json")

# In-memory datasets
ACTUALS: List[Dict[str, Any]] = []
FORECASTS_BY_START_TIME: Dict[str, List[Dict[str, Any]]] = {}


def load_data():
    """Load cached Elexon datasets into memory."""
    global ACTUALS, FORECASTS_BY_START_TIME

    # 1. Load actuals
    if os.path.exists(ACTUALS_PATH):
        with open(ACTUALS_PATH, "r", encoding="utf-8") as f:
            ACTUALS = json.load(f)
        print(f"Loaded {len(ACTUALS)} actual wind records.")
    else:
        print(f"Warning: {ACTUALS_PATH} not found.")

    # 2. Load forecasts and group by target delivery time (startTime)
    if os.path.exists(FORECASTS_PATH):
        with open(FORECASTS_PATH, "r", encoding="utf-8") as f:
            forecasts = json.load(f)
        
        FORECASTS_BY_START_TIME = {}
        for fcast in forecasts:
            st = fcast.get("startTime")
            if st not in FORECASTS_BY_START_TIME:
                FORECASTS_BY_START_TIME[st] = []
            FORECASTS_BY_START_TIME[st].append(fcast)
        print(f"Indexed forecasts across {len(FORECASTS_BY_START_TIME)} target settlement periods.")
    else:
        print(f"Warning: {FORECASTS_PATH} not found.")


def get_latest_day_ahead_forecast(start_time_str: str, cutoff_hour: int) -> Optional[Dict[str, Any]]:
    """
    Find the latest forecast published before the D-1 decision cutoff.
    Example:
      Target delivery date D = 2026-01-15
      Decision day D-1 = 2026-01-14
      Cutoff time = 2026-01-14T{cutoff_hour:02d}:00:00Z
    """
    candidates = FORECASTS_BY_START_TIME.get(start_time_str, [])
    if not candidates:
        return None

    # Parse target delivery date
    try:
        # Format: 2026-01-15T14:30:00Z
        delivery_dt = datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
        # Previous day D-1
        d_minus_1 = (delivery_dt - timedelta(days=1)).date()
        cutoff_iso = f"{d_minus_1.isoformat()}T{cutoff_hour:02d}:00:00Z"
    except Exception:
        return None

    # Filter forecasts published on or before the cutoff time
    eligible = [f for f in candidates if f.get("publishTime") and f["publishTime"] <= cutoff_iso]
    if not eligible:
        return None

    # Pick the most recently published forecast among eligible ones
    latest = max(eligible, key=lambda f: f["publishTime"])
    return latest


def build_matched_dataset(cutoff_hour: int, filter_date: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Match each actual generation record with its day-ahead forecast.
    """
    records = []

    for item in ACTUALS:
        start_time = item["startTime"]
        delivery_date = start_time[:10]  # YYYY-MM-DD

        # Optional date filter (e.g. single day inspection)
        if filter_date and delivery_date != filter_date:
            continue

        actual_gen = item.get("generation")
        if actual_gen is None:
            continue

        forecast_item = get_latest_day_ahead_forecast(start_time, cutoff_hour)
        if not forecast_item or forecast_item.get("generation") is None:
            continue

        forecast_gen = forecast_item["generation"]
        # Error convention: Forecast - Actual
        # Positive = over-forecast (wind was lower than expected -> thermal shortfall)
        # Negative = under-forecast (wind was higher than expected)
        error = forecast_gen - actual_gen
        abs_error = abs(error)

        records.append({
            "startTime": start_time,
            "settlementDate": delivery_date,
            "settlementPeriod": item.get("settlementPeriod", 0),
            "actualGeneration": round(actual_gen, 1),
            "forecastGeneration": round(forecast_gen, 1),
            "publishTime": forecast_item["publishTime"],
            "error": round(error, 1),
            "absError": round(abs_error, 1),
        })

    return records


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "actualsCount": len(ACTUALS),
        "forecastPeriodsCount": len(FORECASTS_BY_START_TIME)
    }


@app.get("/api/timeseries")
def get_timeseries(
    cutoff_hour: int = Query(12, ge=0, le=23, description="Decision cutoff hour on D-1 (0-23 GMT)"),
    date: Optional[str] = Query(None, description="Optional single date filter (YYYY-MM-DD)")
):
    """
    Return synchronized time-series of actual wind generation vs day-ahead forecast.
    """
    matched = build_matched_dataset(cutoff_hour, date)
    return {
        "cutoffHour": cutoff_hour,
        "selectedDate": date,
        "totalPoints": len(matched),
        "data": matched
    }


@app.get("/api/metrics")
def get_metrics(
    cutoff_hour: int = Query(12, ge=0, le=23, description="Decision cutoff hour on D-1 (0-23 GMT)"),
    date: Optional[str] = Query(None, description="Optional single date filter (YYYY-MM-DD)")
):
    """
    Calculate quantitative forecast accuracy and risk metrics.
    """
    matched = build_matched_dataset(cutoff_hour, date)
    if not matched:
        return {"error": "No data available for the specified criteria"}

    errors = [x["error"] for x in matched]
    abs_errors = [x["absError"] for x in matched]
    actuals = [x["actualGeneration"] for x in matched]
    forecasts = [x["forecastGeneration"] for x in matched]
    n = len(matched)

    # 1. Standard Error Metrics
    mae = sum(abs_errors) / n
    rmse = math.sqrt(sum(e ** 2 for e in errors) / n)
    bias = sum(errors) / n  # Mean Error
    total_actual_mwh = sum(actuals) * 0.5  # Each settlement period is 30 mins (0.5 hr)
    total_forecast_mwh = sum(forecasts) * 0.5

    # Weighted Absolute Percentage Error (WAPE)
    wape = (sum(abs_errors) / sum(actuals)) * 100 if sum(actuals) > 0 else 0

    # 2. Percentile Analysis (for thermal reserve buffer sizing)
    sorted_errors = sorted(errors)
    def get_percentile(p: float):
        k = (len(sorted_errors) - 1) * (p / 100.0)
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            return sorted_errors[int(k)]
        return sorted_errors[f] * (c - k) + sorted_errors[c] * (k - f)

    p10 = get_percentile(10)
    p50 = get_percentile(50)  # Median
    p90 = get_percentile(90)

    # 3. Settlement Period breakdown (1 to 48)
    period_groups: Dict[int, List[Dict[str, Any]]] = {}
    for item in matched:
        sp = item["settlementPeriod"]
        if sp not in period_groups:
            period_groups[sp] = []
        period_groups[sp].append(item)

    period_stats = []
    for sp in sorted(period_groups.keys()):
        grp = period_groups[sp]
        grp_n = len(grp)
        grp_mae = sum(x["absError"] for x in grp) / grp_n
        grp_bias = sum(x["error"] for x in grp) / grp_n
        grp_avg_actual = sum(x["actualGeneration"] for x in grp) / grp_n
        grp_avg_forecast = sum(x["forecastGeneration"] for x in grp) / grp_n
        period_stats.append({
            "period": sp,
            "avgActual": round(grp_avg_actual, 1),
            "avgForecast": round(grp_avg_forecast, 1),
            "mae": round(grp_mae, 1),
            "bias": round(grp_bias, 1)
        })

    # 4. Error Distribution Histogram (for risk visualization)
    min_err = math.floor(min(errors) / 500) * 500
    max_err = math.ceil(max(errors) / 500) * 500
    bin_size = 500  # 500 MW bins
    bins: Dict[str, int] = {}

    curr = min_err
    while curr < max_err:
        label = f"{curr} to {curr + bin_size}"
        bins[label] = 0
        curr += bin_size

    for e in errors:
        b_start = math.floor(e / bin_size) * bin_size
        b_label = f"{b_start} to {b_start + bin_size}"
        if b_label in bins:
            bins[b_label] += 1
        else:
            bins[b_label] = 1

    histogram = [{"bin": k, "count": v} for k, v in bins.items()]

    return {
        "cutoffHour": cutoff_hour,
        "selectedDate": date,
        "sampleSize": n,
        "summary": {
            "mae": round(mae, 1),
            "rmse": round(rmse, 1),
            "bias": round(bias, 1),
            "wapePercent": round(wape, 2),
            "totalActualMWh": round(total_actual_mwh, 1),
            "totalForecastMWh": round(total_forecast_mwh, 1),
            "p10": round(p10, 1),
            "p50": round(p50, 1),
            "p90": round(p90, 1),
        },
        "periodStats": period_stats,
        "distribution": histogram
    }
