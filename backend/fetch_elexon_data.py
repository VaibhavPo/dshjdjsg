"""
Fetch actual wind generation (fuelType=WIND) and wind forecasts
from Elexon BMRS API for January 2026.
"""

import os
import json
import requests

# API Endpoints
FUELHH_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream"
WINDFOR_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream"

# Date intervals to query (in 7-day chunks to stay within API limits)
DATE_RANGES = [
    ("2025-12-31T00:00:00Z", "2026-01-07T23:59:59Z"),  # includes Dec 31 for Jan 1 day-ahead decisions
    ("2026-01-08T00:00:00Z", "2026-01-14T23:59:59Z"),
    ("2026-01-15T00:00:00Z", "2026-01-21T23:59:59Z"),
    ("2026-01-22T00:00:00Z", "2026-01-31T23:59:59Z"),
]

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def fetch_actual_wind():
    """Fetch actual wind generation where fuelType=WIND."""
    print("Fetching actual wind generation (fuelType=WIND)...")
    actuals = []
    
    for start_date, end_date in DATE_RANGES:
        params = {
            "publishDateTimeFrom": start_date,
            "publishDateTimeTo": end_date,
            "fuelType": "WIND"
        }
        resp = requests.get(FUELHH_URL, params=params, timeout=20)
        resp.raise_for_status()
        items = resp.json()
        
        for item in items:
            actuals.append({
                "startTime": item.get("startTime"),
                "settlementDate": item.get("settlementDate"),
                "settlementPeriod": item.get("settlementPeriod"),
                "generation": item.get("generation"),
                "fuelType": item.get("fuelType")
            })
        print(f"  Fetched {len(items)} actuals for {start_date[:10]} to {end_date[:10]}")

    # Remove duplicates if any, sorted by startTime
    unique_actuals = {item["startTime"]: item for item in actuals if item.get("startTime")}
    sorted_actuals = sorted(unique_actuals.values(), key=lambda x: x["startTime"])
    
    # Filter for January 2026 delivery
    jan_actuals = [x for x in sorted_actuals if x["startTime"].startswith("2026-01")]
    print(f"Total unique actual wind records for January 2026: {len(jan_actuals)}")
    return jan_actuals


def fetch_wind_forecasts():
    """Fetch wind generation forecasts."""
    print("Fetching wind forecasts (WINDFOR)...")
    forecasts = []
    
    for start_date, end_date in DATE_RANGES:
        params = {
            "publishDateTimeFrom": start_date,
            "publishDateTimeTo": end_date
        }
        resp = requests.get(WINDFOR_URL, params=params, timeout=20)
        resp.raise_for_status()
        items = resp.json()
        
        for item in items:
            forecasts.append({
                "startTime": item.get("startTime"),
                "publishTime": item.get("publishTime"),
                "generation": item.get("generation")
            })
        print(f"  Fetched {len(items)} forecasts for {start_date[:10]} to {end_date[:10]}")

    # Sort by target startTime then publishTime
    sorted_forecasts = sorted(forecasts, key=lambda x: (x["startTime"], x["publishTime"]))
    
    # Keep forecasts relevant for January 2026 delivery
    jan_forecasts = [x for x in sorted_forecasts if x["startTime"].startswith("2026-01")]
    print(f"Total wind forecasts for January 2026: {len(jan_forecasts)}")
    return jan_forecasts


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # 1. Fetch Actuals
    actuals = fetch_actual_wind()
    actuals_path = os.path.join(DATA_DIR, "actuals_wind_jan2026.json")
    with open(actuals_path, "w", encoding="utf-8") as f:
        json.dump(actuals, f, indent=2)
    print(f"Saved actuals to {actuals_path}")

    # 2. Fetch Forecasts
    forecasts = fetch_wind_forecasts()
    forecasts_path = os.path.join(DATA_DIR, "forecasts_wind_jan2026.json")
    with open(forecasts_path, "w", encoding="utf-8") as f:
        json.dump(forecasts, f, indent=2)
    print(f"Saved forecasts to {forecasts_path}")

    print("Data download completed successfully!")


if __name__ == "__main__":
    main()
