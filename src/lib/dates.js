const DAY = 86400000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const toMs = (iso) => Date.parse(iso + "T00:00:00Z");
export const toIso = (ms) => new Date(ms).toISOString().slice(0, 10);
export const addDays = (iso, n) => toIso(toMs(iso) + n * DAY);
export const diffDays = (a, b) => Math.round((toMs(b) - toMs(a)) / DAY);
export const fmtShort = (iso) => {
  const d = new Date(toMs(iso));
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]}`;
};
export const fmtFull = (iso) => `${fmtShort(iso)} ${iso.slice(0, 4)}`;
