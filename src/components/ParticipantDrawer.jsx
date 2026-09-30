import { useEffect, useState } from "react";
import { X, Check, Eye, Flag, Info, Network, Repeat, Cpu, MinusCircle, CheckCircle2 } from "lucide-react";
import { useEngine } from "../lib/EngineContext";
import { BANDS } from "../lib/risk";
import { DRUG_BY_CODE } from "../lib/reference";
import { Badge, RiskBadge, StatusBadge, btnGhost, btnPrimary } from "./Card";
import RiskRing from "./RiskRing";
import { Timeline, CoverageBars } from "./Timeline";

function Signal({ icon: Icon, title, text }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-3.5 ${text ? "border-[#f3d6b4] bg-[#fff8ee]" : "border-leaf-100 bg-white"}`}>
      <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${text ? "bg-[#fff2e0] text-[#b35f00]" : "bg-leaf-50 text-[var(--color-ink-400)]"}`}><Icon size={17} /></span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-600)]">{title}</p>
        <p className="text-sm font-semibold text-[var(--color-ink-900)] flex items-start gap-1.5 mt-0.5">
          {text ? <Check size={16} className="text-[#b35f00] mt-0.5 shrink-0" /> : <MinusCircle size={16} className="text-[var(--color-ink-400)] mt-0.5 shrink-0" />}
          <span>{text || "Tidak ada indikasi"}</span>
        </p>
      </div>
    </div>
  );
}

