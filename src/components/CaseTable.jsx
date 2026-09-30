import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Network, Repeat } from "lucide-react";
import { useEngine } from "../lib/EngineContext";
import { BANDS } from "../lib/risk";
import { fmtFull, fmtShort } from "../lib/dates";
import { RiskBadge, ScorePill, StatusBadge, Badge } from "./Card";

const TH = "text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-600)] px-4 py-3";

function Signals({ p }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {p.signals.rule && <Badge tone="amber"><Repeat size={12} /> Early Refill</Badge>}
      {p.signals.cross && <Badge tone="danger"><Network size={12} /> Cross-Faskes</Badge>}
      {p.signals.ml && <Badge tone="gold">ML Outlier</Badge>}
      {!p.signals.rule && !p.signals.cross && !p.signals.ml && <Badge tone="outline">Tidak ada sinyal</Badge>}
    </div>
  );
}

export default function CaseTable({ rows, pageSize = 10, paged = true, empty = "Tidak ada peserta yang sesuai filter." }) {
  const { openParticipant } = useEngine();
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => setPage(0), [rows.length]);
  const view = paged ? rows.slice(page * pageSize, (page + 1) * pageSize) : rows;
  if (!rows.length) return <p className="py-10 text-center text-sm font-medium text-[var(--color-ink-600)]">{empty}</p>;

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden xl:block overflow-x-auto -mx-2">
        <table className="w-full text-sm min-w-[920px]">
          <thead>
            <tr className="border-b border-leaf-100">
              {["Peserta", "Obat", "Faskes", "Pengambilan Terakhir", "Estimasi Habis", "Interval", "Risk Score", "Status"].map((h) => <th key={h} className={TH}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {view.map((p) => (
              <tr key={p.id} onClick={() => openParticipant(p.id)} className="border-b border-leaf-100/70 hover:bg-leaf-50 cursor-pointer transition-colors">
                <td className="px-4 py-3.5">
                  <button onClick={(e) => { e.stopPropagation(); openParticipant(p.id); }} className="font-bold text-[var(--color-forest-900)] hover:underline">{p.id}</button>
                  <div className="text-xs text-[var(--color-ink-400)] font-medium">{p.nik}</div>
                </td>
                <td className="px-4 py-3.5 font-semibold text-[var(--color-ink-900)]">{p.primary.drug.name}<div className="text-xs text-[var(--color-ink-400)] font-medium">{p.primary.drug.strength}</div></td>
                <td className="px-4 py-3.5 font-semibold">{p.flaggedFaskes.length > 1 ? `${p.flaggedFaskes.length} Faskes` : "1 Faskes"}</td>
                <td className="px-4 py-3.5 font-medium tabular">{fmtFull(p.lastRefill)}</td>
                <td className="px-4 py-3.5 font-medium tabular">{fmtFull(p.estEnd)}</td>
                <td className="px-4 py-3.5 font-semibold tabular">{p.interval != null ? `${p.interval} Hari` : "—"}</td>
                <td className="px-4 py-3.5"><ScorePill score={p.score} band={p.band} /></td>
                <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <ul className="xl:hidden grid gap-3 sm:grid-cols-2">
        {view.map((p) => {
          const b = BANDS[p.band];
          return (
            <li key={p.id}>
              <button onClick={() => openParticipant(p.id)} className="w-full text-left rounded-2xl border border-leaf-100 bg-white hover:bg-leaf-50 p-4 transition-colors" style={{ borderLeft: `5px solid ${b.color}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-[var(--color-forest-900)]">{p.id}</p>
                    <p className="text-sm font-semibold text-[var(--color-ink-900)] truncate">{p.primary.drug.name} {p.primary.drug.strength}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5"><RiskBadge band={p.band} /><StatusBadge status={p.status} /></div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-4xl font-extrabold leading-none tabular" style={{ color: b.color }}>{p.score}</div>
                    <div className="text-[11px] font-bold text-[var(--color-ink-400)] mt-1">RISK SCORE</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div><p className="text-[var(--color-ink-400)] font-semibold">Terakhir</p><p className="font-bold text-[var(--color-ink-900)] tabular">{fmtShort(p.lastRefill)}</p></div>
                  <div><p className="text-[var(--color-ink-400)] font-semibold">Habis (est.)</p><p className="font-bold text-[var(--color-ink-900)] tabular">{fmtShort(p.estEnd)}</p></div>
                  <div><p className="text-[var(--color-ink-400)] font-semibold">Interval</p><p className="font-bold text-[var(--color-ink-900)] tabular">{p.interval != null ? `${p.interval} hari` : "—"}</p></div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <Signals p={p} />
                  <span className="text-xs font-semibold text-[var(--color-ink-600)] inline-flex items-center gap-1 shrink-0"><Clock size={12} />{p.flaggedFaskes.length > 1 ? `${p.flaggedFaskes.length} faskes` : "1 faskes"}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {paged && pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm font-medium text-[var(--color-ink-600)]">
          <span>{page * pageSize + 1}–{Math.min(rows.length, (page + 1) * pageSize)} dari {rows.length}</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 0} onClick={() => setPage((x) => x - 1)} className="w-10 h-10 grid place-items-center rounded-xl bg-white border border-leaf-100 disabled:opacity-40 hover:bg-leaf-50" aria-label="Sebelumnya"><ChevronLeft size={18} /></button>
            <span className="font-semibold text-[var(--color-forest-900)] tabular">{page + 1} / {pages}</span>
            <button disabled={page >= pages - 1} onClick={() => setPage((x) => x + 1)} className="w-10 h-10 grid place-items-center rounded-xl bg-white border border-leaf-100 disabled:opacity-40 hover:bg-leaf-50" aria-label="Berikutnya"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
