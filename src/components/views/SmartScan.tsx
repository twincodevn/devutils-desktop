import { SystemStats, ScanSummary } from "../../types";
import { Ring } from "../ui/Ring";
import { AnimNum } from "../ui/AnimNum";

interface Props {
    scanData: ScanSummary | null;
    scanning: boolean;
    scanPct: number;
    stats: SystemStats | null;
    busy: boolean;
    total: number;
    prog: number;
    doneCount: number;
    logs: { t: string; ok: boolean }[];
    doScan: () => void;
    cleanAll: () => void;
}

export function SmartScan({ scanData, scanning, scanPct, stats, busy, total, prog, doneCount, logs, doScan, cleanAll }: Props) {
    return (
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
                    <div className="pp-track"><div className="pp-fill" style={{ width: `${total ? (prog / total) * 100 : 0}%` }} /></div>
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

            {scanData && (
                <div className="results-grid fade-up">
                    {scanData.items.map((item, i) => (
                        <div className="result-tile" key={i}>
                            <div className="rt-icon">{item.icon}</div>
                            <div className="rt-size">{item.size_display}</div>
                            <div className="rt-label">{item.category}</div>
                        </div>
                    ))}
                </div>
            )}

            {stats && (
                <div className="monitor-grid fade-up">
                    <div className="monitor-card"><div className="mc-icon">🖥️</div><div className="mc-val"><AnimNum value={stats.cpu_usage} suffix="%" /></div><div className="mc-label">CPU</div><div className="mc-bar"><div className="mc-bar-fill" style={{ width: `${stats.cpu_usage}%`, background: stats.cpu_usage > 80 ? "var(--red)" : "var(--green)" }} /></div></div>
                    <div className="monitor-card"><div className="mc-icon">🧠</div><div className="mc-val"><AnimNum value={stats.ram_pct} suffix="%" /></div><div className="mc-label">RAM</div><div className="mc-bar"><div className="mc-bar-fill" style={{ width: `${stats.ram_pct}%`, background: stats.ram_pct > 85 ? "var(--red)" : "var(--blue)" }} /></div></div>
                    <div className="monitor-card"><div className="mc-icon">💾</div><div className="mc-val"><AnimNum value={stats.disk_pct} suffix="%" /></div><div className="mc-label">Disk</div><div className="mc-bar"><div className="mc-bar-fill" style={{ width: `${stats.disk_pct}%`, background: stats.disk_pct > 90 ? "var(--red)" : "var(--accent-light)" }} /></div></div>
                    <div className="monitor-card"><div className="mc-icon">{stats.battery_charging ? "⚡" : "🔋"}</div><div className="mc-val">{stats.battery_pct >= 0 ? <AnimNum value={stats.battery_pct} suffix="%" /> : "N/A"}</div><div className="mc-label">Battery</div><div className="mc-bar"><div className="mc-bar-fill" style={{ width: `${Math.max(stats.battery_pct, 0)}%`, background: stats.battery_pct < 20 ? "var(--red)" : "var(--green)" }} /></div></div>
                </div>
            )}
        </div>
    );
}
