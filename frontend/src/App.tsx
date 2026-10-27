import { useState, useEffect, useCallback } from 'react';
import type { TimeseriesPoint, MetricsResponse } from './types';
import { fetchMarketData } from './utils/marketData';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TimeseriesChart } from './components/TimeseriesChart';
import { ErrorDistributionChart } from './components/ErrorDistributionChart';
import { ThermalCalculator } from './components/ThermalCalculator';
import { MarketInsights } from './components/MarketInsights';
import { Footer } from './components/Footer';

export function App() {
  const [cutoffHour, setCutoffHour] = useState<number>(12); // Default 12:00 GMT on D-1
  const [selectedDate, setSelectedDate] = useState<string>(''); // '' means full month
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Procurement Calculator state
  const [expectedDemand, setExpectedDemand] = useState<number>(25000); // MW
  const [bufferPercentile, setBufferPercentile] = useState<'p50' | 'p90'>('p90');

  // Load data function
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMarketData(cutoffHour, selectedDate);
      setTimeseries(res.timeseries);
      setMetrics(res.metrics);
      setIsLiveApi(res.isLiveApi);
    } catch (err: unknown) {
      console.error('Failed to load market data from Render backend:', err);
      const msg = err instanceof Error ? err.message : 'Unknown backend connection error';
      setError(msg);
      setIsLiveApi(false);
    } finally {
      setLoading(false);
    }
  }, [cutoffHour, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    <div className="app-canvas">
      {/* Outer Glow / Meridian Border Shell */}
      <div className="grid-meridian-shell">
        <div className="dashboard-container">
          {/* 1. Header with Grid Meridian Logo, Brand & Controls */}
          <Header
            cutoffHour={cutoffHour}
            setCutoffHour={setCutoffHour}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            janDates={janDates}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isLiveApi={isLiveApi}
            onRefresh={loadData}
            loading={loading}
          />

          {/* Backend Connection Error Alert */}
          {error && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #f87171',
                borderRadius: '10px',
                padding: '12px 18px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#991b1b',
                fontSize: '13px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <span>
                <strong>Render Backend Error:</strong> {error} &mdash; Backend:{' '}
                <a
                  href="https://dshjdjsg.onrender.com/docs"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#991b1b', textDecoration: 'underline' }}
                >
                  https://dshjdjsg.onrender.com
                </a>
              </span>
              <button
                type="button"
                className="btn btn-sm"
                onClick={loadData}
                style={{ background: '#991b1b', color: '#ffffff' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* 2. Top Executive Metric Cards */}
          {metrics && metrics.summary && <MetricCards summary={metrics.summary} />}

          {/* Tab View: Overview / Dashboard */}
          {(activeTab === 'dashboard' || activeTab === 'forecasts') && (
            <TimeseriesChart
              timeseries={timeseries}
              loading={loading}
              cutoffHour={cutoffHour}
              selectedDate={selectedDate}
            />
          )}

          {/* Bottom Grid: Error Distribution & Thermal Procurement Calculator */}
          {(activeTab === 'dashboard' || activeTab === 'procurement') && (
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
          )}

          {/* Executive Market Insights & Trader Protocol */}
          {metrics && metrics.summary && (
            <MarketInsights summary={metrics.summary} cutoffHour={cutoffHour} />
          )}

          {/* 5. Complete Website Footer */}
          <Footer isLiveApi={isLiveApi} />
        </div>
      </div>
    </div>
  );
}

export default App;
