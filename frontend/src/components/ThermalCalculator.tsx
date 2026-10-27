import { useState } from 'react';
import { Info, Check, Copy, Flame } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const chosenBuffer = bufferPercentile === 'p90' ? summary.p90 : summary.p50;
  const unadjustedThermalNeed = Math.max(0, expectedDemand - avgForecast);
  const recommendedThermalProcure = Math.max(0, unadjustedThermalNeed + chosenBuffer);

  const handleCopy = () => {
    const text = `Grid Meridian Day-Ahead Recommendation:
Consumer Demand: ${expectedDemand.toLocaleString()} MW
Expected Wind: ${Math.round(avgForecast).toLocaleString()} MW
Unadjusted Deficit: ${Math.round(unadjustedThermalNeed).toLocaleString()} MW
${bufferPercentile.toUpperCase()} Risk Buffer: +${Math.round(chosenBuffer).toLocaleString()} MW
Recommended Thermal Purchase: ${Math.round(recommendedThermalProcure).toLocaleString()} MW`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="panel-card thermal-calculator-panel" id="thermal-calc">
      <div className="panel-header">
        <div className="panel-title-group">
          <div className="panel-title">
            <Flame size={20} className="icon-tertiary" />
            <span>Day-Ahead Thermal Purchase Sizing Calculator</span>
            <span className="badge badge-primary font-mono">Wholesale Sizing</span>
          </div>
          <div className="panel-desc">
            Translates quantified renewable forecast error into actionable thermal purchase order volumes for EPEX SPOT.
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleCopy}
          title="Copy Order Summary"
        >
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy Recommendation'}</span>
        </button>
      </div>

      {/* Preset Demand Scenarios */}
      <div className="calculator-presets-bar">
        <span className="preset-title font-mono">Demand Scenarios:</span>
        <div className="btn-group">
          <button
            type="button"
            className={`btn btn-sm ${expectedDemand === 32000 ? 'btn-primary' : 'btn-outlined'}`}
            onClick={() => setExpectedDemand(32000)}
          >
            Winter Peak (32 GW)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${expectedDemand === 25000 ? 'btn-primary' : 'btn-outlined'}`}
            onClick={() => setExpectedDemand(25000)}
          >
            Average Day (25 GW)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${expectedDemand === 18000 ? 'btn-primary' : 'btn-outlined'}`}
            onClick={() => setExpectedDemand(18000)}
          >
            Mild / Weekend (18 GW)
          </button>
        </div>
      </div>

      {/* User Inputs Grid */}
      <div className="calc-inputs-grid">
        <div className="input-group">
          <label htmlFor="demand-input" className="control-label">
            Total Consumer Demand (MW)
          </label>
          <div className="input-with-unit">
            <input
              id="demand-input"
              type="number"
              step="500"
              min="0"
              value={expectedDemand}
              onChange={(e) => setExpectedDemand(Math.max(0, Number(e.target.value)))}
              className="calc-input font-mono"
            />
            <span className="input-unit font-mono">MW</span>
          </div>
          <input
            type="range"
            min="10000"
            max="45000"
            step="500"
            value={expectedDemand}
            onChange={(e) => setExpectedDemand(Number(e.target.value))}
            className="range-slider"
          />
        </div>

        <div className="input-group">
          <label htmlFor="buffer-select" className="control-label">
            Risk Buffer Confidence Target
          </label>
          <select
            id="buffer-select"
            value={bufferPercentile}
            onChange={(e) => setBufferPercentile(e.target.value as 'p50' | 'p90')}
            className="calc-input font-mono"
          >
            <option value="p50">P50 (+{Math.round(summary.p50)} MW &mdash; 50% Median Shortfall)</option>
            <option value="p90">P90 (+{Math.round(summary.p90)} MW &mdash; 90% Conservative Hedge)</option>
          </select>
          <div className="input-hint">
            {bufferPercentile === 'p90'
              ? '🛡️ Shields utility against 90% of renewable drops'
              : '⚖️ Symmetric median buffer (carries 50% shortfall risk)'}
          </div>
        </div>
      </div>

      {/* Breakdown Computation Card */}
      <div className="calc-box">
        <div className="calc-row">
          <span className="calc-row-label">Expected Renewable Wind Supply:</span>
          <span className="calc-row-val font-mono">
            {Math.round(avgForecast).toLocaleString()} MW
          </span>
        </div>

        <div className="calc-row">
          <span className="calc-row-label">
            Unadjusted Thermal Shortfall <span className="formula-tag">(Demand &minus; Wind)</span>:
          </span>
          <span className="calc-row-val font-mono">
            {Math.round(unadjustedThermalNeed).toLocaleString()} MW
          </span>
        </div>

        <div className="calc-row buffer-row">
          <span className="calc-row-label text-primary font-semibold">
            + Quantified Forecast Error Buffer ({bufferPercentile.toUpperCase()}):
          </span>
          <span className="calc-row-val font-mono text-primary font-bold">
            +{Math.round(chosenBuffer).toLocaleString()} MW
          </span>
        </div>

        <div className="calc-divider"></div>

        <div className="calc-highlight-row">
          <div className="highlight-desc">
            <div className="highlight-title">Recommended Day-Ahead Thermal Purchase:</div>
            <div className="highlight-sub">
              Total wholesale forward orders to execute at D-1 12:00 Gate
            </div>
          </div>
          <div className="calc-highlight-value font-mono">
            {Math.round(recommendedThermalProcure).toLocaleString()} <span className="highlight-unit">MW</span>
          </div>
        </div>
      </div>

      {/* Commercial Trading Guidance Note */}
      <div className="advisory-box">
        <div className="advisory-icon-wrapper">
          <Info size={18} className="text-primary" />
        </div>
        <div className="advisory-content">
          <strong>EPEX SPOT Procurement Strategy:</strong> Because January 2026 exhibited a persistent
          over-forecast bias of <span className="font-mono text-tertiary">+{summary.bias} MW</span>, purchasing solely the
          unadjusted deficit exposes the supplier to punitive Balancing Mechanism cashout charges.
          Sizing Day-Ahead purchases with the <span className="font-mono text-primary">P90 buffer (+{summary.p90} MW)</span> guarantees
          90% confidence against renewable shortfall penalties.
        </div>
      </div>
    </section>
  );
}
