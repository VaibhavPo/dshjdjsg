import { Wind, Clock, Calendar } from 'lucide-react';

interface HeaderProps {
  cutoffHour: number;
  setCutoffHour: (hour: number) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  janDates: string[];
}

export function Header({
  cutoffHour,
  setCutoffHour,
  selectedDate,
  setSelectedDate,
  janDates,
}: HeaderProps) {
  return (
    <header className="header-row">
      <div className="header-title-group">
        <h1>
          <Wind size={28} color="#2563eb" />
          UK Renewable Generation Forecast & Procurement Evaluation
        </h1>
        <p>
          Elexon BMRS Market Data (January 2026) &bull; Wholesale Day-Ahead Purchase Decision Portal
        </p>
      </div>

      {/* Global Controls */}
      <div className="controls-bar">
        <div className="control-group">
          <Clock size={16} color="#64748b" />
          <label htmlFor="cutoff-select" className="control-label">
            D-1 Gate Cutoff:
          </label>
          <select
            id="cutoff-select"
            value={cutoffHour}
            onChange={(e) => setCutoffHour(Number(e.target.value))}
          >
            <option value={9}>09:00 GMT (Early Morning)</option>
            <option value={11}>11:00 GMT (EPEX SPOT Gate)</option>
            <option value={12}>12:00 GMT (Standard Noon Gate)</option>
            <option value={14}>14:00 GMT (Afternoon)</option>
            <option value={17}>17:00 GMT (End of Day)</option>
          </select>
        </div>

        <div className="control-group">
          <Calendar size={16} color="#64748b" />
          <label htmlFor="date-select" className="control-label">
            Period View:
          </label>
          <select
            id="date-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="">Full Month (Jan 1 - 31, 2026)</option>
            {janDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
