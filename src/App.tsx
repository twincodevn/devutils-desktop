import { useState, useCallback, useEffect, useRef, useMemo, useTransition } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

// ============================================================
// TYPES
// ============================================================
interface CleanResult { category: string; command_name: string; success: boolean; output: string; error: string }
interface ScanResult { category: string; icon: string; size_bytes: number; size_display: string }
interface ScanSummary { items: ScanResult[]; total_bytes: number; total_display: string }
interface SystemStats {
  cpu_usage: number; ram_total_gb: number; ram_used_gb: number; ram_pct: number;
  disk_total_gb: number; disk_used_gb: number; disk_free_gb: number; disk_pct: number;
  battery_pct: number; battery_charging: boolean; uptime: string;
}
interface DiskItem { name: string; size_bytes: number; size_display: string; color: string; pct: number }
interface SystemInfo { hostname: string; macos_version: string; chip: string; model: string; serial: string; uptime: string; ram: string; kernel: string }
interface NetworkInfo { local_ip: string; public_ip: string; wifi_name: string; gateway: string; dns_servers: string; ping_ms: string }
interface ProcessItem { pid: string; name: string; cpu: string; mem: string }
interface PortItem { port: string; pid: string; process: string; protocol: string }

type Status = "idle" | "running" | "done" | "error";
type Page = "smart-scan" | "system-junk" | "developer" | "browser" | "app-leftovers" | "optimize" | "disk-lens" | "sys-info" | "network" | "processes" | "ports";

// ============================================================
// DATA
// ============================================================
interface TaskItem { id: string; name: string; desc: string; command: string; risk: "safe" | "moderate" | "caution" }
interface Category { page: Page; icon: string; iconBg: string; title: string; subtitle: string; items: TaskItem[] }

const categories: Category[] = [
  {
    page: "system-junk", icon: "🗑️", iconBg: "rgba(124,58,237,0.12)", title: "System Junk", subtitle: "Cache, logs, temp files, DNS",
    items: [
      { id: "uc", name: "User Cache", desc: "~/Library/Caches — app cache tích lũy", command: "clean_user_cache", risk: "safe" },
      { id: "sl", name: "System Logs", desc: "Log files & diagnostic data", command: "clean_system_logs", risk: "safe" },
      { id: "ql", name: "QuickLook Thumbnails", desc: "Preview cache thumbnails", command: "clean_quicklook_cache", risk: "safe" },
      { id: "dc", name: "DNS Cache", desc: "Flush DNS resolver", command: "clean_dns_cache", risk: "safe" },
    ],
  },
  {
    page: "developer", icon: "🛠️", iconBg: "rgba(56,189,248,0.12)", title: "Developer", subtitle: "Xcode, Homebrew, pip, CocoaPods, Gradle",
    items: [
      { id: "xd", name: "Xcode Derived Data", desc: "Build artifacts, archives & device logs", command: "clean_xcode_derived", risk: "safe" },
      { id: "hb", name: "Homebrew Cache", desc: "Old formula versions & downloads", command: "clean_homebrew", risk: "safe" },
      { id: "pp", name: "pip Cache", desc: "Python package download cache", command: "clean_pip_cache", risk: "safe" },
      { id: "cp", name: "CocoaPods Cache", desc: "iOS/macOS pod dependencies", command: "clean_cocoapods_cache", risk: "safe" },
      { id: "gm", name: "Gradle & Maven", desc: "Java/Android build cache", command: "clean_gradle_maven", risk: "moderate" },
    ],
  },
  {
    page: "browser", icon: "🌐", iconBg: "rgba(244,114,182,0.12)", title: "Browsers", subtitle: "Safari, Chrome, Firefox, Edge, Brave",
    items: [
      { id: "bc", name: "All Browser Caches", desc: "Safari + Chrome + Firefox + Edge + Brave", command: "clean_browser_cache", risk: "moderate" },
    ],
  },
  {
    page: "app-leftovers", icon: "📦", iconBg: "rgba(0,210,160,0.12)", title: "App Leftovers", subtitle: "Crash reports, saved state, trash",
    items: [
      { id: "cr", name: "Crash Reports", desc: "Diagnostic & crash report files", command: "clean_crash_reports", risk: "safe" },
      { id: "ss", name: "Saved App State", desc: "Window restore & tab data", command: "clean_saved_state", risk: "safe" },
      { id: "tr", name: "Empty Trash", desc: "Xóa vĩnh viễn file trong thùng rác", command: "clean_trash", risk: "caution" },
    ],
  },
  {
    page: "optimize", icon: "⚡", iconBg: "rgba(251,191,36,0.12)", title: "Optimization", subtitle: "RAM, Spotlight, performance tuning",
    items: [
      { id: "pr", name: "Purge RAM", desc: "Giải phóng inactive memory", command: "purge_ram", risk: "safe" },
      { id: "sp", name: "Rebuild Spotlight", desc: "Xây dựng lại search index", command: "rebuild_spotlight", risk: "safe" },
    ],
  },
];

