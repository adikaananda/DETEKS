import { BANDS, STATUS_TONE } from "../lib/risk";

export function Card({ children, className = "", as: As = "div", ...props }) {
  return (
    <As
      className={`bg-white rounded-[var(--radius-card)] border border-leaf-100/70 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)] ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}

export function Badge({ children, tone = "leaf", className = "" }) {
  const tones = {
    leaf: "bg-[var(--color-leaf-100)] text-[var(--color-forest-900)]",
    amber: "bg-[#fff2e0] text-[#b35f00]",
    gold: "bg-[#fff8e6] text-[#8a6600]",
    forest: "bg-[var(--color-forest-900)] text-white",
    danger: "bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high)]",
    outline: "bg-transparent border border-[var(--color-leaf-100)] text-[var(--color-ink-600)]",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export const RiskBadge = ({ band, className }) => <Badge tone={BANDS[band].tone} className={className}>{BANDS[band].label}</Badge>;
export const StatusBadge = ({ status, className }) => <Badge tone={STATUS_TONE[status] || "outline"} className={className}>{status}</Badge>;

export function ScorePill({ score, band, size = "md" }) {
  const b = BANDS[band];
  const cls = size === "lg" ? "text-2xl px-3.5 py-1.5" : "text-base px-3 py-1";
  return (
    <span className={`inline-flex items-baseline gap-0.5 rounded-xl font-extrabold tabular ${cls}`} style={{ background: b.soft, color: b.color }}>
      {score}
      <span className="text-[11px] font-bold opacity-70">/100</span>
    </span>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div className="min-w-0">
        {eyebrow && <div className="text-xs font-semibold tracking-wide uppercase text-[var(--color-forest-700)] mb-1">{eyebrow}</div>}
        <h2 className="text-xl font-bold text-[var(--color-forest-900)]">{title}</h2>
        {subtitle && <p className="text-sm text-[var(--color-ink-600)] mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export const btnPrimary = "inline-flex items-center justify-center gap-2 bg-[var(--color-forest-900)] hover:bg-[var(--color-forest-800)] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed";
export const btnGhost = "inline-flex items-center justify-center gap-2 bg-white border border-leaf-100 hover:bg-leaf-50 text-[var(--color-forest-900)] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors";
