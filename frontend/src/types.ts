export interface TimeseriesPoint {
  startTime: string;
  settlementDate: string;
  settlementPeriod: number;
  actualGeneration: number;
  forecastGeneration: number;
  publishTime: string;
  error: number;
  absError: number;
}

export interface MetricsSummary {
  mae: number;
  rmse: number;
  bias: number;
  wapePercent: number;
  totalActualMWh: number;
  totalForecastMWh: number;
  p10: number;
  p50: number;
  p90: number;
}

export interface DistributionBin {
  bin: string;
  count: number;
}

export interface MetricsResponse {
  cutoffHour: number;
  selectedDate: string | null;
  sampleSize: number;
  summary: MetricsSummary;
  distribution: DistributionBin[];
}
