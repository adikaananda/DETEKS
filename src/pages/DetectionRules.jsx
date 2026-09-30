import { Minus, Plus, Repeat, Network, Layers, Cpu, ShieldCheck, Ban } from "lucide-react";
import { Card, Badge, SectionHeading } from "../components/Card";
import { useEngine } from "../lib/EngineContext";
import { DEFAULT_CFG } from "../lib/engine";
import { BANDS } from "../lib/risk";

const RULES = [
  { icon: Repeat, name: "Early Refill", cond: "Actual Interval < Estimated Duration − Toleransi", then: "Flag", tag: "Lapis 1 · Rule-Based" },
  { icon: Network, name: "Cross-Faskes", cond: "Same Participant + Same Medication + Different Facility (persediaan sebelumnya belum habis)", then: "Flag", tag: "Lapis 2 · Cross-Faskes" },
  { icon: Layers, name: "Multiple Early Refill", cond: "Early Refill terjadi berulang", then: "Increase Risk", tag: "Lapis 1 · Rule-Based" },
  { icon: Cpu, name: "ML Anomaly", cond: "Isolation Forest mendeteksi pola outlier", then: "Add Anomaly Signal", tag: "Lapis 3 · ML Scoring" },
];

export default function DetectionRules() {
  const { cfg, setCfg, rows } = useEngine();
  const tol = cfg.toleranceDays;
  const step = (d) => setCfg((c) => ({ ...c, toleranceDays: Math.min(10, Math.max(0, c.toleranceDays + d)) }));
  const early = rows.filter((p) => p.nEarly > 0).length;
  const anomaly = rows.filter((p) => p.band !== "low").length;
  const cfgTag = <Badge tone="gold">Configurable / Subject to Validation</Badge>;

  return (
    <div className="space-y-6 animate-rise">
      <div className="grid md:grid-cols-2 gap-4">
        {RULES.map((r, i) => (
          <Card key={r.name} className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-leaf-50 text-[var(--color-forest-700)] grid place-items-center shrink-0"><r.icon size={18} /></span>
                <div className="min-w-0"><p className="text-xs font-semibold text-[var(--color-ink-400)]">Rule {i + 1} · {r.tag}</p><h3 className="text-lg font-bold text-[var(--color-forest-900)]">{r.name}</h3></div>
              </div>
            </div>
            <div className="rounded-2xl bg-leaf-50 p-4 space-y-2">
              <p className="text-sm font-medium text-[var(--color-ink-900)]"><span className="font-bold text-[var(--color-forest-700)]">Jika: </span>{r.cond}</p>
              <p className="text-sm font-medium text-[var(--color-ink-900)]"><span className="font-bold text-[var(--color-forest-700)]">Maka: </span>→ {r.then}</p>
            </div>
            <div className="mt-3">{cfgTag}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <Card className="p-5 sm:p-6">
          <SectionHeading eyebrow="Parameter" title="Konfigurasi Engine" subtitle="Ubah toleransi untuk melihat hasil dihitung ulang pada 200 peserta sintetis." action={cfgTag} />
          <div className="rounded-2xl border border-leaf-100 p-4 flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-sm font-bold text-[var(--color-forest-900)]">Toleransi early refill</p><p className="text-xs font-medium text-[var(--color-ink-600)]">Pengambilan dianggap wajar jika ≥ (estimasi durasi − toleransi) hari.</p></div>
            <div className="flex items-center gap-3">
              <button onClick={() => step(-1)} className="w-11 h-11 rounded-xl bg-white border border-leaf-100 grid place-items-center hover:bg-leaf-50" aria-label="Kurangi toleransi"><Minus size={18} /></button>
              <span className="text-3xl font-extrabold text-[var(--color-forest-900)] tabular w-16 text-center">{tol}<span className="text-sm font-semibold text-[var(--color-ink-600)]"> hr</span></span>
              <button onClick={() => step(1)} className="w-11 h-11 rounded-xl bg-white border border-leaf-100 grid place-items-center hover:bg-leaf-50" aria-label="Tambah toleransi"><Plus size={18} /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-2xl bg-leaf-50 p-4"><p className="text-xs font-semibold text-[var(--color-ink-600)] uppercase tracking-wide">Early refill</p><p className="text-3xl font-extrabold text-[var(--color-forest-900)] tabular">{early}</p><p className="text-xs font-medium text-[var(--color-ink-400)]">peserta</p></div>
            <div className="rounded-2xl bg-leaf-50 p-4"><p className="text-xs font-semibold text-[var(--color-ink-600)] uppercase tracking-wide">Terindikasi anomali</p><p className="text-3xl font-extrabold text-[var(--color-forest-900)] tabular">{anomaly}</p><p className="text-xs font-medium text-[var(--color-ink-400)]">peserta</p></div>
          </div>
          {tol !== DEFAULT_CFG.toleranceDays && <button onClick={() => setCfg(DEFAULT_CFG)} className="mt-3 text-sm font-semibold text-[var(--color-forest-900)] hover:underline">Kembalikan ke default ({DEFAULT_CFG.toleranceDays} hari)</button>}

          <h3 className="text-base font-bold text-[var(--color-forest-900)] mt-6 mb-3">Bobot Risk Score</h3>
          <div className="space-y-3">
            {[["Rule-Based", cfg.weights.rule], ["Cross-Faskes", cfg.weights.cross], ["ML Anomaly (Isolation Forest)", cfg.weights.ml]].map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-sm font-semibold"><span>{k}</span><span className="tabular text-[var(--color-forest-900)]">{v}%</span></div>
                <div className="h-2.5 rounded-full bg-leaf-50 mt-1.5 overflow-hidden"><div className="h-full rounded-full bg-[var(--color-forest-700)]" style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
          <h3 className="text-base font-bold text-[var(--color-forest-900)] mt-6 mb-3">Interpretasi Skor</h3>
          <div className="grid sm:grid-cols-3 gap-2.5">
            {[["low", `0 – ${cfg.lowMax}`], ["medium", `${cfg.lowMax + 1} – ${cfg.highMin - 1}`], ["high", `${cfg.highMin} – 100`]].map(([k, r]) => (
              <div key={k} className="rounded-2xl p-3.5" style={{ background: BANDS[k].soft }}><p className="text-sm font-bold" style={{ color: BANDS[k].color }}>{BANDS[k].label}</p><p className="text-xl font-extrabold tabular text-[var(--color-ink-900)]">{r}</p></div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[var(--color-forest-900)] mb-3"><ShieldCheck size={18} /><h3 className="text-base font-bold">Prinsip Keputusan</h3></div>
            <ul className="space-y-2.5 text-sm font-medium text-[var(--color-ink-900)]">
              <li>• DETEKS adalah decision-support; skor untuk memprioritaskan tinjauan.</li>
              <li>• Keputusan akhir selalu oleh verifikator manusia.</li>
              <li>• Setiap skor disertai alasan (explainable).</li>
            </ul>
          </Card>
          <Card className="p-5 sm:p-6 !bg-[var(--color-risk-high-bg)] !border-[#f3c3bd]">
            <div className="flex items-center gap-2 text-[var(--color-risk-high)] mb-3"><Ban size={18} /><h3 className="text-base font-bold">Yang tidak dilakukan DETEKS</h3></div>
            <ul className="space-y-2.5 text-sm font-semibold text-[var(--color-ink-900)]">
              <li>• Tidak ada blacklist atau pemblokiran peserta otomatis.</li>
              <li>• Tidak menolak atau menangguhkan klaim secara otomatis.</li>
              <li>• Tidak menyatakan peserta pasti melakukan pelanggaran.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
