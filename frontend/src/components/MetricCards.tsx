import { TrendingUp, Zap, AlertTriangle, ShieldCheck, Wind } from 'lucide-react';
import type { MetricsSummary } from '../types';

interface MetricCardsProps {
  summary: MetricsSummary;
}

export function MetricCards({ summary }: MetricCardsProps) {
  return (
    <section className="metrics-grid">
      <div className="metric-card">
        <div className="metric-label">
          <span>Mean Absolute Error</span>
          <TrendingUp size={16} color="#64748b" />
        </div>
        <div className="metric-value">{summary.mae.toLocaleString()} MW</div>
        <div className="metric-sub">
          WAPE: <strong>{summary.wapePercent}%</strong> of generation
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">
          <span>Root Mean Sq. Error</span>
          <Zap size={16} color="#64748b" />
        </div>
        <div className="metric-value">{summary.rmse.toLocaleString()} MW</div>
        <div className="metric-sub">Penalizes extreme forecast misses</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">
          <span>Systematic Bias</span>
          <AlertTriangle size={16} color={summary.bias > 0 ? '#d97706' : '#059669'} />
        </div>
        <div
          className="metric-value"
          style={{ color: summary.bias > 0 ? '#b45309' : '#059669' }}
        >
          +{summary.bias.toLocaleString()} MW
        </div>
        <div className="metric-sub">
          {summary.bias > 0
            ? '⚠️ Over-forecasted wind (thermal shortfall risk)'
            : 'Wind under-forecasted'}
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">
          <span>P90 Reserve Buffer</span>
          <ShieldCheck size={16} color="#2563eb" />
        </div>
        <div className="metric-value" style={{ color: '#1d4ed8' }}>
          +{summary.p90.toLocaleString()} MW
        </div>
        <div className="metric-sub">90% confidence downside protection</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">
          <span>Total Wind Energy</span>
          <Wind size={16} color="#64748b" />
        </div>
        <div className="metric-value">
          {(summary.totalActualMWh / 1000).toFixed(0)}k MWh
        </div>
        <div className="metric-sub">
          Forecast: {(summary.totalForecastMWh / 1000).toFixed(0)}k MWh
        </div>
      </div>
    </section>
  );
}
