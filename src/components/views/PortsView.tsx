import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { PortItem, CleanResult } from "../../types";
import { IconPort, IconRefresh, IconKill, IconSearch } from "../ui/Icons";

export function PortsView() {
    const [ports, setPorts] = useState<PortItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchPorts = () => {
        setLoading(true);
        invoke<PortItem[]>("get_listening_ports").then(data => {
            setPorts(data);
            setLoading(false);
        }).catch(() => { setLoading(false); });
    };

    useEffect(() => {
        fetchPorts();
    }, []);

    const killProc = async (pid: string) => {
        try {
            await invoke<CleanResult>("kill_process", { pid });
            fetchPorts();
        } catch { }
    };

    const filtered = ports.filter(p =>
        p.process.toLowerCase().includes(search.toLowerCase()) ||
        p.port.includes(search)
    );

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(251,146,60,0.12)" }}>
                    <IconPort size={24} color="#fb923c" />
                </div>
                <div className="detail-meta">
                    <h1 className="detail-title">Listening Ports</h1>
                    <p className="detail-desc">Active TCP ports on your Mac — search and kill.</p>
                </div>
            </div>
            <div className="detail-toolbar">
                <button className="btn-pill primary" onClick={fetchPorts}>
                    <IconRefresh size={14} color="white" /> Refresh
                </button>
            </div>

            {ports.length > 0 && (
                <div className="search-wrapper">
                    <IconSearch size={14} />
                    <input
                        className="search-input"
                        placeholder="Search by port or process..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            {loading ? (
                <div>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))}
                </div>
            ) : (
                <div className="tasks">
                    {filtered.map((p, i) => (
                        <div className="task slide-right" key={i}>
                            <div className="task-dot" style={{
                                background: "rgba(251,146,60,0.12)",
                                borderColor: "transparent",
                                color: "var(--orange)",
                                fontSize: "0.5rem",
                                fontWeight: 800,
                                fontVariantNumeric: "tabular-nums",
                                width: 32,
                                minWidth: 32,
                            }}>
                                :{p.port}
                            </div>
                            <div className="task-body">
                                <div className="task-name">{p.process}</div>
                                <div className="task-desc">
                                    PID: {p.pid} •{" "}
                                    <span className="badge" style={{
                                        background: p.protocol.includes("TCP") ? "rgba(56,189,248,0.1)" : "rgba(251,191,36,0.1)",
                                        color: p.protocol.includes("TCP") ? "var(--blue)" : "var(--yellow)",
                                        fontSize: "0.52rem",
                                        padding: "1px 5px",
                                    }}>
                                        {p.protocol}
                                    </span>
                                </div>
                            </div>
                            <button className="btn-pill danger" onClick={() => killProc(p.pid)}>
                                <IconKill size={12} /> Kill
                            </button>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="scan-sub" style={{ textAlign: "center" }}>No matching ports.</p>}
                </div>
            )}
        </div>
    );
}
