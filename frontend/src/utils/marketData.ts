import type { TimeseriesPoint, MetricsResponse } from '../types';

// Use Render backend as base URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://dshjdjsg.onrender.com';

/**
 * Fetch timeseries and metrics directly from the Python FastAPI backend on Render.
 */
export async function fetchMarketData(
  cutoffHour: number,
  selectedDate: string
): Promise<{ timeseries: TimeseriesPoint[]; metrics: MetricsResponse; isLiveApi: boolean }> {
  const queryParams = new URLSearchParams({
    cutoff_hour: cutoffHour.toString(),
    ...(selectedDate ? { date: selectedDate } : {}),
  });

  // Fetch directly from live backend
  const [tsRes, mRes] = await Promise.all([
    fetch(`${API_BASE}/api/timeseries?${queryParams}`),
    fetch(`${API_BASE}/api/metrics?${queryParams}`),
  ]);

  if (!tsRes.ok || !mRes.ok) {
    throw new Error(
      `Backend API error: timeseries status ${tsRes.status}, metrics status ${mRes.status}`
    );
  }

  const tsData = await tsRes.json();
  const mData = await mRes.json();

  return {
    timeseries: tsData.data || [],
    metrics: mData,
    isLiveApi: true,
  };
}
