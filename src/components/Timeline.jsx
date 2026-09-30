import { AlertTriangle, Network } from "lucide-react";
import { FASKES_BY_ID } from "../lib/reference";
import { diffDays, fmtFull, fmtShort, toMs } from "../lib/dates";
import { Badge } from "./Card";

export function Timeline({ seq }) {
  return (
    <ol className="relative">
      {seq.map((r, i) => {
        const flagged = r.early;
        const f = FASKES_BY_ID[r.faskesId];
        return (
          <li key={r.id} className="relative pl-10 pb-5 last:pb-0">
            {i < seq.length - 1 && <span className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-leaf-100" aria-hidden />}
            <span className={`absolute left-0 top-1 w-8 h-8 rounded-full grid place-items-center text-white ${r.cross ? "bg-[var(--color-risk-high)]" : flagged ? "bg-[var(--color-amber-500)]" : "bg-[var(--color-forest-700)]"}`}>
              {r.cross ? <Network size={15} /> : flagged ? <AlertTriangle size={15} /> : <span className="w-2 h-2 rounded-full bg-white" />}
            </span>
            <div className={`rounded-2xl border p-3.5 ${r.cross ? "border-[#f3c3bd] bg-[var(--color-risk-high-bg)]" : flagged ? "border-[#ffd9a8] bg-[#fff8ee]" : "border-leaf-100 bg-white"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-bold text-[var(--color-forest-900)] tabular">{fmtShort(r.date)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.early && <Badge tone="amber">⚠ Early Refill</Badge>}
                  {r.cross && <Badge tone="danger">⚠ Cross-Faskes</Badge>}
                </div>
              </div>
              <p className="text-sm font-semibold text-[var(--color-ink-900)] mt-1">{f.name}</p>
              <p className="text-sm text-[var(--color-ink-600)] font-medium">{r.qty} tablet · estimasi habis {fmtShort(r.estEnd)}{r.gap != null ? ` · interval ${r.gap} hari` : ""}</p>
              {r.early && (
                <p className="text-xs font-semibold mt-1.5" style={{ color: r.cross ? "var(--color-risk-high)" : "#b35f00" }}>
                  Persediaan sebelumnya diperkirakan masih ±{r.remaining} hari
                  {r.cross && r.coveringFaskes.length ? ` (${r.coveringFaskes.map((c) => FASKES_BY_ID[c].short).join(", ")})` : ""}.
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const PALETTE = ["#1e5e3a", "#2a9d8f", "#e9a820", "#5b7083", "#8a5a9b"];

// Estimasi persediaan per pengambilan: bar dari tanggal ambil sampai estimasi habis.
export function CoverageBars({ seq }) {
  const min = toMs(seq[0].date);
  const max = Math.max(...seq.map((r) => toMs(r.estEnd)));
  const span = Math.max(1, max - min);
  const order = [...new Set(seq.map((r) => r.faskesId))];
  return (
    <div>
      <div className="space-y-2.5">
        {seq.map((r) => {
          const left = ((toMs(r.date) - min) / span) * 100;
          const width = ((toMs(r.estEnd) - toMs(r.date)) / span) * 100;
          const color = PALETTE[order.indexOf(r.faskesId) % PALETTE.length];
          return (
            <div key={r.id} className="flex items-center gap-3">
              <div className="w-20 sm:w-24 shrink-0 text-xs font-semibold text-[var(--color-ink-600)] leading-tight">
                <span className="block text-[var(--color-forest-900)] font-bold truncate">{FASKES_BY_ID[r.faskesId].short}</span>
                <span className="tabular">{fmtShort(r.date)}</span>
              </div>
              <div className="relative flex-1 h-7 rounded-lg bg-leaf-50">
                <div className="absolute top-0 h-7 rounded-lg" style={{ left: `${left}%`, width: `${Math.max(width, 3)}%`, background: color, outline: r.early ? "2.5px solid var(--color-risk-high)" : "none", outlineOffset: 1 }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pl-[5.75rem] sm:pl-[6.75rem] text-xs font-semibold text-[var(--color-ink-600)]">
        <span className="tabular">{fmtFull(seq[0].date)} → {fmtFull(seq.map((r) => r.estEnd).sort().at(-1))} ({diffDays(seq[0].date, seq.map((r) => r.estEnd).sort().at(-1))} hari)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border-2 border-[var(--color-risk-high)]" /> Pengambilan saat persediaan belum habis</span>
      </div>
    </div>
  );
}
