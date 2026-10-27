import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Zap, Download } from 'lucide-react';
import type { TimeseriesPoint } from '../types';

interface TimeseriesChartProps {
  timeseries: TimeseriesPoint[];
  loading: boolean;
  cutoffHour: number;
  selectedDate: string;
}

export function TimeseriesChart({
  timeseries,
  loading,
  cutoffHour,
  selectedDate,
}: TimeseriesChartProps) {
  // Format date helper
  const formatTimeLabel = (val: string) => {
    try {
      const d = new Date(val);
      if (selectedDate) {
        return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
      }
      return `${d.getUTCDate()} Jan`;
    } catch {
      return val;
    }
  };

  // CSV export helper
  const handleExportCSV = () => {
    if (!timeseries || timeseries.length === 0) return;
    const headers = 'Start Time,Settlement Date,Settlement Period,Actual (MW),Forecast (MW),Error (MW)\n';
    const rows = timeseries
      .map(
        (p) =>
          `"${p.startTime}","${p.settlementDate}",${p.settlementPeriod},${p.actualGeneration},${p.forecastGeneration},${p.error}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GridMeridian_Timeseries_${selectedDate || 'Jan2026'}_Cutoff${cutoffHour}h.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="panel-card timeseries-panel" id="timeseries-chart">
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-title">
            <Zap size={20} className="icon-primary" />
            <span>Actual Wind Generation vs. Day-Ahead Decision Forecast</span>
            <span className="badge badge-primary font-mono">D-1 {cutoffHour}:00 Gate</span>
          </div>
          <div className="panel-desc">
            Comparing UK National Grid wind actuals (FUELHH) with the latest forecast published before the{' '}
            <strong>{cutoffHour}:00 GMT</strong> wholesale auction gate.
          </div>
        </div>

        {/* Legend & Action Controls */}
        <div className="panel-actions-group">
          <div className="chart-legend-custom">
            <div className="legend-item">
              <span className="legend-indicator" style={{ backgroundColor: '#0D5C75' }}></span>
              <span className="legend-text">Actual Wind (MW)</span>
            </div>
            <div className="legend-item">
              <span className="legend-indicator" style={{ backgroundColor: '#B45309' }}></span>
              <span className="legend-text">Day-Ahead Forecast (MW)</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outlined btn-sm"
            onClick={handleExportCSV}
            title="Export CSV data"
          >
            <Download size={13} />
            <span className="btn-text">Export CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="chart-loading-state">
          <div className="spinner"></div>
          <p>Processing Elexon BMRS half-hourly settlement periods...</p>
        </div>
      ) : timeseries.length === 0 ? (
        <div className="chart-empty-state">
          <p>No settlement periods available for the specified criteria.</p>
        </div>
      ) : (
        <div className="chart-container" style={{ width: '100%', height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timeseries}
              margin={{ top: 12, right: 24, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} vertical={false} />
              <XAxis
                dataKey="startTime"
                tickFormatter={formatTimeLabel}
                stroke="#5A6578"
                fontSize={12}
                fontFamily="JetBrains Mono"
                tickLine={false}
                dy={8}
                interval={selectedDate ? 3 : 'preserveStartEnd'}
              />
              <YAxis
                stroke="#5A6578"
                fontSize={12}
                fontFamily="JetBrains Mono"
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
                unit=" MW"
                dx={-6}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload as TimeseriesPoint;
                    const err = pt.error;
                    return (
                      <div className="custom-tooltip">
                        <div className="tooltip-title font-mono">
                          {new Date(pt.startTime).toUTCString().replace(' GMT', '')} UTC
                        </div>
                        <div className="tooltip-period font-mono">
                          Settlement Period #{pt.settlementPeriod} (30 mins)
                        </div>
                        <div className="tooltip-row">
                          <span className="tooltip-label">
                            <span className="tooltip-dot" style={{ backgroundColor: '#0D5C75' }}></span>
                            Actual Wind:
                          </span>
                          <span className="tooltip-value font-mono">
                            {pt.actualGeneration.toLocaleString()} MW
                          </span>
                        </div>
                        <div className="tooltip-row">
                          <span className="tooltip-label">
                            <span className="tooltip-dot" style={{ backgroundColor: '#B45309' }}></span>
                            Day-Ahead Forecast:
                          </span>
                          <span className="tooltip-value font-mono">
                            {pt.forecastGeneration.toLocaleString()} MW
                          </span>
                        </div>
                        <div className="tooltip-divider"></div>
                        <div className="tooltip-row highlight-row">
                          <span className="tooltip-label">Forecast Error (F &minus; A):</span>
                          <span
                            className="tooltip-value font-mono"
                            style={{ color: err > 0 ? '#B45309' : '#0D5C75' }}
                          >
                            {err > 0 ? `+${err.toLocaleString()}` : err.toLocaleString()} MW
                          </span>
                        </div>
                        <div className="tooltip-footer">
                          {err > 0
                            ? '⚠️ Over-forecast: Requires thermal backup to prevent shortfall'
                            : '⚡ Under-forecast: Renewable surplus on the system'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="actualGeneration"
                name="Actual Wind"
                stroke="#0D5C75"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: '#0D5C75', stroke: '#ffffff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="forecastGeneration"
                name="Day-Ahead Forecast"
                stroke="#B45309"
                strokeWidth={2.2}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 6, fill: '#B45309', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Info Strip */}
      <div className="chart-footer-meta">
        <span className="meta-item">
          Data Points: <strong className="font-mono">{timeseries.length}</strong> settlement periods
        </span>
        <span className="meta-separator">&bull;</span>
        <span className="meta-item">
          Resolution: <strong className="font-mono">Half-Hourly (30m)</strong>
        </span>
        <span className="meta-separator">&bull;</span>
        <span className="meta-item">
          Delivery Date: <strong className="font-mono">{selectedDate || 'Entire January 2026 (31 Days)'}</strong>
        </span>
      </div>
    </section>
  );
}
