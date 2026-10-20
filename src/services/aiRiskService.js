/**
 * DETEKS AI Risk Analysis Service
 * 
 * Menghubungkan Frontend DETEKS dengan AI Microservice FastAPI (Isolation Forest + Rule-Based)
 * yang di-deploy di Hugging Face Spaces.
 */

// URL default mengarah ke Hugging Face Space DETEKS API (atau bisa dioverride via VITE_DETEKS_AI_API_URL)
export const DEFAULT_AI_ENDPOINT =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_DETEKS_AI_API_URL) ||
  "https://rantog-deteks-api.hf.space/api/v1/analyze_risk";

/**
 * @typedef {Object} RiskAnalysisPayload
 * @property {string} participant_key - ID Peserta (misal "P-0951")
 * @property {number} n_event_kunjungan - Frekuensi kunjungan rawat jalan
 * @property {number} n_faskes_kunjungan - Jumlah faskes kunjungan yang didatangi
 * @property {number} same_day_hits - Jumlah kunjungan ganda pada hari yang sama
 * @property {number} unbundling_hits - Jumlah indikasi klaim tindakan dipecah (unbundling)
 * @property {number} n_event_obat - Frekuensi pengambilan obat
 * @property {number} n_faskes_obat - Jumlah faskes penyedia obat yang didatangi
 * @property {number} qty_30d - Total kuantitas obat dalam 30 hari
 * @property {number} min_interval - Jarak hari terpendek tebus obat sejenis (hari)
 * @property {number} overlap_days - Hari persediaan tumpang tindih / estimasi overlap (hari)
 * @property {number} [rules_score_tambahan=0] - Skor rules tambahan / penalti manual (opsional)
 */

/**
 * @typedef {Object} DetailScores
 * @property {number} total_rules_raw - Skor mentah hasil evaluasi aturan pakar
 * @property {number} rules_score_normalized - Skor aturan yang dinormalisasi (bobot 60%)
 * @property {number} ai_anomaly_percentile - Persentil anomali model Isolation Forest (bobot 40%)
 * @property {number} raw_if_score - Raw score output dari Isolation Forest
 */

/**
 * @typedef {Object} RiskAnalysisResponse
 * @property {string} participant_key - ID Peserta
 * @property {number} review_priority - Skor prioritas gabungan Risk Fusion (0-100)
 * @property {"Tinggi" | "Sedang" | "Rendah" | string} risk_band - Kategori tingkat risiko
 * @property {string[]} reasons - Daftar alasan indikasi anomali (Explainable AI)
 * @property {DetailScores} detail_scores - Rincian skor komponen Rules vs AI
 */

/**
 * Memanggil endpoint AI pada Hugging Face Spaces yang berjalan menggunakan Gradio 6 / ZeroGPU.
 * Hugging Face ZeroGPU mewajibkan request melalui mekanisme antrean (SSE queue)
 * pada `/gradio_api/call/analyze_risk`.
 * 
 * @param {string} endpointUrl - Base URL atau endpoint HF Spaces
 * @param {Object} formattedBody - Data parameter yang sudah dinormalisasi
 * @param {AbortSignal} signal - Signal untuk timeout
 * @returns {Promise<RiskAnalysisResponse>}
 */
async function callGradioAPI(endpointUrl, formattedBody, signal) {
  const cleanBase = endpointUrl
    .replace(/\/+$/, "")
    .replace(/\/api\/v1\/analyze_risk$/, "")
    .replace(/\/gradio_api\/call\/analyze_risk$/, "");
  
  const callUrl = `${cleanBase}/gradio_api/call/analyze_risk`;

  // Payload Gradio sesuai urutan argumen fn calculate_risk_fusion di app.py
  const gradioData = [
    String(formattedBody.participant_key || ""),
    Number(formattedBody.n_event_kunjungan ?? 0),
    Number(formattedBody.n_faskes_kunjungan ?? 1),
    Number(formattedBody.same_day_hits ?? 0),
    Number(formattedBody.unbundling_hits ?? 0),
    Number(formattedBody.n_event_obat ?? 1),
    Number(formattedBody.n_faskes_obat ?? 1),
    Number(formattedBody.qty_30d ?? 1),
    Number(formattedBody.min_interval ?? 30),
    Number(formattedBody.overlap_days ?? 0),
    Number(formattedBody.rules_score_tambahan ?? 0),
  ];

  const hfToken = (typeof import.meta !== "undefined" && import.meta.env?.VITE_HF_TOKEN) || "";
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (hfToken) {
    headers["Authorization"] = `Bearer ${hfToken}`;
  }

  // Step 1: Submit job ke antrean Gradio
  const initRes = await fetch(callUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ data: gradioData }),
    signal,
  });

  if (!initRes.ok) {
    const errorText = await initRes.text().catch(() => "");
    throw new Error(`Gradio queue error (${initRes.status}): ${errorText || initRes.statusText}`);
  }

  const { event_id } = await initRes.json();
  if (!event_id) {
    throw new Error("Gradio tidak mengembalikan event_id untuk antrean inferensi.");
  }

  // Step 2: Ambil hasil dari SSE stream antrean
  const streamUrl = `${cleanBase}/gradio_api/call/analyze_risk/${event_id}`;
  const streamHeaders = {};
  if (hfToken) {
    streamHeaders["Authorization"] = `Bearer ${hfToken}`;
  }

  const streamRes = await fetch(streamUrl, {
    method: "GET",
    headers: streamHeaders,
    signal,
  });

  if (!streamRes.ok) {
    throw new Error(`Gagal membaca stream hasil AI (${streamRes.status}): ${streamRes.statusText}`);
  }

  const text = await streamRes.text();
  const lines = text.split("\n");
  let lastData = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("data:")) {
      const jsonStr = line.slice(5).trim();
      try {
        lastData = JSON.parse(jsonStr);
      } catch {
        // Abaikan fragmen stream yang bukan JSON valid
      }
    }
  }

  if (!lastData) {
    throw new Error("Tidak menerima output data hasil evaluasi dari AI Space.");
  }

  const result = Array.isArray(lastData) ? lastData[0] : lastData;

  // Tangani kemungkinan error internal dari ZeroGPU atau Gradio
  if (result && result.error) {
    throw new Error(`AI Space error: ${result.error}`);
  }

  return result;
}

