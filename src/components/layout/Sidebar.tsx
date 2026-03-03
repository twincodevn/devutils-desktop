import { Page, SystemStats } from "../../types";
import { categories } from "../../data/categories";

interface SidebarProps {
    page: Page;
    navigateTo: (p: Page) => void;
    stats: SystemStats | null;
}

export function Sidebar({ page, navigateTo, stats }: SidebarProps) {
    return (
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
                <button className={`nav-item ${page === "recommendations" ? "active" : ""}`} onClick={() => navigateTo("recommendations")}>
                    <div className="nav-icon" style={{ background: "rgba(168,85,247,0.12)" }}>💡</div>
                    <span className="nav-item-text">AI Advice</span>
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
    );
}
