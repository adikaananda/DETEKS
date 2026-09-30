// Generator dataset SINTETIS (200 peserta). Tidak ada data pasien nyata.
// Ganti fungsi ini dengan pemanggilan API/backend saat integrasi data sesungguhnya.
import { DRUGS, FASKES, estDays } from "./reference";
import { addDays } from "./dates";

export const PERIOD = { start: "2026-06-01", end: "2026-09-30" };

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export { mulberry32 };

export function generateDataset({ seed = 2026, n = 200, patterns = { early: 6, cross: 10, cross2: 4, repeat: 6 }, mild = 8 } = {}) {
  const rand = mulberry32(seed);
  const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };

  const order = shuffle([...Array(n).keys()]);
  const plan = [];
  Object.entries(patterns).forEach(([k, c]) => { for (let i = 0; i < c; i++) plan.push(k); });
  const patternOf = new Map(order.slice(0, plan.length).map((idx, k) => [idx, plan[k]]));
  const mildSet = new Set(order.slice(plan.length, plan.length + mild));

  const regions = ["3273", "5171", "3171", "3374", "1271", "3578"];
  const participants = [];
  const records = [];
  let rid = 1;

  function buildSeq(drug, pattern, home, isMild) {
    const est = estDays(drug);
    const start = addDays(PERIOD.start, pattern ? ri(0, 20) : ri(0, 29));
    const out = [];
    let date = start, faskes = home;
    const used = [home];
    const push = () => out.push({ date, faskesId: faskes, qty: drug.qty });
    push();
    const steps =
      pattern === "early" ? [est, est, ri(9, 14), ri(9, 14)]
      : pattern === "cross" ? [est, ri(8, 13), ri(6, 10)]
      : pattern === "cross2" ? [est, ri(9, 13)]
      : pattern === "repeat" ? [est, ri(8, 12), ri(6, 9), ri(7, 10)]
      : [];
    let k = 0, mildDone = false;
    const altHome = pick(FASKES.filter((f) => f.id !== home)).id;
    const moveAt = !pattern && rand() < 0.3 ? 2 : -1;
    while (true) {
      let gap;
      if (k < steps.length) {
        gap = steps[k];
        if (k > 0 && pattern !== "early") {
          const cand = FASKES.filter((f) => !used.includes(f.id));
          faskes = pick(cand).id; used.push(faskes);
        }
      } else {
        gap = est + ri(-2, 6);
        if (isMild && !mildDone && out.length >= 2) { gap = est - ri(5, 8); mildDone = true; }
      }
      if (k === moveAt) faskes = altHome;
      date = addDays(date, gap);
      if (date > PERIOD.end) break;
      push();
      k++;
    }
    return out;
  }

  for (let i = 0; i < n; i++) {
    const pid = `PST-${String(i + 1).padStart(3, "0")}`;
    const pattern = patternOf.get(i) || null;
    const nDrugs = rand() < 0.4 ? 2 : 1;
    const drugs = shuffle([...DRUGS]).slice(0, nDrugs);
    const home = pick(FASKES).id;
    const digits = (c) => Array.from({ length: c }, () => ri(0, 9)).join("");
    participants.push({
      id: pid,
      nik: `${pick(regions)}${"•".repeat(10)}${digits(2)}`,
      bpjs: `0001${"•".repeat(7)}${digits(3)}`,
    });
    drugs.forEach((drug, di) => {
      const seq = buildSeq(drug, di === 0 ? pattern : null, di === 0 || pattern ? home : pick(FASKES).id, mildSet.has(i) && di === 0);
      seq.forEach((s) => records.push({ id: `R${String(rid++).padStart(4, "0")}`, pid, drugCode: drug.code, dosePerDay: drug.dosePerDay, ...s }));
    });
  }
  records.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { participants, records, seed };
}
