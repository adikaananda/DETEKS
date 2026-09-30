import { Card } from "../components/Card";
import CaseTable from "../components/CaseTable";
import Filters from "../components/Filters";
import { useEngine } from "../lib/EngineContext";
import { applyFilters } from "../lib/risk";

export default function RiskMonitoring() {
  const { rows, flt } = useEngine();
  const base = rows.filter((p) => p.band !== "low").sort((a, b) => b.score - a.score);
  const list = applyFilters(base, flt);
  return (
    <div className="animate-rise">
      <Card className="p-5 sm:p-6">
        <p className="text-sm font-medium text-[var(--color-ink-600)] mb-4">Menampilkan kasus dengan indikasi anomali (Perlu Perhatian dan Risiko Tinggi). Tekan baris untuk membuka profil risiko.</p>
        <Filters total={base.length} shown={list.length} />
        <CaseTable rows={list} />
      </Card>
    </div>
  );
}
