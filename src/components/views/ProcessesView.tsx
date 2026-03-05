import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ProcessItem, CleanResult } from "../../types";
import { IconProcess, IconRefresh, IconKill, IconSearch } from "../ui/Icons";

export function ProcessesView() {
    const [procs, setProcs] = useState<ProcessItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"cpu" | "mem">("cpu");

    const fetchProcs = () => {
        setLoading(true);
        invoke<ProcessItem[]>("get_top_processes").then(data => {
            setProcs(data);
            setLoading(false);
        }).catch(() => { setLoading(false); });
    };

    useEffect(() => {
        fetchProcs();
    }, []);

    const killProc = async (pid: string) => {
        try {
            await invoke<CleanResult>("kill_process", { pid });
            setProcs((p) => p.filter((x) => x.pid !== pid));
        } catch { }
    };

    const filtered = procs
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const av = parseFloat(sortBy === "cpu" ? a.cpu : a.mem);
            const bv = parseFloat(sortBy === "cpu" ? b.cpu : b.mem);
            return bv - av;
        });

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(244,63,94,0.12)" }}>
                    <IconProcess size={24} color="#f43f5e" />
                </div>
                <div className="detail-meta">
                    <h1 className="detail-title">Processes</h1>
                    <p className="detail-desc">Top CPU/RAM consumers — sort and kill.</p>
                </div>
            </div>
            <div className="detail-toolbar">
                <button className="btn-pill primary" onClick={fetchProcs}>
                    <IconRefresh size={14} color="white" /> Refresh
                </button>
                <button
                    className={`btn-pill ${sortBy === "cpu" ? "primary" : "secondary"}`}
                    onClick={() => setSortBy("cpu")}
                >
                    CPU ↓
                </button>
                <button
                    className={`btn-pill ${sortBy === "mem" ? "primary" : "secondary"}`}
                    onClick={() => setSortBy("mem")}
                >
                    RAM ↓
                </button>
            </div>

            {procs.length > 0 && (
                <div className="search-wrapper">
                    <IconSearch size={14} />
                    <input
                        className="search-input"
                        placeholder="Filter processes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            {loading ? (
                <div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))}
                </div>
            ) : (
                <div className="tasks">
                    {filtered.map((p, i) => (
                        <div className="task slide-right" key={i}>
                            <div className="task-dot" style={{
                                background: "rgba(244,63,94,0.12)",
                                borderColor: "transparent",
                                color: "var(--text-tertiary)",
                                fontSize: "0.55rem",
                                fontWeight: 700,
                                fontVariantNumeric: "tabular-nums"
                            }}>
                                {p.pid}
                            </div>
                            <div className="task-body">
                                <div className="task-name">{p.name}</div>
                                <div className="task-desc">
                                    CPU: <span style={{ color: parseFloat(p.cpu) > 50 ? "var(--red)" : "var(--text-secondary)" }}>{p.cpu}</span>
                                    {" • "}
                                    RAM: <span style={{ color: parseFloat(p.mem) > 10 ? "var(--yellow)" : "var(--text-secondary)" }}>{p.mem}</span>
                                </div>
                            </div>
                            <button className="btn-pill danger" onClick={() => killProc(p.pid)}>
                                <IconKill size={12} /> Kill
                            </button>
                        </div>
                    ))}
                    {filtered.length === 0 && <p className="scan-sub" style={{ textAlign: "center" }}>No matching processes.</p>}
                </div>
            )}
        </div>
    );
}
