# UK Renewable Generation Forecast & Procurement Evaluation Platform

> Wholesale Day-Ahead electricity purchase decision support system for UK energy utilities based on Elexon BMRS market data.

---

## 1. Problem Setting & Domain Context

UK energy utilities purchase electricity from the wholesale Day-Ahead market to meet consumer demand. Because renewable generation (wind) varies with weather, procurement decisions for delivery day $D$ must be submitted on day $D-1$ before auction closure (e.g., 11:00 or 12:00 GMT).

This platform addresses two core operational requirements:

1. **Latest Day-Ahead Forecast Visibility:** Identifies and displays the latest wind generation forecast available before the Day-Ahead decision cutoff on day $D-1$, preventing future data leakage.
2. **Quantitative Error & Risk Sizing:** Quantifies forecast accuracy (MAE, RMSE, Systematic Bias, and P90 tail risk) to size thermal power purchases and reserve buffers.

---

## 2. Architecture & Tech Stack

- **Data Sources:**
  - National wind actuals: Elexon BMRS `FUELHH/stream` (`fuelType = "WIND"`, 30-min settlement periods).
  - National wind forecasts: Elexon BMRS `WINDFOR/stream` (`startTime`, `publishTime`, `generation`).
  - Period of evaluation: **January 2026**.
- **Backend:** Python 3.11+, FastAPI, Uvicorn (lightweight, maintainable, with fast in-memory query indexing).
- **Frontend:** React 19, TypeScript, Vite, Recharts, Lucide React (clean light executive dashboard theme).
- **Containerization:** Multi-stage Dockerfiles and Docker Compose.
- **Deployment Targets:** Vercel (Frontend), Render (Backend).

---

## 3. Directory & File Structure

```
dshjdjsg/
├── backend/
│   ├── data/
│   │   ├── actuals_wind_jan2026.json     # Elexon actual wind generation (fuelType=WIND)
│   │   └── forecasts_wind_jan2026.json   # Elexon wind forecasts with publishTime & startTime
│   ├── fetch_elexon_data.py             # Data ingestion script from Elexon BMRS API
│   ├── main.py                          # FastAPI backend application & analytics engine
│   ├── requirements.txt                 # Backend Python dependencies
│   ├── test_backend.py                  # Test suite for backend metric calculations
│   └── Dockerfile                       # Multi-stage Python backend container definition
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx               # Header with D-1 gate cutoff & period controls
│   │   │   ├── MetricCards.tsx          # 5 top KPI summary cards (MAE, RMSE, Bias, P90, MWh)
│   │   │   ├── TimeseriesChart.tsx      # Dual-curve actual vs forecast line chart
│   │   │   ├── ErrorDistributionChart.tsx # Error frequency histogram & percentile markers
│   │   │   └── ThermalCalculator.tsx    # Thermal procurement & risk buffer calculator
│   │   ├── types.ts                     # TypeScript shared interfaces
│   │   ├── App.tsx                      # Clean parent coordinator
│   │   ├── index.css                    # Modern light executive theme
│   │   └── main.tsx                     # React root mount
│   ├── nginx.conf                       # Production Nginx reverse proxy configuration
│   ├── vercel.json                      # Vercel SPA routing configuration
│   ├── Dockerfile                       # Multi-stage Node build & Nginx container
│   ├── package.json                     # Frontend dependencies
│   └── vite.config.ts                   # Vite configuration with local /api proxy
├── docker-compose.yml                   # Root single-command full-stack orchestration
└── README.md                            # Complete documentation & project manual
```

---

## 4. Key Analytical Metrics & Decision Rules

- **Forecast Error Convention:** $\text{Error} = \text{Forecast} - \text{Actual}$.
  - **Positive error ($>0$):** Forecast exceeded actual wind generation (over-forecast). This poses a thermal shortfall risk if not hedged.
  - **Negative error ($<0$):** Actual wind exceeded forecast (surplus generation).
- **Evaluated January 2026 Metrics (at 12:00 GMT D-1 Cutoff):**
  - **Sample Size:** 744 settlement periods across January 2026.
  - **MAE (Mean Absolute Error):** $2,002.9\text{ MW}$ ($17.29\%\text{ WAPE}$).
  - **RMSE (Root Mean Square Error):** $2,470.1\text{ MW}$.
  - **Systematic Bias:** $+1,805.9\text{ MW}$ (systemic tendency of Day-Ahead wind forecasts to overestimate generation in Jan 2026).
  - **P90 Downside Risk Buffer:** $+4,000.0\text{ MW}$ (90th-percentile deficit buffer to prevent imbalance penalties).
- **Procurement Calculator Logic:**
  $$\text{Recommended Day-Ahead Purchase} = \max(0, \text{Customer Demand} - \text{Wind Forecast}) + \text{Risk Buffer}$$

---

## 5. How to Start the Application

### Option A: Using Docker Compose (Recommended)

Run the entire application (Backend + Frontend) with a single command:

```bash
docker compose up --build
```

- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Running Locally

#### 1. Backend Setup (Python)

```bash
cd backend
pip install -r requirements.txt

# (Optional) Re-fetch January 2026 Elexon data:
python fetch_elexon_data.py

# Start FastAPI server:
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

The backend will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

#### 2. Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at [http://127.0.0.1:5173](http://127.0.0.1:5173).

---

## 6. API Reference

| Endpoint          | Method | Parameters                              | Description                                       |
| ----------------- | ------ | --------------------------------------- | ------------------------------------------------- |
| `/api/health`     | GET    | None                                    | Health check & record count confirmation          |
| `/api/timeseries` | GET    | `cutoff_hour` (0-23), `date` (optional) | Synchronized actuals vs latest day-ahead forecast |
| `/api/metrics`    | GET    | `cutoff_hour` (0-23), `date` (optional) | MAE, RMSE, Bias, P10/P50/P90, distribution bins   |

---

## 7. Cloud Deployment Links

- **Live Frontend (Vercel):** _`<add deployed Vercel URL here>`_
- **Live Backend (Heroku / Render):** _`<add deployed Backend URL here>`_

> **Deployment Tip:** In Vercel, set the environment variable `VITE_API_URL` to point to the deployed backend URL.

---

## 8. AI Tools Disclosure

As explicitly requested in the challenge instructions:

- **AI Tools Used:** Google Antigravity IDE (Gemini 3.8 Flash model) was utilized for exploratory API validation and boilerplate generation.
