import { useState, useCallback, useMemo, useTransition } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import { Page, ScanSummary, SystemStats, Status, TaskItem, CleanResult } from "./types";
import { categories } from "./data/categories";

import { Sidebar } from "./components/layout/Sidebar";
import { useSystemStats } from "./hooks/useSystemStats";
import { SmartScan } from "./components/views/SmartScan";
import { DiskLens } from "./components/views/DiskLens";
import { SystemInfoView } from "./components/views/SystemInfoView";
import { RecommendationsView } from "./components/views/RecommendationsView";
import { NetworkView } from "./components/views/NetworkView";
import { ProcessesView } from "./components/views/ProcessesView";
import { PortsView } from "./components/views/PortsView";
import { CategoryDetail } from "./components/views/CategoryDetail";

export default function App() {
  const [page, setPage] = useState<Page>("smart-scan");
  const [, startTransition] = useTransition();
  const [scanData, setScanData] = useState<ScanSummary | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const { stats, setStats } = useSystemStats(5000);

  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState(0);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState<{ t: string; ok: boolean }[]>([]);

  // Memoized derived values
  const allSafeMemo = useMemo(() => categories.flatMap((c) => c.items.filter((i) => i.risk === "safe")), []);
  const activeCat = useMemo(() => categories.find((c) => c.page === page), [page]);
  const doneCount = useMemo(() => Object.values(statuses).filter((s) => s === "done").length, [statuses]);

  // Page navigation with React transition
  const navigateTo = useCallback((p: Page) => {
    startTransition(() => setPage(p));
  }, []);

  // --- SCAN ---
  const doScan = useCallback(async () => {
    setScanning(true); setScanData(null); setScanPct(0);
    const iv = setInterval(() => setScanPct((p) => Math.min(p + 3, 85)), 100);
    try {
      const r = await invoke<ScanSummary>("scan_system");
      clearInterval(iv); setScanPct(100); setScanData(r);
      invoke<SystemStats>("get_system_stats").then(setStats).catch(() => { });
    } catch { clearInterval(iv); }
    setScanning(false);
  }, []);

  const cleanOne = useCallback(async (item: TaskItem) => {
    setStatuses((s) => ({ ...s, [item.id]: "running" }));
    try {
      const r = await invoke<CleanResult>(item.command);
      setStatuses((s) => ({ ...s, [item.id]: r.success ? "done" : "error" }));
      setLogs((l) => [...l, { t: `${r.success ? "✅" : "❌"} ${r.command_name}`, ok: r.success }]);
    } catch (e) {
      setStatuses((s) => ({ ...s, [item.id]: "error" }));
      setLogs((l) => [...l, { t: `❌ ${item.name}: ${e}`, ok: false }]);
    }
  }, []);

  const cleanAll = useCallback(async () => {
    setBusy(true); setLogs([]); setTotal(allSafeMemo.length); setProg(0);
    for (let i = 0; i < allSafeMemo.length; i++) {
      const item = allSafeMemo[i];
      setStatuses((s) => ({ ...s, [item.id]: "running" }));
      try {
        const r = await invoke<CleanResult>(item.command);
        setStatuses((s) => ({ ...s, [item.id]: r.success ? "done" : "error" }));
        setLogs((l) => [...l, { t: `${r.success ? "✅" : "⚠️"} ${r.command_name}`, ok: r.success }]);
      } catch {
        setStatuses((s) => ({ ...s, [item.id]: "error" }));
        setLogs((l) => [...l, { t: `❌ ${item.name}`, ok: false }]);
      }
      setProg(i + 1);
    }
    setBusy(false);
    invoke<SystemStats>("get_system_stats").then(setStats).catch(() => { });
  }, [allSafeMemo]);

  const cleanCat = useCallback(async (cat: typeof categories[0]) => {
    for (const item of cat.items) { if (item.risk === "safe") await cleanOne(item); }
  }, [cleanOne]);

  return (
    <div className="app-layout">
      <Sidebar page={page} navigateTo={navigateTo} stats={stats} />

      <main className="main">
        {page === "smart-scan" && (
          <SmartScan
            scanData={scanData} scanning={scanning} scanPct={scanPct} stats={stats}
            busy={busy} total={total} prog={prog} doneCount={doneCount} logs={logs}
            doScan={doScan} cleanAll={cleanAll}
          />
        )}

        {page === "disk-lens" && <DiskLens stats={stats} />}
        {page === "sys-info" && <SystemInfoView />}
        {page === "network" && <NetworkView />}
        {page === "processes" && <ProcessesView />}
        {page === "recommendations" && <RecommendationsView />}
        {page === "ports" && <PortsView />}

        {activeCat && (
          <CategoryDetail
            activeCat={activeCat} statuses={statuses} busy={busy}
            cleanCat={cleanCat} cleanOne={cleanOne}
          />
        )}
      </main>
    </div>
  );
}
