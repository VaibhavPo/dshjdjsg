import React from 'react';
import {
  Clock,
  Calendar,
  Search,
  Home,
  BarChart3,
  Calculator,
  RefreshCw,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { GridMeridianLogo } from './GridMeridianLogo';

interface HeaderProps {
  cutoffHour: number;
  setCutoffHour: (hour: number) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  janDates: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLiveApi: boolean;
  onRefresh: () => void;
  loading: boolean;
}

export function Header({
  cutoffHour,
  setCutoffHour,
  selectedDate,
  setSelectedDate,
  janDates,
  activeTab,
  setActiveTab,
  isLiveApi,
  onRefresh,
  loading,
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Handle date search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSelectedDate('');
      return;
    }
    const clean = searchTerm.trim().toLowerCase();
    // Check if user entered a day number like "10" or "jan 10" or full date "2026-01-10"
    const match = clean.match(/\b([1-9]|[12][0-9]|3[01])\b/);
    if (match) {
      const day = match[1].padStart(2, '0');
      setSelectedDate(`2026-01-${day}`);
    } else {
      const found = janDates.find((d) => d.includes(clean));
      if (found) setSelectedDate(found);
    }
  };

  return (
    <header className="header-wrapper">
      {/* Topmost Brand & Navigation Row */}
      <div className="header-top-row">
        {/* Brand Group with Logo */}
        <div className="brand-group">
          <div className="logo-container">
            <GridMeridianLogo size={36} className="brand-logo-svg" />
          </div>
          <div className="brand-text">
            <div className="brand-title-wrap">
              <span className="brand-title">Grid Meridian</span>
              <span className="badge badge-primary font-mono">v4.2 PROD</span>
              <span className={`badge ${isLiveApi ? 'badge-green' : 'badge-amber'} font-mono`}>
                {isLiveApi ? 'Render Backend (Live)' : 'Connecting to API...'}
              </span>
            </div>
            <p className="brand-subtitle">
              UK Day-Ahead Renewable Generation Forecasting & Thermal Procurement Engine
            </p>
          </div>
        </div>

        {/* Center Pill Navigation Bar (from Design System) */}
        <nav className="nav-pill-bar" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-pill-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title="Executive Dashboard"
          >
            <div className="nav-pill-icon-box">
              <Home size={16} />
            </div>
            <span className="nav-pill-text">Overview</span>
          </button>

          <button
            type="button"
            className={`nav-pill-item ${activeTab === 'forecasts' ? 'active' : ''}`}
            onClick={() => setActiveTab('forecasts')}
            title="Timeseries Forecast vs Actuals"
          >
            <div className="nav-pill-icon-box">
              <BarChart3 size={16} />
            </div>
            <span className="nav-pill-text">Forecasts</span>
          </button>

          <button
            type="button"
            className={`nav-pill-item ${activeTab === 'procurement' ? 'active' : ''}`}
            onClick={() => setActiveTab('procurement')}
            title="Thermal Procurement Sizing Calculator"
          >
            <div className="nav-pill-icon-box">
              <Calculator size={16} />
            </div>
            <span className="nav-pill-text">Procurement</span>
          </button>
        </nav>

        {/* Right Action Buttons & Quick Search */}
        <div className="header-actions">
          {/* Search Input styled like design system */}
          <form onSubmit={handleSearch} className="search-form">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search date (e.g. 10)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input font-mono"
            />
          </form>

          {/* Quick Refresh Button */}
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onRefresh}
            disabled={loading}
            title="Sync / Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>

          {/* Elexon Docs Link */}
          <a
            href="https://bmrs.elexon.co.uk/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outlined btn-sm"
          >
            <span>Elexon BMRS</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Secondary Controls Bar: Gate Cutoff, Period Filters & Quick Scenario Chips */}
      <div className="header-controls-bar">
        <div className="controls-left">
          {/* Gate Cutoff Selector */}
          <div className="control-field">
            <div className="control-label-row">
              <Clock size={14} className="control-icon" />
              <label htmlFor="cutoff-select">D-1 Gate Closure Cutoff:</label>
            </div>
            <div className="select-wrapper">
              <select
                id="cutoff-select"
                value={cutoffHour}
                onChange={(e) => setCutoffHour(Number(e.target.value))}
                className="control-select font-mono"
              >
                <option value={9}>09:00 GMT &mdash; Early Morning Forecast</option>
                <option value={11}>11:00 GMT &mdash; EPEX SPOT Order Gate</option>
                <option value={12}>12:00 GMT &mdash; Standard Noon Gate (Recommended)</option>
                <option value={14}>14:00 GMT &mdash; Post-Gate Afternoon</option>
                <option value={17}>17:00 GMT &mdash; End of Day Close</option>
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
          </div>

          {/* Delivery Period Selector */}
          <div className="control-field">
            <div className="control-label-row">
              <Calendar size={14} className="control-icon" />
              <label htmlFor="date-select">Delivery Period (January 2026):</label>
            </div>
            <div className="select-wrapper">
              <select
                id="date-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="control-select font-mono"
              >
                <option value="">Full Month (Jan 01 - Jan 31, 2026)</option>
                {janDates.map((d) => (
                  <option key={d} value={d}>
                    {d} &mdash; 48 Settlement Periods
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
          </div>
        </div>

        {/* Quick Date Presets / Event Chips */}
        <div className="controls-right">
          <span className="preset-label font-mono">Quick Scenarios:</span>
          <div className="preset-chips">
            <button
              type="button"
              className={`chip ${selectedDate === '' ? 'active' : ''}`}
              onClick={() => setSelectedDate('')}
            >
              Full Month
            </button>
            <button
              type="button"
              className={`chip ${selectedDate === '2026-01-10' ? 'active' : ''}`}
              onClick={() => setSelectedDate('2026-01-10')}
              title="High Wind Storm Surge (Jan 10)"
            >
              Storm Peak (Jan 10)
            </button>
            <button
              type="button"
              className={`chip ${selectedDate === '2026-01-17' ? 'active' : ''}`}
              onClick={() => setSelectedDate('2026-01-17')}
              title="Low Wind Lull / Cold Snap (Jan 17)"
            >
              Wind Lull (Jan 17)
            </button>
            <button
              type="button"
              className={`chip ${selectedDate === '2026-01-24' ? 'active' : ''}`}
              onClick={() => setSelectedDate('2026-01-24')}
              title="High Volatility Ramp Day (Jan 24)"
            >
              Wind Ramp (Jan 24)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
