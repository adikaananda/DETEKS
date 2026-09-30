import { ShieldCheck } from "lucide-react";
import { LogoLockup } from "./LogoMark";

const LINKS = ["Tentang DETEKS", "Metodologi", "Tata Kelola Data"];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-forest-900)]/10 bg-white/60">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-sm">
            <LogoLockup size={52} />
            <p className="mt-3 text-sm text-[var(--color-ink-600)] leading-relaxed">
              Explainable hybrid rules + ML untuk deteksi dini pola pengambilan obat/alkes berisiko lintas fasilitas. Risk Score bukan keputusan akhir.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-forest-900)] bg-[var(--color-leaf-100)] px-2.5 py-1 rounded-full">
              <ShieldCheck size={12} />
              Synthetic / Demo Data
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--color-ink-400)] uppercase tracking-wide mb-3">Produk</p>
            <ul className="space-y-2">
              {LINKS.map((l) => (
                <li key={l} className="text-sm font-medium text-[var(--color-forest-900)]/85">{l}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-5 border-t border-[var(--color-forest-900)]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--color-ink-400)] font-medium">© {new Date().getFullYear()} DETEKS ·  BPJS Kesehatan Healthkathon 2026</p>
          <p className="text-xs text-[var(--color-ink-400)] font-medium">Semua angka pada prototype ini adalah data sintetis, bukan data peserta nyata.</p>
        </div>
      </div>
    </footer>
  );
}