// allSafe defined inside component via useMemo

// ============================================================
// RING
// ============================================================
function Ring({ pct, children }: { pct: number; children: React.ReactNode }) {
  const r = 125, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
  return (
    <div className="ring-outer">
      <div className={`ring-glow ${pct > 0 ? "active" : ""}`} />
      <svg className="ring-svg" viewBox="0 0 280 280">
        <defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#00d2a0" />
        </linearGradient></defs>
        <circle className="ring-bg" cx="140" cy="140" r={r} />
        <circle className="ring-progress" cx="140" cy="140" r={r} style={{ strokeDasharray: c, strokeDashoffset: off }} />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

// ============================================================
// ANIM NUM
// ============================================================
function AnimNum({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = display; const diff = value - start; const steps = 30; let step = 0;
    clearInterval(ref.current);
    ref.current = window.setInterval(() => {
      step++; setDisplay(Math.round((start + diff * (step / steps)) * 10) / 10);
      if (step >= steps) clearInterval(ref.current);
    }, 20);
    return () => clearInterval(ref.current);
  }, [value]);
  return <>{display}{suffix}</>;
}

// ============================================================
// INFO ROW
// ============================================================
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="info-row">
      <span className="info-icon">{icon}</span>
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "—"}</span>
    </div>
  );
}