/**
 * Mengirim permintaan analisis risiko ke AI Backend Hugging Face Spaces.
 * Mendukung Hugging Face Space (Gradio ZeroGPU) serta standard FastAPI REST endpoint.
 * 
 * @param {RiskAnalysisPayload} payload - Data fitur klaim peserta
 * @param {Object} [options]
 * @param {string} [options.endpoint] - Custom URL endpoint jika berbeda
 * @param {number} [options.timeoutMs=25000] - Batas waktu request (milidetik)
 * @returns {Promise<RiskAnalysisResponse>}
 */
export async function analyzeRiskAI(payload, options = {}) {
  const endpoint = options.endpoint || DEFAULT_AI_ENDPOINT;
  const timeoutMs = options.timeoutMs ?? 25000;

  // Validasi parameter dasar
  if (!payload || !payload.participant_key) {
    throw new Error("Payload tidak valid: 'participant_key' wajib diisi.");
  }

  // Siapkan AbortController untuk timeout (Hugging Face ZeroGPU terkadang cold-start)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Normalisasi payload ke format numeric
  const formattedBody = {
    participant_key: String(payload.participant_key),
    n_event_kunjungan: Number(payload.n_event_kunjungan ?? 0),
    n_faskes_kunjungan: Number(payload.n_faskes_kunjungan ?? 1),
    same_day_hits: Number(payload.same_day_hits ?? 0),
    unbundling_hits: Number(payload.unbundling_hits ?? 0),
    n_event_obat: Number(payload.n_event_obat ?? 1),
    n_faskes_obat: Number(payload.n_faskes_obat ?? 1),
    qty_30d: Number(payload.qty_30d ?? 1),
    min_interval: Number(payload.min_interval ?? 30),
    overlap_days: Number(payload.overlap_days ?? 0),
    rules_score_tambahan: Number(payload.rules_score_tambahan ?? 0),
  };

  try {
    // Jika endpoint mengarah ke Hugging Face Space (*.hf.space), langsung gunakan protokol Gradio ZeroGPU Queue
    // untuk menghindari HTTP 405 Method Not Allowed dari router Gradio/ZeroGPU.
    if (endpoint.includes(".hf.space") || endpoint.includes("gradio_api")) {
      const data = await callGradioAPI(endpoint, formattedBody, controller.signal);
      clearTimeout(timer);
      return data;
    }

    // Untuk endpoint REST FastAPI kustom / lokal biasa:
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formattedBody),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      // Jika ternyata server mengembalikan 405 (Method Not Allowed), coba fallback ke Gradio Queue
      if (response.status === 405) {
        try {
          return await callGradioAPI(endpoint, formattedBody, controller.signal);
        } catch {
          // Lanjutkan lempar error asli jika fallback juga gagal
        }
      }

      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === "string" 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback jika respons bukan JSON
      }

      if (response.status === 422) {
        throw new Error(`Validasi payload gagal (FastAPI 422): ${errorMessage}`);
      } else if (response.status === 503 || response.status === 504) {
        throw new Error(`AI Service sedang cold-start atau tidak dapat dijangkau (${response.status}). Coba beberapa saat lagi.`);
      }

      throw new Error(`Gagal menganalisis risiko (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    clearTimeout(timer);

    if (err.name === "AbortError") {
      throw new Error(`Permintaan ke AI Service timeout (> ${timeoutMs / 1000} detik). Space Hugging Face mungkin sedang memulai ulang (cold-start).`);
    }

    // Teruskan pesan error yang sudah dirapikan
    throw err instanceof Error ? err : new Error(String(err));
  }
}

/**
 * Helper untuk mengonversi data peserta lokal DETEKS ke payload API AI
 * @param {Object} participant - Objek peserta dari engine DETEKS
 * @returns {RiskAnalysisPayload}
 */
export function mapParticipantToPayload(participant) {
  if (!participant) return null;
  const pr = participant.primary || {};

  // Ambil skor aturan/sinyal dari engine DETEKS lokal agar bobot Rules terisi secara dinamis
  const ruleComp = participant.comp?.rule ?? 0;
  const crossComp = participant.comp?.cross ?? 0;
  // Skor rules tambahan menggabungkan skor aturan lokal & cross-faskes (skala 0 - 80+)
  const rulesTambahan = (ruleComp + crossComp) > 0 
    ? (ruleComp + crossComp) 
    : (participant.score ? Math.round(participant.score * 0.7) : 0);

  return {
    participant_key: participant.id || "P-UNKNOWN",
    n_event_kunjungan: participant.rxCount || 1,
    n_faskes_kunjungan: participant.faskesCount || 1,
    same_day_hits: participant.nEarly || 0,
    unbundling_hits: pr.nCross || (participant.nCross || 0),
    n_event_obat: participant.rxCount || 1,
    n_faskes_obat: participant.faskesCount || 1,
    qty_30d: Math.max(1, Math.round((pr.totalOverlap || 0) / 5) + 1),
    min_interval: participant.interval ?? 30,
    overlap_days: pr.maxOverlap ?? 0,
    rules_score_tambahan: rulesTambahan,
  };
}

