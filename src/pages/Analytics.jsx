import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Network, Repeat, ShieldAlert, Users } from "lucide-react";
import { Card, SectionHeading } from "../components/Card";
import { useEngine } from "../lib/EngineContext";
import { DRUG_BY_CODE, FASKES } from "../lib/reference";

const tip = { borderRadius: 12, border: "1px solid var(--color-leaf-100)", fontSize: 13 };
const tick = { fill: "var(--color-ink-600)", fontSize: 12, fontWeight: 600 };

function Stat({ icon: Icon, label, value, hint, bg, fg }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="w-9 h-9 rounded-lg grid place-items-center mb-3" style={{ background: bg, color: fg }}><Icon size={17} /></div>
      <p className="text-xs font-semibold text-[var(--color-ink-600)] uppercase tracking-wide leading-snug min-h-[2.25rem]">{label}</p>
      <p className="text-3xl font-extrabold text-[var(--color-forest-900)] mt-1 tabular">{value}</p>
      <p className="text-xs font-medium text-[var(--color-ink-400)] mt-1">{hint}</p>
    </Card>
  );
}

export default function Analytics() {
  const { rows } = useEngine();
  const anomalies = rows.filter((p) => p.band !== "low");
  const hist = Array.from({ length: 10 }, (_, i) => ({ range: `${i * 10}–${i === 9 ? 100 : i * 10 + 9}`, value: 0, mid: i * 10 + 5 }));
  rows.forEach((p) => { hist[Math.min(9, Math.floor(p.score / 10))].value++; });
  const histColor = (mid) => (mid >= 70 ? "#c0392b" : mid >= 40 ? "#ff8a00" : "#4caf50");

  const byDrug = {};
  anomalies.forEach((p) => { const n = DRUG_BY_CODE[p.primaryCode].name; byDrug[n] = (byDrug[n] || 0) + 1; });
  const drugData = Object.entries(byDrug).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const byFaskes = {};
  rows.filter((p) => p.nCross > 0).forEach((p) => p.flaggedFaskes.forEach((f) => { byFaskes[f] = (byFaskes[f] || 0) + 1; }));
  const faskesData = FASKES.map((f) => ({ name: f.short, value: byFaskes[f.id] || 0 })).filter((x) => x.value).sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <div className="space-y-6 animate-rise">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Stat icon={Users} label="Peserta dianalisis" value={rows.length} hint="Dataset sintetis" bg="#f5faf4" fg="#2f7d52" />
        <Stat icon={ShieldAlert} label="Jumlah anomaly" value={anomalies.length} hint="Perlu Perhatian + Risiko Tinggi" bg="#fff2e0" fg="#b35f00" />
        <Stat icon={Repeat} label="Early refill cases" value={rows.filter((p) => p.nEarly > 0).length} hint="Termasuk skor rendah" bg="#fff8e6" fg="#8a6600" />
        <Stat icon={Network} label="Cross-faskes cases" value={rows.filter((p) => p.nCross > 0).length} hint="Obat sama, faskes berbeda" bg="#fdecec" fg="#c0392b" />
      </div>

      <Card className="p-5 sm:p-6">
        <SectionHeading eyebrow="Distribusi" title="Distribusi Risk Score" subtitle="Jumlah peserta per rentang skor (0–100)." />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hist} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-leaf-100)" />
              <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ ...tick, fontSize: 11 }} interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
              <Tooltip cursor={{ fill: "var(--color-leaf-50)" }} contentStyle={tip} formatter={(v) => [`${v} peserta`, "Jumlah"]} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>{hist.map((h) => <Cell key={h.range} fill={histColor(h.mid)} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6">
          <SectionHeading eyebrow="Obat" title="Obat dengan Anomaly Terbanyak" />
          <div style={{ height: Math.max(180, drugData.length * 44) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={drugData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="var(--color-leaf-100)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={86} axisLine={false} tickLine={false} tick={tick} />
                <Tooltip cursor={{ fill: "var(--color-leaf-50)" }} contentStyle={tip} formatter={(v) => [`${v} peserta`, "Anomali"]} />
                <Bar dataKey="value" fill="var(--color-forest-900)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <SectionHeading eyebrow="Faskes" title="Faskes dengan Pola Lintas Fasilitas" subtitle="Jumlah kasus cross-faskes yang melibatkan faskes tersebut." />
          <div style={{ height: Math.max(180, faskesData.length * 44) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={faskesData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke="var(--color-leaf-100)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={tick} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={72} axisLine={false} tickLine={false} tick={tick} />
                <Tooltip cursor={{ fill: "var(--color-leaf-50)" }} contentStyle={tip} formatter={(v) => [`${v} kasus`, "Cross-faskes"]} />
                <Bar dataKey="value" fill="var(--color-leaf-500)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
