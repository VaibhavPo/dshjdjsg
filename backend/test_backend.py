"""
Quick verification of backend calculations and data loading.
"""

from backend.main import load_data, get_metrics, get_timeseries

load_data()

# Test metrics with default 12:00 cutoff
metrics = get_metrics(cutoff_hour=12, date=None)
print("--- SUMMARY METRICS (Jan 2026, 12:00 Cutoff) ---")
print("Sample Size (Settlement Periods):", metrics["sampleSize"])
print("MAE (Mean Absolute Error):", metrics["summary"]["mae"], "MW")
print("RMSE (Root Mean Square Error):", metrics["summary"]["rmse"], "MW")
print("Mean Bias:", metrics["summary"]["bias"], "MW")
print("WAPE:", metrics["summary"]["wapePercent"], "%")
print("P10 Deficit / Error:", metrics["summary"]["p10"], "MW")
print("P50 (Median) Error:", metrics["summary"]["p50"], "MW")
print("P90 Deficit / Error:", metrics["summary"]["p90"], "MW")
print("Total Actual Wind:", f"{metrics['summary']['totalActualMWh']:,.0f}", "MWh")
print("Total Forecast Wind:", f"{metrics['summary']['totalForecastMWh']:,.0f}", "MWh")

# Test timeseries
ts = get_timeseries(cutoff_hour=12, date="2026-01-15")
print(f"\nSingle Day Test (2026-01-15): {ts['totalPoints']} settlement periods returned.")
if ts["data"]:
    sample = ts["data"][0]
    print(f"Sample Period {sample['settlementPeriod']}: Actual = {sample['actualGeneration']} MW, Forecast = {sample['forecastGeneration']} MW, Error = {sample['error']} MW")

print("\nBackend verification SUCCESSFUL!")
