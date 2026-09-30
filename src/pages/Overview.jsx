import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowRight, ChevronRight, Network, ShieldAlert, Users, ClipboardCheck, Cpu, Repeat, UserCheck } from "lucide-react";
import { Card, Badge, SectionHeading, btnGhost, btnPrimary } from "../components/Card";
import CaseTable from "../components/CaseTable";
import { useEngine } from "../lib/EngineContext";
import { BANDS } from "../lib/risk";

function Kpi({ icon: Icon, label, value, hint, tone = "leaf", onClick }) {
  const tones = { leaf: "bg-leaf-50 text-[var(--color-forest-700)]", danger: "bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high)]", amber: "bg-[#fff2e0] text-[#b35f00]", gold: "bg-[#fff8e6] text-[#8a6600]" };
  return (
    <Card className="p-4 sm:p-5 cursor-pointer" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick?.()}>
      <div className={`w-9 h-9 rounded-lg grid place-items-center mb-3 ${tones[tone]}`}><Icon size={17} /></div>
      <p className="text-xs font-semibold text-[var(--color-ink-600)] uppercase tracking-wide leading-snug min-h-[2.25rem]">{label}</p>
      <p className="text-3xl sm:text-4xl font-extrabold text-[var(--color-forest-900)] mt-1 tabular">{value}</p>
      <p className="text-xs font-medium text-[var(--color-ink-400)] mt-1">{hint}</p>
    </Card>
  );
}

const STEPS = [
  { icon: Repeat, t: "Lapis 1 · Rule-Based", d: "Interval, jumlah, estimasi durasi" },
  { icon: Network, t: "Lapis 2 · Cross-Faskes", d: "Obat sama di beberapa faskes" },
  { icon: Cpu, t: "Lapis 3 · ML Scoring", d: "Isolation Forest → risk score" },
  { icon: UserCheck, t: "Verifikasi Manusia", d: "Keputusan akhir di verifikator" },
];

export default function Overview({ onNavigate }) {
  const { rows } = useEngine();
  const counts = { high: 0, medium: 0, low: 0 };
  rows.forEach((p) => counts[p.band]++);
  const anomaly = counts.high + counts.medium;
  const cross = rows.filter((p) => p.nCross > 0).length;
  const queue = rows.filter((p) => p.status === "Perlu Verifikasi" || p.status === "Ditandai Verifikasi").length;
  const priority = rows.filter((p) => p.band !== "low" && p.status !== "Dalam Tinjauan").sort((a, b) => b.score - a.score).slice(0, 8);
  const pie = ["low", "medium", "high"].map((k) => ({ key: k, name: BANDS[k].en, value: counts[k], color: BANDS[k].color }));

  return (
    <div className="space-y-6 animate-rise">
      {/* Hero */}
      <Card className="relative overflow-hidden !rounded-[1.5rem]">
        <div className="grid lg:grid-cols-[1.25fr_1fr] items-stretch">
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <Badge tone="gold" className="w-fit mb-3">Synthetic / Demo Data · 1 Jun – 30 Sep 2026</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-forest-900)] leading-tight">
              Deteksi pola pengambilan obat yang tidak wajar sebelum menjadi risiko yang lebih besar.
            </h2>
            <p className="text-[var(--color-ink-600)] mt-2 max-w-lg font-medium">
              Ada <b className="text-[var(--color-risk-high)]">{counts.high} kasus berisiko tinggi</b> yang direkomendasikan untuk verifikasi. Sistem menemukan indikasi. Verifikator mengambil keputusan.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <button onClick={() => onNavigate("risk", { risk: "high" })} className={btnPrimary}><ShieldAlert size={16} />Lihat kasus prioritas</button>
              <button onClick={() => onNavigate("rules")} className={btnGhost}>Cara kerja engine<ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="hidden md:flex bg-grid-dark text-white p-6 sm:p-8 flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-gold-400)] mb-3">Alur engine deteksi</p>
            <ol className="space-y-2.5">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex items-center gap-3 rounded-2xl bg-white/10 px-3.5 py-2.5">
                  <span className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center shrink-0"><s.icon size={17} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-bold">{s.t}</span><span className="block text-xs text-white/75 font-medium">{s.d}</span></span>
                  <span className="text-xs font-bold text-white/50">{i + 1}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Kpi icon={Users} label="Total Peserta Dianalisis" value={rows.length} hint="Dataset sintetis" onClick={() => onNavigate("participants")} />
        <Kpi icon={ShieldAlert} tone="amber" label="Peserta Terindikasi Anomali" value={anomaly} hint={`${((anomaly / rows.length) * 100).toFixed(0)}% dari total`} onClick={() => onNavigate("risk")} />
        <Kpi icon={Network} tone="danger" label="Cross-Faskes Anomaly" value={cross} hint="Obat sama, faskes berbeda" onClick={() => onNavigate("cross")} />
        <Kpi icon={ClipboardCheck} tone="gold" label="Perlu Verifikasi" value={queue} hint="Antrean verifikator" onClick={() => onNavigate("risk", { risk: "high" })} />
      </div>

      {/* Risk overview */}
      <Card className="p-5 sm:p-6">
        <SectionHeading eyebrow="Distribusi Risiko" title="Risk Overview" subtitle="Risk Score bukan keputusan akhir — gunakan untuk memprioritaskan tinjauan." />
        <div className="grid md:grid-cols-[220px_1fr] gap-6 items-center">
          <div className="h-52 relative mx-auto w-52 md:w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none">
                  {pie.map((e) => <Cell key={e.key} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-leaf-100)", fontSize: 13 }} formatter={(v, n) => [`${v} peserta`, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center"><div className="text-3xl font-extrabold text-[var(--color-forest-900)] tabular">{rows.length}</div><div className="text-xs font-semibold text-[var(--color-ink-400)]">peserta</div></div>
            </div>
          </div>
          <div className="grid gap-3">
            {["low", "medium", "high"].map((k) => (
              <button key={k} onClick={() => onNavigate(k === "low" ? "participants" : "risk", { risk: k })} className="text-left rounded-2xl border border-leaf-100 p-4 hover:bg-leaf-50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: BANDS[k].color }} />
                    <div className="min-w-0"><p className="text-sm font-bold text-[var(--color-forest-900)]">{BANDS[k].en}</p><p className="text-xs font-medium text-[var(--color-ink-600)]">{BANDS[k].label}</p></div>
                  </div>
                  <p className="text-2xl font-extrabold tabular" style={{ color: BANDS[k].color }}>{counts[k]} <span className="text-sm font-semibold text-[var(--color-ink-600)]">peserta</span></p>
                </div>
                <div className="h-2 rounded-full bg-leaf-50 mt-3 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(counts[k] / rows.length) * 100}%`, background: BANDS[k].color }} /></div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Priority cases */}
      <Card className="p-5 sm:p-6">
        <SectionHeading
          eyebrow="Prioritas"
          title="Peserta yang Memerlukan Verifikasi"
          subtitle="Diurutkan berdasarkan Risk Score tertinggi."
          action={<button onClick={() => onNavigate("risk")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-forest-900)] hover:underline">Lihat semua <ArrowRight size={15} /></button>}
        />
        <CaseTable rows={priority} paged={false} />
      </Card>
    </div>
  );
}
