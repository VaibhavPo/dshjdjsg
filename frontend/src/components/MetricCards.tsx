import { TrendingUp, Zap, AlertTriangle, ShieldCheck, Wind } from 'lucide-react';
import type { MetricsSummary } from '../types';

interface MetricCardsProps {
  summary: MetricsSummary;
}

export function MetricCards({ summary }: MetricCardsProps) {
  return (
    <section className="metrics-grid" aria-label="Quantitative Risk Metrics">
      {/* 1. Mean Absolute Error */}
      <div className="metric-card">
        <div className="metric-label">
          <span>Mean Absolute Error</span>
          <div className="metric-icon-badge bg-primary-tint">
            <TrendingUp size={16} className="text-primary" />
          </div>
        </div>
        <div className="metric-value font-mono">
          {summary.mae.toLocaleString()} <span className="metric-unit">MW</span>
        </div>
        <div className="metric-sub">
          <span className="badge badge-primary font-mono">WAPE {summary.wapePercent}%</span>
          <span className="metric-note">of total actual generation</span>
        </div>
      </div>

      {/* 2. Root Mean Squared Error */}
      <div className="metric-card">
        <div className="metric-label">
          <span>Root Mean Sq. Error</span>
          <div className="metric-icon-badge bg-secondary-tint">
            <Zap size={16} className="text-secondary" />
          </div>
        </div>
        <div className="metric-value font-mono">
          {summary.rmse.toLocaleString()} <span className="metric-unit">MW</span>
        </div>
        <div className="metric-sub">
          <span className="badge badge-secondary font-mono">High Penalty</span>
          <span className="metric-note">Weights large forecast drops</span>
        </div>
      </div>

      {/* 3. Systematic Over-Forecast Bias */}
      <div className="metric-card">
        <div className="metric-label">
          <span>Systematic Bias</span>
          <div className="metric-icon-badge bg-tertiary-tint">
            <AlertTriangle size={16} className="text-tertiary" />
          </div>
        </div>
        <div className="metric-value font-mono text-tertiary">
          +{summary.bias.toLocaleString()} <span className="metric-unit">MW</span>
        </div>
        <div className="metric-sub">
          <span className="badge badge-tertiary font-mono">Over-Forecasted</span>
          <span className="metric-note">Structural thermal shortfall risk</span>
        </div>
      </div>

      {/* 4. P90 Downside Reserve Buffer */}
      <div className="metric-card card-highlight">
        <div className="metric-label">
          <span>P90 Reserve Buffer</span>
          <div className="metric-icon-badge bg-primary-tint">
            <ShieldCheck size={16} className="text-primary" />
          </div>
        </div>
        <div className="metric-value font-mono text-primary">
          +{summary.p90.toLocaleString()} <span className="metric-unit">MW</span>
        </div>
        <div className="metric-sub">
          <span className="badge badge-green font-mono">90% Confidence</span>
          <span className="metric-note">Recommended purchase hedge</span>
        </div>
      </div>

      {/* 5. Total Wind Energy Generated */}
      <div className="metric-card">
        <div className="metric-label">
          <span>Total Wind Energy</span>
          <div className="metric-icon-badge bg-neutral-tint">
            <Wind size={16} className="text-neutral" />
          </div>
        </div>
        <div className="metric-value font-mono">
          {(summary.totalActualMWh / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="metric-unit">GWh</span>
        </div>
        <div className="metric-sub">
          <span className="font-mono text-muted">
            Fcast: {(summary.totalForecastMWh / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} GWh
          </span>
        </div>
      </div>
    </section>
  );
}
