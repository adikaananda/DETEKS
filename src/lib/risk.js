// Metadata band risiko & status — satu tempat agar mudah diubah.
export const BANDS = {
  high: { label: "Risiko Tinggi", en: "High Risk", color: "#c0392b", soft: "#fdecec", tone: "danger" },
  medium: { label: "Perlu Perhatian", en: "Medium Risk", color: "#ff8a00", soft: "#fff2e0", tone: "amber" },
  low: { label: "Risiko Rendah", en: "Low Risk", color: "#4caf50", soft: "#ebf5e9", tone: "leaf" },
};
export const STATUS_TONE = {
  "Perlu Verifikasi": "danger",
  "Ditandai Verifikasi": "forest",
  "Dalam Tinjauan": "gold",
  Pemantauan: "amber",
  Normal: "leaf",
};
export const applyFilters = (rows, f) => {
  const q = (f.q || "").trim().toLowerCase();
  return rows.filter((p) => {
    if (f.risk && p.band !== f.risk) return false;
    if (f.drug && !p.drugCodes.includes(f.drug)) return false;
    if (f.faskes && !p.faskesIds.includes(f.faskes)) return false;
    if (q) {
      const hay = `${p.id} ${p.primary.drug.name} ${p.status}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
};
