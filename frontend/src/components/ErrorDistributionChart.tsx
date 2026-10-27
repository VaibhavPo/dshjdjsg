import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
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
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <TrendingUp size={18} color="#2563eb" />
            Forecast Error Distribution & Risk Quantiles
          </div>
          <div className="panel-desc">
            Frequency distribution of (Forecast &minus; Actual). Positive indicates wind deficit.
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={distribution}
            margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="bin"
              fontSize={11}
              angle={-30}
              textAnchor="end"
              stroke="#94a3b8"
            />
            <YAxis fontSize={11} stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value: any) => [`${value} periods`, 'Occurrences']}
            />
            <ReferenceLine x="0 to 500" stroke="#dc2626" strokeDasharray="3 3" />
            <Bar dataKey="count" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
          fontSize: '12px',
          color: '#64748b',
        }}
      >
        <span>
          P10 (Wind Surplus): <strong>{summary.p10} MW</strong>
        </span>
        <span>
          P50 (Median Deficit): <strong>+{summary.p50} MW</strong>
        </span>
        <span style={{ color: '#1e40af', fontWeight: 600 }}>
          P90 (Tail Risk Deficit): <strong>+{summary.p90} MW</strong>
        </span>
      </div>
    </section>
  );
}