// ============================================================
// APP
// ============================================================
export default function App() {
  const [page, setPage] = useState<Page>("smart-scan");
  const [, startTransition] = useTransition();
  const [scanData, setScanData] = useState<ScanSummary | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [diskItems, setDiskItems] = useState<DiskItem[]>([]);
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [netInfo, setNetInfo] = useState<NetworkInfo | null>(null);
  const [procs, setProcs] = useState<ProcessItem[]>([]);
  const [ports, setPorts] = useState<PortItem[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState(0);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState<{ t: string; ok: boolean }[]>([]);

  // Memoized derived values
  const allSafeMemo = useMemo(() => categories.flatMap((c) => c.items.filter((i) => i.risk === "safe")), []);
  const activeCat = useMemo(() => categories.find((c) => c.page === page), [page]);
  const doneCount = useMemo(() => Object.values(statuses).filter((s) => s === "done").length, [statuses]);

  // Page navigation with React transition (no jank)
  const navigateTo = useCallback((p: Page) => {
    startTransition(() => setPage(p));
  }, []);

  // Load stats on mount + auto-refresh every 5s
  useEffect(() => {
    const refresh = () => invoke<SystemStats>("get_system_stats").then(setStats).catch(() => { });
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  // Load data for each page (reset on page change for fresh load)
  useEffect(() => {
    if (page === "disk-lens") { setDiskItems([]); invoke<DiskItem[]>("get_disk_breakdown").then(setDiskItems).catch(() => { }); }
    if (page === "sys-info") { setSysInfo(null); invoke<SystemInfo>("get_system_info").then(setSysInfo).catch(() => { }); }
    if (page === "network") { setNetInfo(null); invoke<NetworkInfo>("get_network_info").then(setNetInfo).catch(() => { }); }
    if (page === "processes") { setProcs([]); invoke<ProcessItem[]>("get_top_processes").then(setProcs).catch(() => { }); }
    if (page === "ports") { setPorts([]); invoke<PortItem[]>("get_listening_ports").then(setPorts).catch(() => { }); }
  }, [page]);

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

  const cleanCat = useCallback(async (cat: Category) => {
    for (const item of cat.items) { if (item.risk === "safe") await cleanOne(item); }
  }, [cleanOne]);

  const killProc = useCallback(async (pid: string) => {
    try {
      await invoke<CleanResult>("kill_process", { pid });
      setProcs((p) => p.filter((x) => x.pid !== pid));
    } catch { }
  }, []);

  // navigateTo wraps setPage with startTransition for zero-jank page switches

  return (
    <div className="app-layout">
      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">⚡</div>
          <div className="brand-text">
            <div className="brand-name">DevUtils</div>
            <div className="brand-ver">MAC CLEANER PRO</div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-label">Overview</div>
          <button className={`nav-item ${page === "smart-scan" ? "active" : ""}`} onClick={() => navigateTo("smart-scan")}>
            <div className="nav-icon" style={{ background: "rgba(124,58,237,0.12)" }}>🚀</div>
            <span className="nav-item-text">Smart Scan</span>
          </button>
          <button className={`nav-item ${page === "disk-lens" ? "active" : ""}`} onClick={() => navigateTo("disk-lens")}>
            <div className="nav-icon" style={{ background: "rgba(251,191,36,0.12)" }}>💾</div>
            <span className="nav-item-text">Disk Lens</span>
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-label">Cleanup</div>
          {categories.map((c) => (
            <button key={c.page} className={`nav-item ${page === c.page ? "active" : ""}`} onClick={() => navigateTo(c.page)}>
              <div className="nav-icon" style={{ background: c.iconBg }}>{c.icon}</div>
              <span className="nav-item-text">{c.title}</span>
            </button>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-label">Tools</div>
          <button className={`nav-item ${page === "sys-info" ? "active" : ""}`} onClick={() => navigateTo("sys-info")}>
            <div className="nav-icon" style={{ background: "rgba(56,189,248,0.12)" }}>🖥️</div>
            <span className="nav-item-text">System Info</span>
          </button>
          <button className={`nav-item ${page === "network" ? "active" : ""}`} onClick={() => navigateTo("network")}>
            <div className="nav-icon" style={{ background: "rgba(0,210,160,0.12)" }}>🌐</div>
            <span className="nav-item-text">Network</span>
          </button>
          <button className={`nav-item ${page === "processes" ? "active" : ""}`} onClick={() => navigateTo("processes")}>
            <div className="nav-icon" style={{ background: "rgba(244,63,94,0.12)" }}>📊</div>
            <span className="nav-item-text">Processes</span>
          </button>
          <button className={`nav-item ${page === "ports" ? "active" : ""}`} onClick={() => navigateTo("ports")}>
            <div className="nav-icon" style={{ background: "rgba(251,146,60,0.12)" }}>🔌</div>
            <span className="nav-item-text">Ports</span>
          </button>
        </div>

        <div className="sidebar-spacer" />

        {stats && (
          <div className="sidebar-stats">
            <div className="sidebar-stat"><span>CPU</span><span className="sidebar-stat-val">{stats.cpu_usage}%</span></div>
            <div className="sidebar-stat"><span>RAM</span><span className="sidebar-stat-val">{stats.ram_used_gb}/{stats.ram_total_gb} GB</span></div>
            <div className="sidebar-stat"><span>Disk</span><span className="sidebar-stat-val">{stats.disk_free_gb} GB free</span></div>
            {stats.battery_pct >= 0 && (
              <div className="sidebar-stat"><span>Battery</span><span className="sidebar-stat-val">{stats.battery_pct}%{stats.battery_charging ? " ⚡" : ""}</span></div>
            )}
          </div>
        )}
      </aside>

      {/* ===== MAIN ===== */}
      <main className="main">
        {/* ---- SMART SCAN ---- */}
        {page === "smart-scan" && (
          <div className="scan-view fade-up" key="scan">
            <Ring pct={scanPct}>
              {scanData ? (<><div className="ring-value">{scanData.total_display}</div><div className="ring-label">detected</div></>)
                : scanning ? (<><div className="ring-value" style={{ fontSize: "1.6rem" }}><span className="spinning">🔍</span></div><div className="ring-label">Scanning...</div></>)
                  : (<><div className="ring-value" style={{ fontSize: "2.2rem" }}>Mac</div><div className="ring-label">Ready</div></>)}
            </Ring>
            <h1 className="scan-title">{!busy && total > 0 ? "✨ Clean Complete" : scanData ? "Scan Complete" : busy ? "Cleaning..." : "Smart Scan"}</h1>
            <p className="scan-sub">
              {!busy && total > 0 ? `Đã dọn xong ${doneCount} tasks.` : scanData ? `Phát hiện ${scanData.total_display} rác.` : "Quét hệ thống, phát hiện rác, dọn dẹp 1 click."}
            </p>
            {!scanData && !busy && total === 0 && <button className="btn-glow" onClick={doScan} disabled={scanning}>{scanning ? "⏳ Đang quét..." : "Scan"}</button>}
            {scanData && !busy && total === 0 && <button className="btn-glow green" onClick={cleanAll}>🧹 Clean All Safe</button>}
            {busy && (
              <div className="progress-panel fade-up" style={{ width: "100%", maxWidth: 520 }}>
                <div className="pp-head"><span className="pp-title">Đang dọn...</span><span className="pp-count">{prog}/{total}</span></div>
                <div className="pp-track"><div className="pp-fill" style={{ width: `${(prog / total) * 100}%` }} /></div>
                {logs.length > 0 && <div className="pp-log">{logs.map((l, i) => <div key={i} className={l.ok ? "log-ok" : "log-err"}>{l.t}</div>)}</div>}
              </div>
            )}
            {!busy && total > 0 && (
              <div className="progress-panel fade-up" style={{ width: "100%", maxWidth: 520 }}>
                <div className="pp-head"><span className="pp-title">✨ Hoàn tất!</span><span className="pp-count">{prog}/{total}</span></div>
                <div className="pp-track"><div className="pp-fill" style={{ width: "100%" }} /></div>
                <div className="pp-log">{logs.map((l, i) => <div key={i} className={l.ok ? "log-ok" : "log-err"}>{l.t}</div>)}</div>
              </div>
            )}
            {scanData && <div className="results-grid fade-up">{scanData.items.map((item, i) => (<div className="result-tile" key={i}><div className="rt-icon">{item.icon}</div><div className="rt-size">{item.size_display}</div><div className="rt-label">{item.category}</div></div>))}</div>}
            {stats && (
              <div className="monitor-grid fade-up">
                <div className="monitor-card"><div className="mc-icon">🖥️</div><div className="mc-val"><AnimNum value={stats.cpu_usage} suffix="%" /></div><div className="mc-label">CPU</div><div className="mc-bar"><div className="mc-bar-fill" style={{ width: `${stats.cpu_usage}%`, background: stats.cpu_usage > 80 ? "var(--red)" : "var(--green)" }} /></div></div>
                <div className="monitor-card"><div className="mc-icon">🧠</div><div className="mc-val"><AnimNum value={stats.ram_pct} suffix="%" /></div><div className="mc-label">RAM</div><div className="mc-bar"><div className="mc-bar-fill" style={{ width: `${stats.ram_pct}%`, background: stats.ram_pct > 85 ? "var(--red)" : "var(--blue)" }} /></div></div>
                <div className="monitor-card"><div className="mc-icon">💾</div><div className="mc-val"><AnimNum value={stats.disk_pct} suffix="%" /></div><div className="mc-label">Disk</div><div className="mc-bar"><div className="mc-bar-fill" style={{ width: `${stats.disk_pct}%`, background: stats.disk_pct > 90 ? "var(--red)" : "var(--accent-light)" }} /></div></div>
                <div className="monitor-card"><div className="mc-icon">{stats.battery_charging ? "⚡" : "🔋"}</div><div className="mc-val">{stats.battery_pct >= 0 ? <AnimNum value={stats.battery_pct} suffix="%" /> : "N/A"}</div><div className="mc-label">Battery</div><div className="mc-bar"><div className="mc-bar-fill" style={{ width: `${Math.max(stats.battery_pct, 0)}%`, background: stats.battery_pct < 20 ? "var(--red)" : "var(--green)" }} /></div></div>
              </div>
            )}
          </div>
        )}

        {/* ---- DISK LENS ---- */}
        {page === "disk-lens" && (
          <div className="disk-view fade-up" key="disk">
            <h1 className="disk-title">💾 Disk Lens</h1>
            <p className="disk-sub">{stats ? `${stats.disk_used_gb} GB / ${stats.disk_total_gb} GB — ${stats.disk_free_gb} GB free` : "Loading..."}</p>
            {diskItems.length > 0 ? (
              <>
                <div className="disk-bar-container"><div className="disk-bar">{diskItems.map((d, i) => (<div key={i} className="disk-segment" style={{ width: `${Math.max(d.pct, 0.5)}%`, background: d.color }} title={`${d.name}: ${d.size_display}`} />))}</div></div>
                <div className="disk-legend">{diskItems.map((d, i) => (<div className="legend-item" key={i}><div className="legend-dot" style={{ background: d.color }} /><div className="legend-info"><div className="legend-name">{d.name}</div><div className="legend-size">{d.size_display} ({d.pct}%)</div></div></div>))}</div>
              </>
            ) : <p className="scan-sub" style={{ textAlign: "center", marginTop: "3rem" }}><span className="spinning">📊</span> Đang phân tích...</p>}
          </div>
        )}

        {/* ---- SYSTEM INFO ---- */}
        {page === "sys-info" && (
          <div className="detail fade-up" key="sysinfo">
            <div className="detail-top">
              <div className="detail-icon-box" style={{ background: "rgba(56,189,248,0.12)" }}>🖥️</div>
              <div className="detail-meta"><h1 className="detail-title">System Info</h1><p className="detail-desc">Chi tiết phần cứng & phần mềm</p></div>
            </div>
            {sysInfo ? (
              <div className="info-list">
                <InfoRow icon="💻" label="Hostname" value={sysInfo.hostname} />
                <InfoRow icon="🍎" label="macOS" value={sysInfo.macos_version} />
                <InfoRow icon="⚙️" label="Chip" value={sysInfo.chip} />
                <InfoRow icon="📦" label="Model" value={sysInfo.model} />
                <InfoRow icon="🔑" label="Serial" value={sysInfo.serial} />
                <InfoRow icon="🧠" label="RAM" value={sysInfo.ram} />
                <InfoRow icon="⏱️" label="Uptime" value={sysInfo.uptime} />
                <InfoRow icon="🔧" label="Kernel" value={sysInfo.kernel} />
              </div>
            ) : <p className="scan-sub"><span className="spinning">⏳</span> Loading...</p>}
          </div>
        )}

        {/* ---- NETWORK ---- */}
        {page === "network" && (
          <div className="detail fade-up" key="net">
            <div className="detail-top">
              <div className="detail-icon-box" style={{ background: "rgba(0,210,160,0.12)" }}>🌐</div>
              <div className="detail-meta"><h1 className="detail-title">Network</h1><p className="detail-desc">IP, WiFi, DNS, latency</p></div>
            </div>
            <div className="detail-toolbar">
              <button className="btn-pill primary" onClick={() => { setNetInfo(null); invoke<NetworkInfo>("get_network_info").then(setNetInfo).catch(() => { }); }}>🔄 Refresh</button>
            </div>
            {netInfo ? (
              <div className="info-list">
                <InfoRow icon="📡" label="WiFi" value={netInfo.wifi_name} />
                <InfoRow icon="🏠" label="Local IP" value={netInfo.local_ip} />
                <InfoRow icon="🌍" label="Public IP" value={netInfo.public_ip} />
                <InfoRow icon="🚪" label="Gateway" value={netInfo.gateway} />
                <InfoRow icon="📋" label="DNS" value={netInfo.dns_servers} />
                <InfoRow icon="⚡" label="Ping (8.8.8.8)" value={netInfo.ping_ms} />
              </div>
            ) : <p className="scan-sub"><span className="spinning">⏳</span> Loading...</p>}
          </div>
        )}

        {/* ---- PROCESSES ---- */}
        {page === "processes" && (
          <div className="detail fade-up" key="proc">
            <div className="detail-top">
              <div className="detail-icon-box" style={{ background: "rgba(244,63,94,0.12)" }}>📊</div>
              <div className="detail-meta"><h1 className="detail-title">Processes</h1><p className="detail-desc">Top CPU/RAM consumers</p></div>
            </div>
            <div className="detail-toolbar">
              <button className="btn-pill primary" onClick={() => invoke<ProcessItem[]>("get_top_processes").then(setProcs).catch(() => { })}>🔄 Refresh</button>
            </div>
            <div className="tasks">
              {procs.map((p, i) => (
                <div className="task slide-right" key={i}>
                  <div className="task-dot" style={{ background: "rgba(244,63,94,0.15)", borderColor: "transparent", color: "var(--text-secondary)", fontSize: "0.6rem", fontWeight: 700 }}>{p.pid}</div>
                  <div className="task-body">
                    <div className="task-name">{p.name}</div>
                    <div className="task-desc">CPU: {p.cpu} • RAM: {p.mem}</div>
                  </div>
                  <button className="task-action error" onClick={() => killProc(p.pid)}>Kill</button>
                </div>
              ))}
              {procs.length === 0 && <p className="scan-sub"><span className="spinning">⏳</span> Loading...</p>}
            </div>
          </div>
        )}

        {/* ---- PORTS ---- */}
        {page === "ports" && (
          <div className="detail fade-up" key="ports">
            <div className="detail-top">
              <div className="detail-icon-box" style={{ background: "rgba(251,146,60,0.12)" }}>🔌</div>
              <div className="detail-meta"><h1 className="detail-title">Listening Ports</h1><p className="detail-desc">TCP ports đang mở trên máy</p></div>
            </div>
            <div className="detail-toolbar">
              <button className="btn-pill primary" onClick={() => invoke<PortItem[]>("get_listening_ports").then(setPorts).catch(() => { })}>🔄 Refresh</button>
            </div>
            <div className="tasks">
              {ports.map((p, i) => (
                <div className="task slide-right" key={i}>
                  <div className="task-dot" style={{ background: "rgba(251,146,60,0.15)", borderColor: "transparent", color: "var(--orange)", fontSize: "0.55rem", fontWeight: 800 }}>:{p.port}</div>
                  <div className="task-body">
                    <div className="task-name">{p.process}</div>
                    <div className="task-desc">PID: {p.pid} • {p.protocol}</div>
                  </div>
                  <button className="task-action error" onClick={() => killProc(p.pid)}>Kill</button>
                </div>
              ))}
              {ports.length === 0 && <p className="scan-sub"><span className="spinning">⏳</span> Loading...</p>}
            </div>
          </div>
        )}

        {/* ---- CATEGORY DETAIL ---- */}
        {activeCat && (
          <div className="detail fade-up" key={page}>
            <div className="detail-top">
              <div className="detail-icon-box" style={{ background: activeCat.iconBg }}>{activeCat.icon}</div>
              <div className="detail-meta"><h1 className="detail-title">{activeCat.title}</h1><p className="detail-desc">{activeCat.subtitle}</p></div>
            </div>
            <div className="detail-toolbar"><button className="btn-pill primary" onClick={() => cleanCat(activeCat)} disabled={busy}>🧹 Clean All Safe</button></div>
            <div className="tasks">
              {activeCat.items.map((item) => {
                const st = statuses[item.id] || "idle";
                return (
                  <div className="task slide-right" key={item.id}>
                    <div className={`task-dot ${st}`}>{st === "done" ? "✓" : st === "error" ? "✕" : ""}</div>
                    <div className="task-body"><div className="task-name">{item.name}</div><div className="task-desc">{item.desc}</div></div>
                    <button className={`task-action ${st}`} onClick={() => cleanOne(item)} disabled={st === "running" || st === "done"}>
                      {st === "done" ? "Done ✓" : st === "running" ? "Running..." : st === "error" ? "Retry" : "Clean"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
