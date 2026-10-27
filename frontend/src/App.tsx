import { useState, useEffect } from 'react';
import type { TimeseriesPoint, MetricsResponse } from './types';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TimeseriesChart } from './components/TimeseriesChart';
import { ErrorDistributionChart } from './components/ErrorDistributionChart';
import { ThermalCalculator } from './components/ThermalCalculator';

// API base URL (uses VITE_API_URL if deployed, or relative path / Vite proxy locally)
const API_BASE = import.meta.env.VITE_API_URL || '';

export function App() {
  const [cutoffHour, setCutoffHour] = useState<number>(12); // Default 12:00 GMT on D-1
  const [selectedDate, setSelectedDate] = useState<string>(''); // '' means full month
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Procurement Calculator state
  const [expectedDemand, setExpectedDemand] = useState<number>(25000); // MW
  const [bufferPercentile, setBufferPercentile] = useState<'p50' | 'p90'>('p90');

  // Fetch data whenever cutoffHour or selectedDate changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          cutoff_hour: cutoffHour.toString(),
          ...(selectedDate ? { date: selectedDate } : {}),
        });

        // 1. Fetch timeseries
        const tsRes = await fetch(`${API_BASE}/api/timeseries?${queryParams}`);
        const tsData = await tsRes.json();
        setTimeseries(tsData.data || []);

        // 2. Fetch metrics
        const mRes = await fetch(`${API_BASE}/api/metrics?${queryParams}`);
        const mData = await mRes.json();
        setMetrics(mData);
      } catch (err) {
        console.error('Failed to load market data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [cutoffHour, selectedDate]);

  // Generate list of dates for January 2026 selector
  const janDates = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    return `2026-01-${day}`;
  });

  // Calculate average forecast generation for the procurement calculator
  const avgForecast =
    timeseries.length > 0
      ? timeseries.reduce((acc, cur) => acc + cur.forecastGeneration, 0) / timeseries.length
      : 0;

  return (
    <div className="dashboard-container">
      {/* 1. Top Header & Global Filters */}
      <Header
        cutoffHour={cutoffHour}
        setCutoffHour={setCutoffHour}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        janDates={janDates}
      />

      {/* 2. Top Metric Cards */}
      {metrics && metrics.summary && <MetricCards summary={metrics.summary} />}

      {/* 3. Main Timeseries Chart */}
      <TimeseriesChart
        timeseries={timeseries}
        loading={loading}
        cutoffHour={cutoffHour}
        selectedDate={selectedDate}
      />

      {/* 4. Bottom Grid: Error Distribution & Thermal Procurement Calculator */}
      <div className="two-col-grid">
        {metrics && metrics.summary && metrics.distribution && (
          <ErrorDistributionChart
            distribution={metrics.distribution}
            summary={metrics.summary}
          />
        )}

        {metrics && metrics.summary && (
          <ThermalCalculator
            summary={metrics.summary}
            expectedDemand={expectedDemand}
            setExpectedDemand={setExpectedDemand}
            bufferPercentile={bufferPercentile}
            setBufferPercentile={setBufferPercentile}
            avgForecast={avgForecast}
          />
        )}
      </div>
    </div>
  );
}

export default App;
