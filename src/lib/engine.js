// DETEKS engine (prototype) — 3 lapis: Rule-Based, Cross-Faskes, ML Scoring (Isolation Forest).
// Struktur dibuat agar mudah dipindah ke backend (FastAPI + scikit-learn) tanpa mengubah UI.
import { DRUG_BY_CODE, estDays, FASKES_BY_ID } from "./reference";
import { addDays, diffDays } from "./dates";
import { mulberry32 } from "./dataset";

export const DEFAULT_CFG = {
  toleranceDays: 3, // Configurable / Subject to Validation
  weights: { rule: 40, cross: 35, ml: 25 },
  lowMax: 39,
  highMin: 70,
};

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/* ---------- Isolation Forest (implementasi ringkas, deterministik) ---------- */
const cFn = (n) => (n <= 1 ? 0 : n === 2 ? 1 : 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n);

export function isolationForest(X, { trees = 100, sample = 128, seed = 7 } = {}) {
  const rand = mulberry32(seed);
  const n = X.length, d = X[0].length;
  const psi = Math.min(sample, n);
  const limit = Math.ceil(Math.log2(psi));
  const build = (rows, h) => {
    if (h >= limit || rows.length <= 1) return { size: rows.length };
    const q = Math.floor(rand() * d);
    let mn = Infinity, mx = -Infinity;
    for (const x of rows) { mn = Math.min(mn, x[q]); mx = Math.max(mx, x[q]); }
    if (mn === mx) return { size: rows.length };
    const p = mn + rand() * (mx - mn);
    return { q, p, l: build(rows.filter((x) => x[q] < p), h + 1), r: build(rows.filter((x) => x[q] >= p), h + 1) };
  };
  const forest = [];
  for (let t = 0; t < trees; t++) {
    const idx = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    forest.push(build(idx.slice(0, psi).map((i) => X[i]), 0));
  }
  const path = (x, t, h = 0) => (t.size !== undefined ? h + cFn(t.size) : path(x, x[t.q] < t.p ? t.l : t.r, h + 1));
  return X.map((x) => Math.pow(2, -(forest.reduce((s, t) => s + path(x, t), 0) / trees) / cFn(psi)));
}

/* ---------- Lapis 1 & 2: rule-based + cross-faskes ---------- */
function analyzeDrugSeq(seq, drug, tol) {
  const est = estDays(drug);
  const rows = seq.map((r) => ({ ...r, estEnd: addDays(r.date, est), gap: null, early: false, cross: false, remaining: 0, coveringFaskes: [] }));
  let nEarly = 0, nCross = 0, totalOverlap = 0, maxOverlap = 0, minGap = null, minRatio = 1, worst = null;
  const flaggedFaskes = new Set();
  rows.forEach((r, i) => {
    if (i === 0) return;
    r.gap = diffDays(rows[i - 1].date, r.date);
    if (minGap === null || r.gap < minGap) minGap = r.gap;
    minRatio = Math.min(minRatio, r.gap / est);
    const covering = rows.slice(0, i).filter((p) => diffDays(p.date, r.date) < est - tol);
    if (covering.length) {
      r.early = true;
      r.remaining = Math.max(...covering.map((p) => est - diffDays(p.date, r.date)));
      r.coveringFaskes = [...new Set(covering.map((p) => p.faskesId))];
      r.cross = covering.some((p) => p.faskesId !== r.faskesId);
      nEarly++; totalOverlap += r.remaining; maxOverlap = Math.max(maxOverlap, r.remaining);
      flaggedFaskes.add(r.faskesId); covering.forEach((p) => flaggedFaskes.add(p.faskesId));
      if (r.cross) nCross++;
      if (!worst || r.remaining > worst.remaining) worst = r;
    }
  });
  return { drug, est, seq: rows, nEarly, nCross, totalOverlap, maxOverlap, minGap, minRatio, worst, flaggedFaskes };
}

