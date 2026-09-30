import { Search, X } from "lucide-react";
import { useEngine } from "../lib/EngineContext";
import { DRUGS, FASKES } from "../lib/reference";

const sel = "h-11 w-full rounded-xl bg-white border border-leaf-100 px-3 text-base sm:text-sm font-semibold text-[var(--color-forest-900)] focus:border-[var(--color-forest-700)] focus:outline-none";

export default function Filters({ total, shown }) {
  const { flt, setFlt } = useEngine();
  const set = (k) => (e) => setFlt((f) => ({ ...f, [k]: e.target.value }));
  const active = flt.q || flt.risk || flt.drug || flt.faskes;
  return (
    <div className="mb-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <label className="relative block sm:col-span-2 lg:col-span-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-400)]" />
          <input value={flt.q} onChange={set("q")} placeholder="Cari ID peserta / obat" className={`${sel} pl-10 font-medium`} aria-label="Cari peserta" />
        </label>
        <select value={flt.risk} onChange={set("risk")} className={sel} aria-label="Filter risiko">
          <option value="">Semua risiko</option>
          <option value="high">Risiko Tinggi</option>
          <option value="medium">Perlu Perhatian</option>
          <option value="low">Risiko Rendah</option>
        </select>
        <select value={flt.drug} onChange={set("drug")} className={sel} aria-label="Filter obat">
          <option value="">Semua obat</option>
          {DRUGS.map((d) => <option key={d.code} value={d.code}>{d.name} {d.strength}</option>)}
        </select>
        <select value={flt.faskes} onChange={set("faskes")} className={sel} aria-label="Filter faskes">
          <option value="">Semua faskes</option>
          {FASKES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div className="flex items-center justify-between mt-3 text-sm font-medium text-[var(--color-ink-600)]">
        <span>{shown} dari {total} peserta</span>
        {active && (
          <button onClick={() => setFlt({ q: "", risk: "", drug: "", faskes: "" })} className="inline-flex items-center gap-1 font-semibold text-[var(--color-forest-900)] hover:underline">
            <X size={14} /> Reset filter
          </button>
        )}
      </div>
    </div>
  );
}
