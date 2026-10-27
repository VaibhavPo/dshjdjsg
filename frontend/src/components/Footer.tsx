import { ShieldCheck, Activity, Database, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { GridMeridianLogo } from './GridMeridianLogo';

interface FooterProps {
  isLiveApi?: boolean;
}

export function Footer({ isLiveApi = false }: FooterProps) {
  return (
    <footer className="footer-container">
      {/* Top Banner / System Health Bar */}
      <div className="footer-status-bar">
        <div className="status-item">
          <span className="status-indicator-dot pulse"></span>
          <span className="status-text">
            <strong>Backend API:</strong> {isLiveApi ? 'Connected to FastAPI on Render (dshjdjsg.onrender.com)' : 'Connecting to Render Backend...'}
          </span>
        </div>
        <div className="status-meta-group">
          <div className="status-meta-item">
            <Activity size={14} className="status-icon" />
            <span>Target Delivery: <strong>Jan 01 - Jan 31, 2026</strong></span>
          </div>
          <div className="status-meta-item">
            <Database size={14} className="status-icon" />
            <span>Settlement Periods: <strong>1 - 48 (Half-Hourly)</strong></span>
          </div>
          <div className="status-meta-item">
            <CheckCircle2 size={14} className="status-icon text-success" />
            <span>Gate Closure: <strong>D-1 12:00 GMT</strong></span>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="footer-main-grid">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <div className="footer-logo-row">
            <GridMeridianLogo size={28} className="footer-logo" />
            <div className="footer-brand-title">Grid Meridian</div>
          </div>
          <p className="footer-description">
            Enterprise wholesale day-ahead power procurement and renewable uncertainty quantification
            platform. Designed for UK energy utilities participating in EPEX SPOT and Elexon BMRS
            settlement mechanisms.
          </p>
          <div className="footer-pills">
            <span className="footer-pill">Elexon BMRS API</span>
            <span className="footer-pill">EPEX SPOT Day-Ahead</span>
            <span className="footer-pill">BSC P219 Standard</span>
          </div>
        </div>

        {/* Column 2: Market Datasets */}
        <div className="footer-col">
          <h4 className="footer-heading">
            <Database size={16} /> Market Datasets
          </h4>
          <ul className="footer-links">
            <li>
              <a
                href="https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream"
                target="_blank"
                rel="noreferrer"
              >
                <span>FUELHH (Actual Wind Generation)</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a
                href="https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream"
                target="_blank"
                rel="noreferrer"
              >
                <span>WINDFOR (Day-Ahead Forecasts)</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a
                href="https://www.elexon.co.uk/bmrs-api/"
                target="_blank"
                rel="noreferrer"
              >
                <span>Elexon BMRS API Documentation</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a
                href="https://www.nationalgrideso.com/data-portal"
                target="_blank"
                rel="noreferrer"
              >
                <span>National Grid ESO Portal</span>
                <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Quant Methodology */}
        <div className="footer-col">
          <h4 className="footer-heading">
            <ShieldCheck size={16} /> Decision Framework
          </h4>
          <ul className="footer-links">
            <li>
              <a href="#thermal-calc">
                <span>D-1 12:00 Gate Procurement Sizing</span>
              </a>
            </li>
            <li>
              <a href="#timeseries-chart">
                <span>Forecast vs. Actuals Evaluation</span>
              </a>
            </li>
            <li>
              <a href="#error-dist">
                <span>P10 / P50 / P90 Quantile Risk Buffers</span>
              </a>
            </li>
            <li>
              <a href="#market-insights">
                <span>Imbalance Cashout Penalty Mitigation</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Platform Specs */}
        <div className="footer-col">
          <h4 className="footer-heading">
            <FileText size={16} /> Technical Lead Review
          </h4>
          <div className="tech-review-card">
            <div className="tech-row">
              <span className="tech-label">Architecture</span>
              <span className="tech-val">React 19 + TypeScript + Vite</span>
            </div>
            <div className="tech-row">
              <span className="tech-label">Backend Engine</span>
              <span className="tech-val">Python FastAPI + Elexon Ingest</span>
            </div>
            <div className="tech-row">
              <span className="tech-label">Design System</span>
              <span className="tech-val">Grid Meridian Core</span>
            </div>
            <div className="tech-row">
              <span className="tech-label">Deployment</span>
              <span className="tech-val">Docker Containerized + Vercel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Grid Meridian Analytics Ltd. UK Wholesale Energy Trading Division. All rights reserved.
        </div>
        <div className="footer-legal-links">
          <span>Confidential Energy Utility Evaluation</span>
          <span>&bull;</span>
          <span>Elexon Open License Data</span>
          <span>&bull;</span>
          <span className="font-mono">v4.2.1-prod</span>
        </div>
      </div>
    </footer>
  );
}
