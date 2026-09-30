import { useState } from "react";
import { Eye } from "lucide-react";
import { Card, Badge, RiskBadge, SectionHeading, btnGhost } from "../components/Card";
import { Timeline, CoverageBars } from "../components/Timeline";
import { useEngine } from "../lib/EngineContext";
import { DRUG_BY_CODE } from "../lib/reference";

export const selectCls = "h-11 w-full rounded-xl bg-white border border-leaf-100 px-3 text-base sm:text-sm font-semibold text-[var(--color-forest-900)] focus:border-[var(--color-forest-700)] focus:outline-none";

export default function MedicationHistory() {
  const { rows, byId, focusId, setFocusId, openParticipant } = useEngine();
  const sorted = [...rows].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const id = focusId && byId[focusId] ? focusId : sorted[0].id;
  const p = byId[id];
  const [code, setCode] = useState(null);
  const active = code && p.stats[code] ? code : p.primaryCode;
  const st = p.stats[active];

  return (
    <div className="space-y-6 animate-rise">
      <Card className="p-5 sm:p-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-600)]">Pilih peserta</span>
            <select value={id} onChange={(e) => { setFocusId(e.target.value); setCode(null); }} className={`${selectCls} mt-1.5`}>
              {sorted.map((r) => <option key={r.id} value={r.id}>{r.id} · skor {r.score} · {r.primary.drug.name}</option>)}
            </select>
          </label>
          <button onClick={() => openParticipant(id)} className={btnGhost}><Eye size={16} />Buka profil risiko</button>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <SectionHeading eyebrow="Riwayat Pengambilan Obat" title={`${p.id} · ${st.drug.name} ${st.drug.strength}`} subtitle={`Estimasi durasi ${st.est} hari per pengambilan · ${st.seq.length} pengambilan dalam periode analisis`} action={<RiskBadge band={p.band} />} />
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {p.drugCodes.length > 1 && (
            <div className="inline-flex rounded-xl bg-leaf-50 p-1 mr-1">
              {p.drugCodes.map((c) => <button key={c} onClick={() => setCode(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${c === active ? "bg-[var(--color-forest-900)] text-white" : "text-[var(--color-forest-900)]"}`}>{DRUG_BY_CODE[c].name}</button>)}
            </div>
          )}
          <Badge tone="amber">{st.nEarly} early refill</Badge>
          <Badge tone="danger">{st.nCross} cross-faskes</Badge>
          <Badge tone="leaf">{new Set(st.seq.map((r) => r.faskesId)).size} faskes</Badge>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Timeline seq={st.seq} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-600)] mb-3">Estimasi persediaan</p>
            <div className="rounded-2xl border border-leaf-100 p-4"><CoverageBars seq={st.seq} /></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