export default function ParticipantDrawer() {
  const { drawerId, closeDrawer, byId, reviewCase, markVerify, cfg } = useEngine();
  const p = drawerId ? byId[drawerId] : null;
  const [code, setCode] = useState(null);

  useEffect(() => { setCode(null); }, [drawerId]);
  useEffect(() => {
    const h = (e) => e.key === "Escape" && closeDrawer();
    if (drawerId) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [drawerId, closeDrawer]);
  if (!p) return null;

  const active = code && p.stats[code] ? code : p.primaryCode;
  const st = p.stats[active];
  const b = BANDS[p.band];
  const marked = p.status === "Ditandai Verifikasi";
  const reviewing = p.status === "Dalam Tinjauan";
  const comps = [
    { k: "Rule-Based", v: p.comp.rule, max: cfg.weights.rule },
    { k: "Cross-Faskes", v: p.comp.cross, max: cfg.weights.cross },
    { k: "ML Anomaly", v: p.comp.ml, max: cfg.weights.ml },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Participant Risk Profile ${p.id}`}>
      <button className="absolute inset-0 bg-black/40 animate-fade" onClick={closeDrawer} aria-label="Tutup detail" />
      <aside className="relative w-full sm:max-w-[560px] lg:max-w-[620px] h-full h-dvh bg-[var(--color-cream-50)] shadow-2xl overflow-y-auto animate-slide">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-leaf-100 px-5 sm:px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-forest-700)]">Participant Risk Profile</p>
            <h2 className="text-2xl font-extrabold text-[var(--color-forest-900)] leading-tight">{p.id}</h2>
            <div className="flex flex-wrap gap-1.5 mt-1.5"><RiskBadge band={p.band} /><StatusBadge status={p.status} /></div>
          </div>
          <button onClick={closeDrawer} className="w-10 h-10 grid place-items-center rounded-xl bg-white border border-leaf-100 text-[var(--color-forest-900)] hover:bg-leaf-50 shrink-0" aria-label="Tutup"><X size={20} /></button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          {/* Score */}
          <section className="rounded-[var(--radius-card)] bg-white border border-leaf-100 shadow-[var(--shadow-card)] p-5">
            <div className="flex items-center gap-5">
              <RiskRing value={p.score} band={p.band} size={132} stroke={12} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-400)]">Risk Score</p>
                <p className="text-2xl font-extrabold leading-tight mt-0.5" style={{ color: b.color }}>{b.label}</p>
                <p className="text-xs font-medium text-[var(--color-ink-600)] mt-1">Risk Score bukan keputusan akhir.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {comps.map((c) => (
                <div key={c.k}>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span className="text-[var(--color-ink-900)]">{c.k} <span className="text-[var(--color-ink-400)] font-medium">· bobot {c.max}%</span></span>
                    <span className="tabular text-[var(--color-forest-900)]">{c.v} / {c.max} poin</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-leaf-50 mt-1.5 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${c.max ? (c.v / c.max) * 100 : 0}%`, background: b.color }} /></div>
                </div>
              ))}
            </div>
          </section>

          {/* Info peserta */}
          <section className="grid grid-cols-2 gap-3">
            {[
              ["NIK (masked)", p.nik, true],
              ["No. BPJS (masked)", p.bpjs, true],
              ["Jumlah faskes", `${p.faskesCount} faskes`],
              ["Jumlah resep", `${p.rxCount} resep`],
            ].map(([k, v, mono]) => (
              <div key={k} className="rounded-2xl bg-white border border-leaf-100 p-3.5 min-w-0">
                <p className="text-xs font-semibold text-[var(--color-ink-400)]">{k}</p>
                <p className={`text-sm font-bold text-[var(--color-forest-900)] mt-0.5 break-all ${mono ? "font-mono" : ""}`}>{v}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-2xl bg-white border border-leaf-100 p-3.5">
              <p className="text-xs font-semibold text-[var(--color-ink-400)]">Obat yang terdeteksi</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {p.drugCodes.map((c) => <Badge key={c} tone={c === p.primaryCode ? "forest" : "leaf"}>{DRUG_BY_CODE[c].name} {DRUG_BY_CODE[c].strength}</Badge>)}
              </div>
            </div>
          </section>

          {/* Signals */}
          <section>
            <h3 className="text-base font-bold text-[var(--color-forest-900)] mb-3">Detection Signals</h3>
            <div className="grid gap-2.5">
              <Signal icon={Repeat} title="Rule-Based" text={p.signals.rule} />
              <Signal icon={Network} title="Cross-Faskes" text={p.signals.cross} />
              <Signal icon={Cpu} title="ML (Isolation Forest)" text={p.signals.ml} />
            </div>
          </section>

          {/* Explanation */}
          <section className="rounded-[var(--radius-card)] bg-white border border-leaf-100 shadow-[var(--shadow-card)] p-5">
            <h3 className="text-base font-bold text-[var(--color-forest-900)] mb-3">Mengapa kasus ini terdeteksi?</h3>
            {p.reasons.length ? (
              <ol className="space-y-3">
                {p.reasons.map((r, i) => (
                  <li key={i} className="flex gap-3 text-sm font-medium text-[var(--color-ink-900)] leading-relaxed">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-leaf-100)] text-[var(--color-forest-900)] grid place-items-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm font-medium text-[var(--color-ink-600)] flex items-start gap-2"><CheckCircle2 size={18} className="text-[var(--color-leaf-500)] shrink-0 mt-0.5" />Pola pengambilan berada dalam rentang normal; tidak ada alasan deteksi yang perlu ditinjau.</p>
            )}
          </section>

          {/* Rekomendasi */}
          <section className="rounded-[var(--radius-card)] border-2 border-[var(--color-forest-900)]/15 bg-[var(--color-leaf-100)] p-5">
            <div className="flex items-center gap-2 text-[var(--color-forest-900)] mb-1.5"><Info size={17} /><h3 className="text-base font-bold">Rekomendasi Tindak Lanjut</h3></div>
            <p className="text-sm font-semibold text-[var(--color-forest-900)] leading-relaxed">
              {p.band === "low" ? "Tidak ada tindak lanjut khusus. Kasus tetap dipantau oleh sistem." : "Kasus direkomendasikan untuk verifikasi lebih lanjut oleh petugas."}
            </p>
            <p className="text-xs font-medium text-[var(--color-ink-600)] mt-1">Sistem menemukan indikasi. Verifikator mengambil keputusan. Tidak ada tindakan otomatis terhadap peserta.</p>
            <div className="grid sm:grid-cols-2 gap-2.5 mt-4">
              <button onClick={() => reviewCase(p.id)} disabled={reviewing} className={btnPrimary}><Eye size={16} />{reviewing ? "Sedang Ditinjau" : "Tinjau Kasus"}</button>
              <button onClick={() => markVerify(p.id)} disabled={marked} className={btnGhost}><Flag size={16} />{marked ? "Sudah Ditandai" : "Tandai untuk Verifikasi"}</button>
            </div>
          </section>

          {/* History */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-bold text-[var(--color-forest-900)]">Riwayat Pengambilan Obat</h3>
              {p.drugCodes.length > 1 && (
                <div className="inline-flex rounded-xl bg-white border border-leaf-100 p-1">
                  {p.drugCodes.map((c) => (
                    <button key={c} onClick={() => setCode(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${c === active ? "bg-[var(--color-forest-900)] text-white" : "text-[var(--color-forest-900)]"}`}>{DRUG_BY_CODE[c].name}</button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-[var(--color-ink-900)] mb-3">{st.drug.name} {st.drug.strength} · estimasi {st.est} hari / pengambilan</p>
            <Timeline seq={st.seq} />
            <div className="mt-5 rounded-2xl bg-white border border-leaf-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-600)] mb-3">Estimasi persediaan</p>
              <CoverageBars seq={st.seq} />
            </div>
          </section>
          <p className="text-xs font-medium text-[var(--color-ink-400)] pb-2">Synthetic / Demo Data — bukan data peserta nyata.</p>
        </div>
      </aside>
    </div>
  );
}
