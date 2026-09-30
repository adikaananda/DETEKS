import { useEffect, useRef, useState } from "react";
import { Menu, Bell, Search, X, ChevronRight } from "lucide-react";
import { useEngine } from "../lib/EngineContext";
import { fmtShort } from "../lib/dates";

export default function Topbar({ title, subtitle, onMenuClick, query, onQuery }) {
  const { rows, openParticipant } = useEngine();
  const [bell, setBell] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const ref = useRef(null);
  const alerts = rows.filter((p) => p.status === "Perlu Verifikasi").sort((a, b) => b.score - a.score).slice(0, 4);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setBell(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const searchInput = (
    <label className="relative block">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-400)]" />
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Cari ID peserta atau obat…"
        className="w-full h-10 pl-10 pr-9 rounded-xl bg-white border border-leaf-100 text-base sm:text-sm font-medium text-[var(--color-ink-900)] placeholder:text-[var(--color-ink-400)] focus:border-[var(--color-forest-700)] focus:outline-none"
        aria-label="Cari peserta"
      />
      {query && (
        <button onClick={() => onQuery("")} aria-label="Hapus pencarian" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-400)] hover:text-[var(--color-forest-900)]">
          <X size={16} />
        </button>
      )}
    </label>
  );

  return (
    <header className="sticky top-0 z-20 bg-[var(--color-cream-50)]/95 backdrop-blur-sm border-b border-leaf-100/70">
      <div className="flex items-center gap-3 px-5 sm:px-8 py-3.5">
        <button onClick={onMenuClick} className="lg:hidden w-10 h-10 grid place-items-center rounded-xl bg-white border border-leaf-100 text-[var(--color-forest-900)] shrink-0" aria-label="Buka menu">
          <Menu size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[var(--color-forest-900)] truncate">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--color-ink-600)] truncate hidden sm:block">{subtitle}</p>}
        </div>

        <div className="hidden md:block w-64 lg:w-72">{searchInput}</div>
        <button onClick={() => setMobileSearch((v) => !v)} className="md:hidden w-10 h-10 shrink-0 grid place-items-center rounded-xl bg-white border border-leaf-100 text-[var(--color-forest-900)]" aria-label="Cari">
          <Search size={18} />
        </button>

        <div className="relative shrink-0" ref={ref}>
          <button onClick={() => setBell((v) => !v)} className="relative w-10 h-10 grid place-items-center rounded-xl bg-white border border-leaf-100 text-[var(--color-forest-900)] hover:bg-leaf-50" aria-label="Notifikasi">
            <Bell size={18} />
            {alerts.length > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[var(--color-risk-high)]" />}
          </button>
          {bell && (
            <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2.5rem))] bg-white rounded-2xl border border-leaf-100 shadow-[var(--shadow-card-hover)] p-3 animate-fade">
              <p className="px-2 pt-1 pb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-400)]">Perlu Verifikasi</p>
              {alerts.length === 0 && <p className="px-2 py-3 text-sm text-[var(--color-ink-600)]">Tidak ada antrean baru.</p>}
              {alerts.map((p) => (
                <button key={p.id} onClick={() => { setBell(false); openParticipant(p.id); }} className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-leaf-50 text-left">
                  <span className="text-base font-extrabold text-[var(--color-risk-high)] tabular w-9">{p.score}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-[var(--color-forest-900)]">{p.id} · {p.primary.drug.name}</span>
                    <span className="block text-xs text-[var(--color-ink-600)] font-medium">Terakhir {fmtShort(p.lastRefill)} · {p.flaggedFaskes.length} faskes</span>
                  </span>
                  <ChevronRight size={16} className="text-[var(--color-ink-400)]" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2.5 shrink-0 pl-1">
          <div className="w-10 h-10 rounded-full bg-[var(--color-forest-900)] text-white grid place-items-center text-sm font-bold border-2 border-white shadow-sm" aria-hidden>VB</div>
          <div className="hidden xl:block leading-tight">
            <p className="text-sm font-semibold text-[var(--color-forest-900)]">Verifikator</p>
            <p className="text-xs text-[var(--color-ink-400)] font-medium">Verifikator BPJS</p>
          </div>
        </div>
      </div>
      {mobileSearch && <div className="md:hidden px-5 pb-3.5 animate-fade">{searchInput}</div>}
    </header>
  );
}
