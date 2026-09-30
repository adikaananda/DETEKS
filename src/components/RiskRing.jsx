import { BANDS } from "../lib/risk";

export default function RiskRing({ value = 0, band = "low", size = 168, stroke = 14, label }) {
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  const color = BANDS[band].color;
  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ "--ring-circumference": c, "--ring-offset": offset }} role="img" aria-label={`Risk score ${value} dari 100`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-leaf-50)" strokeWidth={stroke} />
        <circle className="animate-ring" cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-extrabold leading-none tabular" style={{ fontSize: size * 0.3, color }}>{value}</span>
        <span className="text-xs font-bold text-[var(--color-ink-600)] mt-1">/ 100</span>
        {label && <span className="text-[11px] font-semibold text-[var(--color-ink-400)] mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
