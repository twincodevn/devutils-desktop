import { Page, SystemStats } from "../../types";
import { categories } from "../../data/categories";
import { IconScan, IconDisk, IconLightbulb, IconCpu, IconNetwork, IconProcess, IconPort, IconBolt, IconSettings, IconRocket, IconLargeFile, IconStartup } from "../ui/Icons";

interface SidebarProps {
    page: Page;
    navigateTo: (p: Page) => void;
    stats: SystemStats | null;
}

export function Sidebar({ page, navigateTo, stats }: SidebarProps) {
    const navIconMap: Record<string, React.ReactNode> = {
        "system-junk": <IconBolt size={16} />,
        "developer": <IconCpu size={16} />,
        "browser": <IconNetwork size={16} />,
        "app-leftovers": <IconDisk size={16} />,
        "optimize": <IconRocket size={16} />,
    };

    return (
        <aside className="sidebar">
            {/* macOS traffic light spacer */}
            <div className="sidebar-header" />

            <div className="sidebar-brand">
                <div className="brand-icon"><IconBolt size={18} color="white" /></div>
                <div className="brand-text">
                    <div className="brand-name">DevUtils Pro</div>
                    <div className="brand-ver">Mac Cleaner v1.0</div>
                </div>
            </div>

            <div className="nav-section">
                <div className="nav-label">Overview</div>
                <button className={`nav-item ${page === "smart-scan" ? "active" : ""}`} onClick={() => navigateTo("smart-scan")}>
                    <div className="nav-icon" style={{ background: "rgba(109,92,231,0.12)" }}><IconScan size={16} /></div>
                    <span className="nav-item-text">Smart Scan</span>
                </button>
                <button className={`nav-item ${page === "disk-lens" ? "active" : ""}`} onClick={() => navigateTo("disk-lens")}>
                    <div className="nav-icon" style={{ background: "rgba(251,191,36,0.12)" }}><IconDisk size={16} /></div>
                    <span className="nav-item-text">Disk Lens</span>
                </button>
                <button className={`nav-item ${page === "recommendations" ? "active" : ""}`} onClick={() => navigateTo("recommendations")}>
                    <div className="nav-icon" style={{ background: "rgba(168,85,247,0.12)" }}><IconLightbulb size={16} /></div>
                    <span className="nav-item-text">AI Advice</span>
                </button>
            </div>

            <div className="nav-section">
                <div className="nav-label">Cleanup</div>
                {categories.map((c) => (
                    <button key={c.page} className={`nav-item ${page === c.page ? "active" : ""}`} onClick={() => navigateTo(c.page)}>
                        <div className="nav-icon" style={{ background: c.iconBg }}>{navIconMap[c.page] || <IconBolt size={16} />}</div>
                        <span className="nav-item-text">{c.title}</span>
                    </button>
                ))}
            </div>

            <div className="nav-section">
                <div className="nav-label">Tools</div>
                <button className={`nav-item ${page === "sys-info" ? "active" : ""}`} onClick={() => navigateTo("sys-info")}>
                    <div className="nav-icon" style={{ background: "rgba(56,189,248,0.12)" }}><IconCpu size={16} /></div>
                    <span className="nav-item-text">System Info</span>
                </button>
                <button className={`nav-item ${page === "network" ? "active" : ""}`} onClick={() => navigateTo("network")}>
                    <div className="nav-icon" style={{ background: "rgba(52,211,153,0.12)" }}><IconNetwork size={16} /></div>
                    <span className="nav-item-text">Network</span>
                </button>
                <button className={`nav-item ${page === "processes" ? "active" : ""}`} onClick={() => navigateTo("processes")}>
                    <div className="nav-icon" style={{ background: "rgba(244,63,94,0.12)" }}><IconProcess size={16} /></div>
                    <span className="nav-item-text">Processes</span>
                </button>
                <button className={`nav-item ${page === "ports" ? "active" : ""}`} onClick={() => navigateTo("ports")}>
                    <div className="nav-icon" style={{ background: "rgba(251,146,60,0.12)" }}><IconPort size={16} /></div>
                    <span className="nav-item-text">Ports</span>
                </button>
                <button className={`nav-item ${page === "startup" ? "active" : ""}`} onClick={() => navigateTo("startup")}>
                    <div className="nav-icon" style={{ background: "rgba(45,212,191,0.12)" }}><IconStartup size={16} /></div>
                    <span className="nav-item-text">Startup Items</span>
                </button>
                <button className={`nav-item ${page === "large-files" ? "active" : ""}`} onClick={() => navigateTo("large-files")}>
                    <div className="nav-icon" style={{ background: "rgba(244,114,182,0.12)" }}><IconLargeFile size={16} /></div>
                    <span className="nav-item-text">Large Files</span>
                </button>
            </div>

            <div className="sidebar-spacer" />

            <div className="nav-section">
                <button className={`nav-item ${page === "settings" ? "active" : ""}`} onClick={() => navigateTo("settings")}>
                    <div className="nav-icon" style={{ background: "rgba(255,255,255,0.06)" }}><IconSettings size={16} /></div>
                    <span className="nav-item-text">Settings</span>
                </button>
            </div>

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
