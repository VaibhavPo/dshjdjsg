import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import type { DistributionBin, MetricsSummary } from '../types';

interface ErrorDistributionChartProps {
  distribution: DistributionBin[];
  summary: MetricsSummary;
}

export function ErrorDistributionChart({
  distribution,
  summary,
}: ErrorDistributionChartProps) {
  return (
    <section className="panel-card error-distribution-panel" id="error-dist">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <BarChart2 size={20} className="icon-secondary" />
            <span>Forecast Error Distribution & Asymmetric Risk Profile</span>
          </div>
          <div className="panel-desc">
            Histogram of (Forecast &minus; Actual). Positive bins (right of 0) indicate renewable shortfall requiring thermal power.
          </div>
        </div>
      </div>

      <div className="chart-container" style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={distribution}
            margin={{ top: 14, right: 14, left: -10, bottom: 44 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} vertical={false} />
            <XAxis
              dataKey="bin"
              fontSize={11}
              fontFamily="JetBrains Mono"
              angle={-32}
              textAnchor="end"
              stroke="#5A6578"
              interval={0}
              height={45}
            />
            <YAxis
              fontSize={11}
              fontFamily="JetBrains Mono"
              stroke="#5A6578"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DistributionBin;
                  const isPositive = !data.bin.startsWith('-');
                  return (
                    <div className="custom-tooltip font-mono">
                      <div className="tooltip-title">Bin: {data.bin} MW</div>
                      <div className="tooltip-row">
                        <span className="tooltip-label">Occurrences:</span>
                        <span className="tooltip-value font-bold">{data.count} periods</span>
                      </div>
                      <div className="tooltip-footer">
                        {isPositive
                          ? 'Deficit: Wind was lower than forecasted'
                          : 'Surplus: Wind was higher than forecasted'}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {distribution.map((entry, index) => {
                const isShortfall = !entry.bin.startsWith('-');
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isShortfall ? '#0D5C75' : '#8ba6d4'}
                    opacity={isShortfall ? 0.95 : 0.75}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quantile Summary Strip */}
      <div className="quantile-stats-strip">
        <div className="quantile-item">
          <span className="quantile-label">P10 (Wind Surplus):</span>
          <span className="quantile-val font-mono">{summary.p10.toLocaleString()} MW</span>
        </div>
        <div className="quantile-item">
          <span className="quantile-label">P50 (Median Shortfall):</span>
          <span className="quantile-val font-mono text-tertiary">+{summary.p50.toLocaleString()} MW</span>
        </div>
        <div className="quantile-item highlight-p90">
          <span className="quantile-label">P90 (Tail-Risk Hedge):</span>
          <span className="quantile-val font-mono text-primary font-bold">+{summary.p90.toLocaleString()} MW</span>
        </div>
      </div>
    </section>
  );
}
