// Simulation / Prototype Reference — WAJIB divalidasi mentor/farmasis sebelum dipakai di luar demo.
export const DRUGS = [
  { code: "OBT-HT01", name: "Amlodipin", strength: "10 mg", category: "Hipertensi", form: "Tablet", dosePerDay: 1, qty: 30, unit: "tablet" },
  { code: "OBT-HT02", name: "Captopril", strength: "25 mg", category: "Hipertensi", form: "Tablet", dosePerDay: 2, qty: 60, unit: "tablet" },
  { code: "OBT-HT03", name: "Bisoprolol", strength: "5 mg", category: "Hipertensi", form: "Tablet", dosePerDay: 1, qty: 30, unit: "tablet" },
  { code: "OBT-DM01", name: "Metformin", strength: "500 mg", category: "Diabetes", form: "Tablet", dosePerDay: 1, qty: 30, unit: "tablet" },
  { code: "OBT-DM02", name: "Glimepirid", strength: "2 mg", category: "Diabetes", form: "Tablet", dosePerDay: 1, qty: 30, unit: "tablet" },
  { code: "OBT-JT01", name: "Simvastatin", strength: "20 mg", category: "Jantung", form: "Tablet", dosePerDay: 1, qty: 30, unit: "tablet" },
  { code: "OBT-JT02", name: "Clopidogrel", strength: "75 mg", category: "Jantung", form: "Tablet", dosePerDay: 1, qty: 30, unit: "tablet" },
  { code: "OBT-JT03", name: "Furosemid", strength: "40 mg", category: "Jantung", form: "Tablet", dosePerDay: 1, qty: 30, unit: "tablet" },
  { code: "OBT-KR01", name: "Allopurinol", strength: "100 mg", category: "Kronis Lainnya", form: "Tablet", dosePerDay: 1, qty: 30, unit: "tablet" },
];
export const DRUG_BY_CODE = Object.fromEntries(DRUGS.map((d) => [d.code, d]));
export const estDays = (drug) => Math.round(drug.qty / drug.dosePerDay);
export const CATEGORIES = ["Hipertensi", "Diabetes", "Jantung", "Kronis Lainnya"];

// Faskes fiktif (bukan fasilitas nyata)
export const FASKES = [
  { id: "F01", name: "FKTP Melati", short: "Melati", type: "FKTP" },
  { id: "F02", name: "FKTP Cempaka", short: "Cempaka", type: "FKTP" },
  { id: "F03", name: "Klinik Pratama Anggrek", short: "Anggrek", type: "Klinik" },
  { id: "F04", name: "Puskesmas Mawar", short: "Mawar", type: "Puskesmas" },
  { id: "F05", name: "RSUD Kenanga", short: "Kenanga", type: "RS" },
  { id: "F06", name: "RS Permata Asri", short: "Permata", type: "RS" },
  { id: "F07", name: "RS Cendana", short: "Cendana", type: "RS" },
  { id: "F08", name: "Klinik Sehat Bersama", short: "Sehat", type: "Klinik" },
  { id: "F09", name: "Puskesmas Dahlia", short: "Dahlia", type: "Puskesmas" },
  { id: "F10", name: "FKTP Teratai", short: "Teratai", type: "FKTP" },
  { id: "F11", name: "RS Harapan Sentosa", short: "Harapan", type: "RS" },
  { id: "F12", name: "Klinik Pratama Seruni", short: "Seruni", type: "Klinik" },
];
export const FASKES_BY_ID = Object.fromEntries(FASKES.map((f) => [f.id, f]));
