import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ProcessItem, CleanResult } from "../../types";

export function ProcessesView() {
    const [procs, setProcs] = useState<ProcessItem[]>([]);

    const fetchProcs = () => {
        invoke<ProcessItem[]>("get_top_processes").then(setProcs).catch(() => { });
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

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(244,63,94,0.12)" }}>📊</div>
                <div className="detail-meta"><h1 className="detail-title">Processes</h1><p className="detail-desc">Top CPU/RAM consumers</p></div>
            </div>
            <div className="detail-toolbar">
                <button className="btn-pill primary" onClick={fetchProcs}>🔄 Refresh</button>
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
    );
}
