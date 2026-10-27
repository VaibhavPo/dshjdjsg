import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Zap } from 'lucide-react';
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
  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <Zap size={18} color="#2563eb" />
            Actual Generation vs. Day-Ahead Decision Forecast (Jan 2026)
          </div>
          <div className="panel-desc">
            Comparing actual wind power with the latest forecast published before the{' '}
            {cutoffHour}:00 GMT D-1 decision gate.
          </div>
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#059669' }}></span>
            <span>Actual Wind (MW)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#2563eb' }}></span>
            <span>Day-Ahead Forecast (MW)</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          Loading market data from Elexon...
        </div>
      ) : timeseries.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          No data available for this selection.
        </div>
      ) : (
        <div style={{ width: '100%', height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timeseries}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="startTime"
                tickFormatter={(val: string) => {
                  const d = new Date(val);
                  return selectedDate
                    ? `${d.getUTCHours().toString().padStart(2, '0')}:00`
                    : `${d.getUTCDate()} Jan`;
                }}
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
                unit=" MW"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload as TimeseriesPoint;
                    return (
                      <div
                        style={{
                          background: '#ffffff',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                          fontSize: '13px',
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '6px', color: '#0f172a' }}>
                          {new Date(pt.startTime).toUTCString().slice(0, 22)}
                        </div>
                        <div style={{ color: '#059669', marginBottom: '2px' }}>
                          &bull; Actual Wind: <strong>{pt.actualGeneration.toLocaleString()} MW</strong>
                        </div>
                        <div style={{ color: '#2563eb', marginBottom: '4px' }}>
                          &bull; Day-Ahead Forecast:{' '}
                          <strong>{pt.forecastGeneration.toLocaleString()} MW</strong>
                        </div>
                        <div style={{ color: pt.error > 0 ? '#b45309' : '#059669' }}>
                          &bull; Error (F - A):{' '}
                          <strong>
                            {pt.error > 0 ? `+${pt.error.toLocaleString()}` : pt.error.toLocaleString()} MW
                          </strong>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '6px' }}>
                          Forecast published on D-1:{' '}
                          {new Date(pt.publishTime).toUTCString().slice(0, 22)}
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
                stroke="#059669"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="forecastGeneration"
                name="Day-Ahead Forecast"
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