export function analyze(ds, cfg = DEFAULT_CFG) {
  const byP = new Map();
  ds.records.forEach((r) => { if (!byP.has(r.pid)) byP.set(r.pid, new Map()); const m = byP.get(r.pid); if (!m.has(r.drugCode)) m.set(r.drugCode, []); m.get(r.drugCode).push(r); });

  const base = ds.participants.map((p) => {
    const stats = {};
    byP.get(p.id).forEach((seq, code) => { stats[code] = analyzeDrugSeq(seq, DRUG_BY_CODE[code], cfg.toleranceDays); });
    const list = Object.values(stats);
    const primary = [...list].sort((a, b) => b.nCross - a.nCross || b.nEarly - a.nEarly || b.totalOverlap - a.totalOverlap || b.seq.length - a.seq.length)[0];
    const last = primary.seq[primary.seq.length - 1];
    const allFaskes = new Set(ds.records.filter((r) => r.pid === p.id).map((r) => r.faskesId));
    return { ...p, stats, primary, primaryCode: primary.drug.code, drugCodes: Object.keys(stats), faskesIds: [...allFaskes], faskesCount: allFaskes.size, rxCount: list.reduce((s, x) => s + x.seq.length, 0), lastRefill: last.date, estEnd: last.estEnd, interval: primary.minGap, nEarly: primary.nEarly, nCross: primary.nCross, flaggedFaskes: [...primary.flaggedFaskes] };
  });

  // Lapis 3 — Isolation Forest pada fitur pola pengambilan
  const X = base.map((p) => [p.primary.minRatio, p.nEarly, Math.max(1, p.primary.flaggedFaskes.size), p.primary.totalOverlap / 10]);
  const iso = isolationForest(X);

  const w = cfg.weights;
  const scored = base.map((p, i) => {
    const pr = p.primary;
    const ruleN = pr.nEarly ? clamp(0.5 * (Math.min(pr.nEarly, 3) / 3) + 0.5 * Math.min(pr.maxOverlap / 24, 1)) : 0;
    const crossN = pr.nCross ? clamp(0.5 + 0.25 * (pr.flaggedFaskes.size - 1)) : 0;
    const mlN = clamp((iso[i] - 0.5) / 0.26);
    const comp = { rule: Math.round(w.rule * ruleN), cross: Math.round(w.cross * crossN), ml: Math.round(w.ml * mlN) };
    const score = comp.rule + comp.cross + comp.ml;
    const band = score >= cfg.highMin ? "high" : score > cfg.lowMax ? "medium" : "low";
    const worst = pr.worst;
    const drugName = `${pr.drug.name} ${pr.drug.strength}`;
    const reasons = [];
    if (worst) reasons.push(`${drugName} diambil kembali ${worst.gap} hari setelah pengambilan sebelumnya, sebelum estimasi durasi pemakaian (${pr.est} hari) selesai — sisa persediaan estimasi ±${worst.remaining} hari.`);
    if (pr.nCross) reasons.push(`Pengambilan berikutnya dilakukan di faskes berbeda — obat yang sama tercatat di ${pr.flaggedFaskes.size} faskes (${[...pr.flaggedFaskes].map((f) => FASKES_BY_ID[f].short).join(", ")}).`);
    if (pr.nEarly && pr.minRatio < 0.7) reasons.push(`Interval pengambilan terpendek ${pr.minGap} hari, lebih pendek dari pola normal (±${pr.est} hari).`);
    if (pr.nEarly >= 2) reasons.push(`Early refill terjadi berulang (${pr.nEarly} kali dalam periode analisis).`);
    if (mlN >= 0.5) reasons.push(`Pola konsumsi termasuk outlier berdasarkan Isolation Forest (anomaly score ${iso[i].toFixed(2)}).`);
    const signals = {
      rule: pr.nEarly ? `Interval tidak sesuai (${pr.nEarly}× early refill)` : null,
      cross: pr.nCross ? `Obat sama di ${pr.flaggedFaskes.size} faskes` : null,
      ml: mlN >= 0.5 ? "Pola konsumsi outlier" : null,
    };
    return { ...p, iso: iso[i], comp, score, band, reasons, signals, mlN };
  });

  const order = { high: 0, medium: 1, low: 2 };
  const ranked = [...scored].sort((a, b) => order[a.band] - order[b.band] || b.score - a.score);
  let hi = 0;
  const statusOf = new Map(ranked.map((p) => {
    let s = "Normal";
    if (p.band === "high") s = hi++ % 5 < 3 ? "Perlu Verifikasi" : "Dalam Tinjauan";
    else if (p.band === "medium") s = "Pemantauan";
    return [p.id, s];
  }));
  const participants = scored.map((p) => ({ ...p, baseStatus: statusOf.get(p.id) }));
  return { participants, cfg };
}
