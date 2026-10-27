import { ShieldCheck, Info } from 'lucide-react';
import type { MetricsSummary } from '../types';

interface ThermalCalculatorProps {
  summary: MetricsSummary;
  expectedDemand: number;
  setExpectedDemand: (demand: number) => void;
  bufferPercentile: 'p50' | 'p90';
  setBufferPercentile: (percentile: 'p50' | 'p90') => void;
  avgForecast: number;
}

export function ThermalCalculator({
  summary,
  expectedDemand,
  setExpectedDemand,
  bufferPercentile,
  setBufferPercentile,
  avgForecast,
}: ThermalCalculatorProps) {
  const chosenBuffer = bufferPercentile === 'p90' ? summary.p90 : summary.p50;
  const unadjustedThermalNeed = Math.max(0, expectedDemand - avgForecast);
  const recommendedThermalProcure = Math.max(0, unadjustedThermalNeed + chosenBuffer);

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <div className="panel-title">
            <ShieldCheck size={18} color="#2563eb" />
            Day-Ahead Thermal Purchase Sizing Calculator
          </div>
          <div className="panel-desc">
            Translates quantified forecast error into actionable thermal power purchase volumes.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label className="control-label" style={{ display: 'block', marginBottom: '6px' }}>
            Total Consumer Demand (MW)
          </label>
          <input
            type="number"
            step="500"
            value={expectedDemand}
            onChange={(e) => setExpectedDemand(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label className="control-label" style={{ display: 'block', marginBottom: '6px' }}>
            Reliability Buffer Target
          </label>
          <select
            value={bufferPercentile}
            onChange={(e) => setBufferPercentile(e.target.value as 'p50' | 'p90')}
            style={{ width: '100%' }}
          >
            <option value="p50">P50 (+{summary.p50} MW - 50% Median)</option>
            <option value="p90">P90 (+{summary.p90} MW - 90% Conservative)</option>
          </select>
        </div>
      </div>

      <div className="calc-box">
        <div className="calc-row">
          <span style={{ fontSize: '13px', color: '#64748b' }}>Expected Renewable Wind Supply:</span>
          <span style={{ fontWeight: 600 }}>{Math.round(avgForecast).toLocaleString()} MW</span>
        </div>
        <div className="calc-row">
          <span style={{ fontSize: '13px', color: '#64748b' }}>Unadjusted Thermal Shortfall (Demand &minus; Wind):</span>
          <span style={{ fontWeight: 600 }}>{Math.round(unadjustedThermalNeed).toLocaleString()} MW</span>
        </div>
        <div className="calc-row">
          <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 500 }}>
            + Quantified Risk Buffer ({bufferPercentile.toUpperCase()}):
          </span>
          <span style={{ fontWeight: 600, color: '#1e40af' }}>
            +{Math.round(chosenBuffer).toLocaleString()} MW
          </span>
        </div>
        <div className="calc-row" style={{ paddingTop: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Recommended Day-Ahead Purchase:
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Total thermal/market orders to place on D-1
            </div>
          </div>
          <div className="calc-highlight">
            {Math.round(recommendedThermalProcure).toLocaleString()} MW
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '12px',
          padding: '10px 14px',
          borderRadius: '8px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}
      >
        <Info size={16} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '12px', color: '#1e40af' }}>
          <strong>Trading Recommendation:</strong> Because January 2026 exhibits an average over-forecast
          bias of <strong>+{summary.bias} MW</strong>, buying solely the unadjusted deficit
          exposes the utility to imbalance penalties. Sizing purchases with the P90 buffer guarantees 90%
          coverage against renewable forecast drops.
        </div>
      </div>
    </section>
  );
}
