import { Card } from "../components/Card";
import CaseTable from "../components/CaseTable";
import Filters from "../components/Filters";
import { useEngine } from "../lib/EngineContext";
import { applyFilters } from "../lib/risk";

export default function Participants() {
  const { rows, flt } = useEngine();
  const base = [...rows].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const list = applyFilters(base, flt);
  return (
    <div className="animate-rise">
      <Card className="p-5 sm:p-6">
        <p className="text-sm font-medium text-[var(--color-ink-600)] mb-4">Seluruh peserta sintetis. Data identitas ditampilkan dalam bentuk masked.</p>
        <Filters total={base.length} shown={list.length} />
        <CaseTable rows={list} pageSize={12} />
      </Card>
    </div>
  );
}
