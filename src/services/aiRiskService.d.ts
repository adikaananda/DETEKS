export interface RiskAnalysisPayload {
  participant_key: string;
  n_event_kunjungan: number;
  n_faskes_kunjungan: number;
  same_day_hits: number;
  unbundling_hits: number;
  n_event_obat: number;
  n_faskes_obat: number;
  qty_30d: number;
  min_interval: number;
  overlap_days: number;
  rules_score_tambahan?: number;
}

export interface DetailScores {
  total_rules_raw: number;
  rules_score_normalized: number;
  ai_anomaly_percentile: number;
  raw_if_score: number;
}

export interface RiskAnalysisResponse {
  participant_key: string;
  review_priority: number;
  risk_band: "Tinggi" | "Sedang" | "Rendah" | string;
  reasons: string[];
  detail_scores: DetailScores;
}

export interface AnalyzeRiskOptions {
  endpoint?: string;
  timeoutMs?: number;
}

export declare function analyzeRiskAI(
  payload: RiskAnalysisPayload,
  options?: AnalyzeRiskOptions
): Promise<RiskAnalysisResponse>;
