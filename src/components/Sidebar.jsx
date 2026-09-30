import { LayoutDashboard, ShieldAlert, Users, Pill, Network, BookOpen, SlidersHorizontal, PieChart, ShieldCheck, X } from "lucide-react";
import { LogoLockup } from "./LogoMark";

export const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "risk", label: "Risk Monitoring", icon: ShieldAlert, count: true },
  { id: "participants", label: "Participants", icon: Users },
  { id: "history", label: "Medication History", icon: Pill },
  { id: "cross", label: "Cross-Faskes", icon: Network },
  { id: "drugs", label: "Drug Reference", icon: BookOpen },
  { id: "rules", label: "Detection Rules", icon: SlidersHorizontal },
  { id: "analytics", label: "Analytics", icon: PieChart },
];

export default function Sidebar({ active, onNavigate, open, onClose, queue }) {
  return (
    <>
      {open && <button aria-label="Tutup menu" onClick={onClose} className="fixed inset-0 bg-black/40 z-30 lg:hidden animate-fade" />}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen h-dvh w-72 max-w-[85vw] shrink-0 bg-[var(--color-forest-900)] text-white z-40 flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="relative h-28 shrink-0">
          <div className="absolute left-6 top-2">
            <LogoLockup dark size={120} />
          </div>

          <button
            className="lg:hidden absolute right-4 top-4 text-white/70 hover:text-white w-9 h-9 grid place-items-center"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto" aria-label="Navigasi utama">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive ? "bg-white text-[var(--color-forest-900)] shadow-sm" : "text-white/85 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={18} strokeWidth={2.1} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count && queue > 0 && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-[var(--color-leaf-100)] text-[var(--color-forest-900)]" : "bg-[var(--color-gold-400)] text-[var(--color-forest-950)]"}`}>
                    {queue}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="m-4 p-4 rounded-2xl bg-white/10">
          <div className="flex items-center gap-2 text-[var(--color-gold-400)] mb-1.5">
            <ShieldCheck size={16} />
            <span className="text-xs font-semibold">Keputusan di tangan manusia</span>
          </div>
          <p className="text-sm text-white/90 leading-snug font-medium">Sistem menemukan indikasi. Verifikator mengambil keputusan.</p>
        </div>
      </aside>
    </>
  );
}
