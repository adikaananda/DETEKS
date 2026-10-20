import { useState } from "react";
import {
  Sparkles,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Repeat,
  Network,
  Info,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { analyzeRiskAI } from "../services/aiRiskService";
import { Card, Badge, btnPrimary, btnGhost } from "./Card";

// Mapping warna & tone band risiko sesuai design system DETEKS
const RISK_BAND_MAP = {
  Tinggi: {
    label: "Risiko Tinggi",
    tone: "danger",
    color: "var(--color-risk-high)",
    bg: "var(--color-risk-high-bg)",
    border: "#fca5a5",
  },
  Sedang: {
    label: "Perlu Perhatian",
    tone: "amber",
    color: "var(--color-amber-500)",
    bg: "#fff2e0",
    border: "#fcd34d",
  },
  Rendah: {
    label: "Risiko Rendah",
    tone: "leaf",
    color: "var(--color-leaf-500)",
    bg: "var(--color-leaf-100)",
    border: "#86efac",
  },
};

/**
 * Komponen Analisis Risiko AI DETEKS
 *
 * @param {Object} props
 * @param {import('../services/aiRiskService').RiskAnalysisPayload} [props.payload] - Data klaim peserta (opsional, ada fallback demo)
 * @param {function(import('../services/aiRiskService').RiskAnalysisResponse):void} [props.onSuccess] - Callback saat analisis sukses
 * @param {string} [props.className] - CSS class tambahan
 */
export default function AiRiskAnalysis({ payload, onSuccess, className = "" }) {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Default demo payload jika tidak dipassing dari parent (sesuai spesifikasi DETEKS)
  const activePayload = payload || {
    participant_key: "P-0951",
    n_event_kunjungan: 5,
    n_faskes_kunjungan: 1,
    same_day_hits: 0,
    unbundling_hits: 1,
    n_event_obat: 2,
    n_faskes_obat: 2,
    qty_30d: 2,
    min_interval: 20,
    overlap_days: 5,
    rules_score_tambahan: 10,
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeRiskAI(activePayload);
      setData(result);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error("[DETEKS AI Error]:", err);
      setError(err.message || "Gagal menghubungi endpoint AI di Hugging Face Spaces.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentBand = data ? RISK_BAND_MAP[data.risk_band] || {
    label: data.risk_band,
    color: "var(--color-forest-900)",
    bg: "var(--color-leaf-100)",
    border: "#cbd5e1",
  } : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tombol Utama */}
      {!data && !error && (
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className={`${btnPrimary} w-full sm:w-auto shadow-sm transition-all hover:shadow-md cursor-pointer`}
          id="btn-analisis-risiko-ai"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin text-[var(--color-gold-400)]" />
              <span>Memproses Risk Fusion AI...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} className="text-[var(--color-gold-400)]" />
              <span>Analisis Risiko AI</span>
            </>
          )}
        </button>
      )}

      {/* State: Error Feedback */}
      {error && (
        <Card className="p-4 border-l-4 border-l-[var(--color-risk-high)] bg-[var(--color-risk-high-bg)]/40">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-[var(--color-risk-high)] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[var(--color-risk-high)]">Gagal Mengambil Prediksi AI</h4>
              <p className="text-xs text-[var(--color-ink-600)] mt-1 font-medium">{error}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[var(--color-risk-high)] border border-[var(--color-risk-high)]/30 hover:bg-white/80 transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                  <span>Coba Lagi</span>
                </button>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-[var(--color-ink-400)] hover:underline ml-2"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* State: Hasil Analisis Sukses */}
      {data && (
        <Card className="p-5 sm:p-6 border border-leaf-100 shadow-[var(--shadow-card)] animate-rise">
          {/* Header Hasil */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-leaf-100/80">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-leaf-50 text-[var(--color-forest-900)] grid place-items-center shrink-0">
                <Cpu size={20} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-forest-700)]">
                    Hasil Risk Fusion AI
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-leaf-100/60 text-[var(--color-ink-900)] font-semibold">
                    {data.participant_key}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-[var(--color-forest-900)] leading-snug">
                  Skor Prioritas Verifikasi
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                title="Hitung ulang inferensi AI"
                className="w-9 h-9 rounded-xl grid place-items-center bg-white border border-leaf-100 text-[var(--color-forest-900)] hover:bg-leaf-50 transition-colors cursor-pointer"
              >
                <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Skor & Band Banner */}
          <div className="mt-5 grid sm:grid-cols-[140px_1fr] items-center gap-5 p-4 rounded-2xl bg-leaf-50/70 border border-leaf-100">
            {/* Visual Ring Skor */}
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 shadow-inner"
                style={{
                  borderColor: currentBand.color,
                  backgroundColor: currentBand.bg,
                }}
              >
                <span
                  className="text-2xl font-black tabular leading-none"
                  style={{ color: currentBand.color }}
                >
                  {Number(data.review_priority).toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-[var(--color-ink-600)] mt-1">/ 100</span>
              </div>
              <span className="text-[11px] font-bold text-[var(--color-ink-400)] mt-1.5 uppercase tracking-wide">
                Review Priority
              </span>
            </div>

            {/* Keterangan Band & Bobot */}
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold tracking-wide"
                  style={{
                    backgroundColor: currentBand.bg,
                    color: currentBand.color,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: currentBand.color }}
                  />
                  {currentBand.label}
                </span>
                <span className="text-xs text-[var(--color-ink-600)] font-medium">
                  Formula: 60% Rules + 40% Isolation Forest
                </span>
              </div>

              <p className="text-sm text-[var(--color-ink-900)] font-medium leading-relaxed">
                Kasus ini ditempatkan pada antrean prioritas <b>{currentBand.label}</b> berdasarkan anomali klaim lintas faskes dan indikasi perilaku tebus obat.
              </p>

              {/* Progress Bar Visualisasi */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-semibold text-[var(--color-ink-600)]">
                  <span>Tingkat Keparahan Anomali</span>
                  <span className="tabular font-bold" style={{ color: currentBand.color }}>
                    {data.review_priority}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white overflow-hidden border border-leaf-100">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, data.review_priority))}%`,
                      backgroundColor: currentBand.color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alasan / Detection Signals (Explainable AI) */}
          <div className="mt-5 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-forest-700)] flex items-center gap-1.5">
              <Zap size={14} className="text-[var(--color-gold-400)]" />
              <span>Alasan / Detection Signals ({data.reasons?.length || 0})</span>
            </h4>

            {data.reasons && data.reasons.length > 0 ? (
              <div className="grid gap-2">
                {data.reasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-[#f3d6b4] bg-[#fff8ee] p-3 text-sm font-semibold text-[var(--color-ink-900)] leading-snug"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#fff2e0] text-[#b35f00] grid place-items-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{reason}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-ink-600)] italic">
                Tidak ada alasan anomali spesifik yang terdeteksi.
              </p>
            )}
          </div>

          {/* Collapsible: Rincian Skor Detail (Pakar Rules vs ML) */}
          {data.detail_scores && (
            <div className="mt-5 pt-4 border-t border-leaf-100">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between text-xs font-bold text-[var(--color-forest-900)] hover:text-[var(--color-forest-700)] transition-colors py-1 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Info size={14} />
                  <span>Rincian Skor Teknis (Risk Fusion Breakdown)</span>
                </span>
                {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showDetails && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-rise">
                  <div className="rounded-xl bg-leaf-50 p-3 border border-leaf-100/60">
                    <p className="text-[11px] font-semibold text-[var(--color-ink-400)]">Total Rules Raw</p>
                    <p className="text-base font-extrabold text-[var(--color-forest-900)] mt-0.5 tabular">
                      {data.detail_scores.total_rules_raw}
                    </p>
                  </div>

                  <div className="rounded-xl bg-leaf-50 p-3 border border-leaf-100/60">
                    <p className="text-[11px] font-semibold text-[var(--color-ink-400)]">Rules Normalized (60%)</p>
                    <p className="text-base font-extrabold text-[var(--color-forest-900)] mt-0.5 tabular">
                      {Number(data.detail_scores.rules_score_normalized).toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-leaf-50 p-3 border border-leaf-100/60">
                    <p className="text-[11px] font-semibold text-[var(--color-ink-400)]">AI Anomaly Percentile (40%)</p>
                    <p className="text-base font-extrabold text-[var(--color-forest-900)] mt-0.5 tabular">
                      {Number(data.detail_scores.ai_anomaly_percentile).toFixed(1)}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-leaf-50 p-3 border border-leaf-100/60">
                    <p className="text-[11px] font-semibold text-[var(--color-ink-400)]">Raw Isolation Forest</p>
                    <p className="text-base font-extrabold text-[var(--color-forest-900)] mt-0.5 tabular font-mono">
                      {Number(data.detail_scores.raw_if_score).toFixed(3)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Human-in-the-Loop */}
          <div className="mt-4 pt-3 border-t border-leaf-100/60 flex items-center gap-2 text-xs text-[var(--color-ink-600)] font-medium">
            <ShieldCheck size={14} className="text-[var(--color-forest-700)] shrink-0" />
            <span>
              <b>Human-in-the-loop:</b> Risk Score adalah pendukung keputusan verifikasi. Keputusan klaim tetap diambil oleh verifikator BPJS.
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
