import { useState } from "react";
import { FlaskConical, Search } from "lucide-react";
import { Card, Badge } from "../components/Card";
import { CATEGORIES, DRUGS, estDays } from "../lib/reference";

const TH = "text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-600)] px-4 py-3";

export default function DrugReference() {
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const list = DRUGS.filter((d) => (!cat || d.category === cat) && (!q || `${d.name} ${d.code}`.toLowerCase().includes(q.toLowerCase())));
  const chip = (active) => `px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${active ? "bg-[var(--color-forest-900)] text-white border-[var(--color-forest-900)]" : "bg-white text-[var(--color-forest-900)] border-leaf-100 hover:bg-leaf-50"}`;
  return (
    <div className="space-y-6 animate-rise">
      <Card className="p-5 flex items-start gap-3 !bg-[#fff8e6] !border-[#f3e2a9]">
        <span className="w-10 h-10 rounded-xl bg-white grid place-items-center text-[#8a6600] shrink-0"><FlaskConical size={18} /></span>
        <div>
          <p className="text-sm font-bold text-[#6b5000]">Simulation / Prototype Reference</p>
          <p className="text-sm font-medium text-[#6b5000]/90 mt-0.5">Data obat hanya simulasi untuk demo dan <b>belum divalidasi</b>. Nilai estimasi durasi harus diverifikasi dan disesuaikan oleh mentor/farmasis sebelum dipakai di luar prototype.</p>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
          <label className="relative block lg:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-400)]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / kode obat" aria-label="Cari obat" className="w-full h-11 pl-10 pr-3 rounded-xl bg-white border border-leaf-100 text-base sm:text-sm font-medium focus:border-[var(--color-forest-700)] focus:outline-none" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className={chip(!cat)} onClick={() => setCat("")}>Semua</button>
            {CATEGORIES.map((c) => <button key={c} className={chip(cat === c)} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto -mx-2">
          <table className="w-full text-sm min-w-[860px]">
            <thead><tr className="border-b border-leaf-100">{["Kode Obat", "Nama Obat", "Bentuk", "Dosis Standar", "Jumlah", "Estimasi Durasi", "Satuan", "Status Reference"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.code} className="border-b border-leaf-100/70">
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[var(--color-ink-600)]">{d.code}</td>
                  <td className="px-4 py-3.5 font-bold text-[var(--color-forest-900)]">{d.name} {d.strength}<div className="text-xs font-medium text-[var(--color-ink-400)]">{d.category}</div></td>
                  <td className="px-4 py-3.5 font-medium">{d.form}</td>
                  <td className="px-4 py-3.5 font-semibold">{d.dosePerDay} tablet/hari</td>
                  <td className="px-4 py-3.5 font-semibold tabular">{d.qty}</td>
                  <td className="px-4 py-3.5 font-bold text-[var(--color-forest-900)] tabular">{estDays(d)} hari</td>
                  <td className="px-4 py-3.5 font-medium">{d.unit}</td>
                  <td className="px-4 py-3.5"><Badge tone="gold">Simulasi · Menunggu validasi</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="md:hidden grid gap-3">
          {list.map((d) => (
            <li key={d.code} className="rounded-2xl border border-leaf-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="text-base font-bold text-[var(--color-forest-900)]">{d.name} {d.strength}</p><p className="text-xs font-mono font-semibold text-[var(--color-ink-400)]">{d.code} · {d.category}</p></div>
                <div className="text-right shrink-0"><p className="text-3xl font-extrabold text-[var(--color-forest-900)] leading-none tabular">{estDays(d)}</p><p className="text-xs font-semibold text-[var(--color-ink-400)]">hari</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div><p className="text-[var(--color-ink-400)] font-semibold">Bentuk</p><p className="font-bold">{d.form}</p></div>
                <div><p className="text-[var(--color-ink-400)] font-semibold">Dosis</p><p className="font-bold">{d.dosePerDay}×/hari</p></div>
                <div><p className="text-[var(--color-ink-400)] font-semibold">Jumlah</p><p className="font-bold">{d.qty} {d.unit}</p></div>
              </div>
              <Badge tone="gold" className="mt-3">Simulasi · Menunggu validasi</Badge>
            </li>
          ))}
        </ul>
        {!list.length && <p className="py-8 text-center text-sm font-medium text-[var(--color-ink-600)]">Obat tidak ditemukan.</p>}
        <p className="text-xs font-medium text-[var(--color-ink-400)] mt-4">Estimasi Durasi = Jumlah ÷ Dosis per hari. Contoh: 30 tablet ÷ 1 tablet/hari = 30 hari.</p>
      </Card>
    </div>
  );
}
