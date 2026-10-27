import {
  AlertTriangle,
  Scale,
  Lightbulb,
  CheckCircle,
  Layers,
} from 'lucide-react';
import type { MetricsSummary } from '../types';

interface MarketInsightsProps {
  summary: MetricsSummary;
  cutoffHour: number;
}

export function MarketInsights({ summary, cutoffHour }: MarketInsightsProps) {
  return (
    <section className="panel-card market-insights-card" id="market-insights">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <Lightbulb size={20} className="icon-tertiary" />
            <span>UK Wholesale Market Insights & Executive Trading Brief</span>
            <span className="badge badge-tertiary font-mono">January 2026 Analysis</span>
          </div>
          <div className="panel-desc">
            Quantified forecast risk translated into wholesale day-ahead trading strategy and imbalance cost mitigation.
          </div>
        </div>
      </div>

      <div className="insights-grid">
        {/* Insight Card 1 */}
        <div className="insight-item">
          <div className="insight-header">
            <div className="insight-icon-box bg-tertiary-tint">
              <AlertTriangle size={18} className="text-tertiary" />
            </div>
            <h4>Systematic Over-Forecast Bias</h4>
          </div>
          <p className="insight-body">
            Across January 2026 at the {cutoffHour}:00 D-1 gate, day-ahead wind forecasts exhibited an average bias of{' '}
            <strong className="text-tertiary font-mono">+{summary.bias.toLocaleString()} MW</strong>. The forecasting model
            routinely anticipated more wind generation than was actually delivered to the transmission grid.
          </p>
          <div className="insight-callout">
            <span className="callout-label font-mono">Commercial Risk:</span>
            <span>
              If a utility procures only the unadjusted thermal deficit, it will face structural real-time shortfalls,
              paying punitive <em>System Buy Price (SBP)</em> cashout penalties in the Balancing Mechanism.
            </span>
          </div>
        </div>

        {/* Insight Card 2 */}
        <div className="insight-item">
          <div className="insight-header">
            <div className="insight-icon-box bg-primary-tint">
              <Scale size={18} className="text-primary" />
            </div>
            <h4>Asymmetric Risk & P90 Buffering</h4>
          </div>
          <p className="insight-body">
            In power markets, the cost of being short during peak demand (high cashout or emergency peaker dispatch)
            is typically <strong>3x to 5x higher</strong> than the cost of carrying surplus power (which can be sold intraday
            or curtailed).
          </p>
          <div className="insight-callout">
            <span className="callout-label font-mono">Recommendation:</span>
            <span>
              Contracting a <strong>P90 Reserve Buffer of +{summary.p90.toLocaleString()} MW</strong> shields the utility against
              90% of renewable drops, transforming volatile cashout exposure into predictable day-ahead forward pricing.
            </span>
          </div>
        </div>

        {/* Insight Card 3 */}
        <div className="insight-item">
          <div className="insight-header">
            <div className="insight-icon-box bg-secondary-tint">
              <Layers size={18} className="text-secondary" />
            </div>
            <h4>Gate Closure Sensitivity</h4>
          </div>
          <p className="insight-body">
            Moving the decision gate from <strong>09:00 GMT</strong> to the standard <strong>12:00 GMT</strong> window
            reduces MAE from ~2,127 MW to {summary.mae.toLocaleString()} MW (a ~6% forecast improvement as latest ECMWF
            numerical weather prediction runs integrate into Elexon feeds).
          </p>
          <div className="insight-callout">
            <span className="callout-label font-mono">EPEX SPOT Strategy:</span>
            <span>
              Submit preliminary orders based on 09:00 runs, but finalize bid envelopes using 11:00&ndash;12:00 BMRS updates
              before the 12:00 day-ahead auction deadline.
            </span>
          </div>
        </div>
      </div>

      {/* Trader Workflow Checklist */}
      <div className="trader-checklist-box">
        <div className="checklist-title-row">
          <CheckCircle size={16} className="text-primary" />
          <span className="font-semibold">Day-Ahead Trading Desk Execution Protocol</span>
        </div>
        <div className="checklist-items">
          <div className="check-item">
            <span className="check-num font-mono">01</span>
            <div>
              <strong>10:30 GMT:</strong> Ingest latest Elexon WINDFOR stream and check systemic bias against recent actuals.
            </div>
          </div>
          <div className="check-item">
            <span className="check-num font-mono">02</span>
            <div>
              <strong>11:15 GMT:</strong> Run Grid Meridian Thermal Sizing Calculator with updated consumer demand curve.
            </div>
          </div>
          <div className="check-item">
            <span className="check-num font-mono">03</span>
            <div>
              <strong>11:45 GMT:</strong> Submit Day-Ahead wholesale purchase orders incorporating P90 buffer into EPEX SPOT auction.
            </div>
          </div>
          <div className="check-item">
            <span className="check-num font-mono">04</span>
            <div>
              <strong>14:00 GMT:</strong> Rebalance residual variance in continuous intraday market as delivery approaches.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
