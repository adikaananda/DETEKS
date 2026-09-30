import { Eye, Network, Pill, User } from "lucide-react";
import { Card, Badge, RiskBadge, SectionHeading, btnGhost } from "../components/Card";
import { CoverageBars } from "../components/Timeline";
import { useEngine } from "../lib/EngineContext";
import { FASKES_BY_ID } from "../lib/reference";
import { fmtShort } from "../lib/dates";
import { selectCls } from "./MedicationHistory";

function group(seq) {
  const m = new Map();
  seq.forEach((r) => { if (!m.has(r.faskesId)) m.set(r.faskesId, []); m.get(r.faskesId).push(r); });
  return [...m.entries()];
}

export default function CrossFaskes() {
  const { rows, byId, focusId, setFocusId, openParticipant } = useEngine();
  const cases = rows.filter((p) => p.nCross > 0).sort((a, b) => b.score - a.score);
  const id = focusId && byId[focusId]?.nCross > 0 ? focusId : cases[0]?.id;
  if (!id) return <Card className="p-6 text-sm font-medium">Tidak ada pola cross-faskes pada pengaturan saat ini.</Card>;
  const p = byId[id];
  const st = p.primary;
  const groups = group(st.seq.filter((r) => st.flaggedFaskes.has(r.faskesId)));
  const flaggedSeq = st.seq.filter((r) => st.flaggedFaskes.has(r.faskesId));

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-6 animate-rise">
      {/* Picker */}
      <div className="lg:hidden">
        <select value={id} onChange={(e) => setFocusId(e.target.value)} className={selectCls} aria-label="Pilih kasus cross-faskes">
          {cases.map((r) => <option key={r.id} value={r.id}>{r.id} · skor {r.score} · {r.primary.drug.name}</option>)}
        </select>
      </div>
      <Card className="hidden lg:block p-3 max-h-[calc(100vh-9rem)] overflow-y-auto sticky top-24 self-start">
        <p className="px-3 pt-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-400)]">{cases.length} kasus cross-faskes</p>
        {cases.map((r) => (
          <button key={r.id} onClick={() => setFocusId(r.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${r.id === id ? "bg-[var(--color-forest-900)] text-white" : "hover:bg-leaf-50"}`}>
            <span className={`text-lg font-extrabold tabular w-9 ${r.id === id ? "text-white" : ""}`} style={r.id === id ? undefined : { color: r.band === "high" ? "#c0392b" : "#b35f00" }}>{r.score}</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{r.id}</span><span className={`block text-xs font-medium ${r.id === id ? "text-white/80" : "text-[var(--color-ink-600)]"}`}>{r.primary.drug.name} · {r.flaggedFaskes.length} faskes</span></span>
          </button>
        ))}
      </Card>

      {/* Detail */}
      <div className="space-y-6 min-w-0">
        <Card className="p-5 sm:p-6">
          <SectionHeading eyebrow="Cross-Faskes Analysis" title="Peserta → Obat → Faskes" subtitle="Obat yang sama diambil di beberapa faskes saat estimasi persediaan sebelumnya belum habis." action={<RiskBadge band={p.band} />} />

          <div className="max-w-xl">
            <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-forest-900)] text-white p-4">
              <span className="w-10 h-10 rounded-xl bg-white/15 grid place-items-center shrink-0"><User size={18} /></span>
              <div className="min-w-0 flex-1"><p className="text-lg font-extrabold leading-tight">{p.id}</p><p className="text-xs font-medium text-white/75 font-mono truncate">{p.nik}</p></div>
              <div className="text-right"><p className="text-2xl font-extrabold tabular leading-none">{p.score}</p><p className="text-[11px] font-semibold text-white/70">RISK SCORE</p></div>
            </div>

            <div className="ml-5 pl-5 border-l-2 border-leaf-100 pt-4">
              <div className="relative flex items-center gap-3 rounded-2xl border border-[var(--color-forest-700)]/30 bg-[var(--color-leaf-100)] p-4 before:absolute before:-left-5 before:top-1/2 before:w-5 before:border-t-2 before:border-leaf-100">
                <span className="w-10 h-10 rounded-xl bg-white grid place-items-center text-[var(--color-forest-900)] shrink-0"><Pill size={18} /></span>
                <div className="min-w-0"><p className="text-base font-bold text-[var(--color-forest-900)]">{st.drug.name} {st.drug.strength}</p><p className="text-xs font-semibold text-[var(--color-ink-600)]">Estimasi {st.est} hari · {st.nCross} kejadian cross-faskes</p></div>
              </div>

              <div className="ml-5 pl-5 border-l-2 border-leaf-100 pt-3 space-y-3 pb-1">
                {groups.map(([fid, recs]) => {
                  const f = FASKES_BY_ID[fid];
                  const hit = recs.some((r) => r.cross);
                  return (
                    <div key={fid} className={`relative rounded-2xl border p-3.5 before:absolute before:-left-5 before:top-7 before:w-5 before:border-t-2 before:border-leaf-100 ${hit ? "border-[#f3c3bd] bg-[var(--color-risk-high-bg)]" : "border-leaf-100 bg-white"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-[var(--color-forest-900)] flex items-center gap-1.5"><Network size={15} />{f.name}</p>
                        <Badge tone="outline">{f.type}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {recs.map((r) => <Badge key={r.id} tone={r.cross ? "danger" : r.early ? "amber" : "leaf"}>{fmtShort(r.date)}{r.cross ? " · Cross-Faskes" : r.early ? " · Early" : ""}</Badge>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionHeading eyebrow="Timeline Persediaan" title="Tumpang tindih estimasi persediaan" subtitle="Setiap bar = pengambilan sampai estimasi habis. Bar bergaris merah diambil saat persediaan sebelumnya belum habis." />
          <CoverageBars seq={flaggedSeq} />
          <div className="mt-5"><button onClick={() => openParticipant(p.id)} className={btnGhost}><Eye size={16} />Buka profil risiko & rekomendasi</button></div>
        </Card>
      </div>
    </div>
  );
}
