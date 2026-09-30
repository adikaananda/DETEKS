import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import ParticipantDrawer from "./components/ParticipantDrawer";
import { EngineCtx } from "./lib/EngineContext";
import { generateDataset } from "./lib/dataset";
import { analyze, DEFAULT_CFG } from "./lib/engine";
import Overview from "./pages/Overview";
import RiskMonitoring from "./pages/RiskMonitoring";
import Participants from "./pages/Participants";
import MedicationHistory from "./pages/MedicationHistory";
import CrossFaskes from "./pages/CrossFaskes";
import DrugReference from "./pages/DrugReference";
import DetectionRules from "./pages/DetectionRules";
import Analytics from "./pages/Analytics";

const PAGES = {
  overview: { title: "DETEKS Overview", subtitle: "Deteksi pola pengambilan obat yang tidak wajar sebelum menjadi risiko yang lebih besar", Component: Overview },
  risk: { title: "Risk Monitoring", subtitle: "Kasus dengan indikasi anomali yang perlu ditinjau verifikator", Component: RiskMonitoring },
  participants: { title: "Participants", subtitle: "Seluruh peserta sintetis yang dianalisis engine", Component: Participants },
  history: { title: "Medication History", subtitle: "Riwayat pengambilan obat dengan sorotan anomali", Component: MedicationHistory },
  cross: { title: "Cross-Faskes", subtitle: "Pola pengambilan obat yang sama di beberapa faskes", Component: CrossFaskes },
  drugs: { title: "Drug Reference", subtitle: "Lookup table estimasi durasi pemakaian obat kronis", Component: DrugReference },
  rules: { title: "Detection Rules", subtitle: "Aturan engine dan parameter yang dapat dikonfigurasi", Component: DetectionRules },
  analytics: { title: "Analytics", subtitle: "Ringkasan hasil deteksi pada data sintetis", Component: Analytics },
};
const EMPTY = { q: "", risk: "", drug: "", faskes: "" };

export default function App() {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [overrides, setOverrides] = useState({});
  const [drawerId, setDrawerId] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const [flt, setFlt] = useState(EMPTY);
  const [toast, setToast] = useState(null);

  const dataset = useMemo(() => generateDataset(), []);
  const result = useMemo(() => analyze(dataset, cfg), [dataset, cfg]);
  const rows = useMemo(() => result.participants.map((p) => ({ ...p, status: overrides[p.id] ?? p.baseStatus })), [result, overrides]);
  const byId = useMemo(() => Object.fromEntries(rows.map((p) => [p.id, p])), [rows]);

  const say = useCallback((msg) => setToast(msg), []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3200); return () => clearTimeout(t); }, [toast]);

  const navigate = useCallback((page, preset) => {
    if (preset) setFlt({ ...EMPTY, ...preset });
    setActive(page);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const setStatus = (id, status, msg) => { setOverrides((o) => ({ ...o, [id]: status })); say(msg); };
  const value = {
    cfg, setCfg, rows, byId, dataset, flt, setFlt, navigate, focusId, setFocusId,
    drawerId,
    openParticipant: (id) => { setFocusId(id); setDrawerId(id); },
    closeDrawer: () => setDrawerId(null),
    reviewCase: (id) => setStatus(id, "Dalam Tinjauan", `${id} dibuka untuk tinjauan verifikator.`),
    markVerify: (id) => setStatus(id, "Ditandai Verifikasi", `${id} ditandai untuk verifikasi lebih lanjut.`),
  };

  const queue = rows.filter((p) => p.status === "Perlu Verifikasi" || p.status === "Ditandai Verifikasi").length;
  const { title, subtitle, Component } = PAGES[active];

  function onQuery(q) {
    setFlt((f) => ({ ...f, q }));
    if (q && active !== "risk" && active !== "participants") navigate("participants");
  }

  return (
    <EngineCtx.Provider value={value}>
      <div className="min-h-screen flex bg-[var(--color-cream-50)]">
        <Sidebar active={active} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} queue={queue} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} query={flt.q} onQuery={onQuery} />
          <main className="flex-1 px-5 sm:px-8 py-6 max-w-[1400px] w-full mx-auto min-w-0">
            <Component key={active} onNavigate={navigate} />
          </main>
          <Footer />
        </div>
      </div>
      <ParticipantDrawer />
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] max-w-[calc(100vw-2rem)] animate-rise" role="status">
          <div className="flex items-center gap-2.5 bg-[var(--color-forest-950)] text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl">
            <CheckCircle2 size={18} className="text-[var(--color-gold-400)] shrink-0" />{toast}
          </div>
        </div>
      )}
    </EngineCtx.Provider>
  );
}
