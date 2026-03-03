import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { PortItem, CleanResult } from "../../types";

export function PortsView() {
    const [ports, setPorts] = useState<PortItem[]>([]);

    const fetchPorts = () => {
        invoke<PortItem[]>("get_listening_ports").then(setPorts).catch(() => { });
    };

    useEffect(() => {
        fetchPorts();
    }, []);

    const killProc = async (pid: string) => {
        try {
            await invoke<CleanResult>("kill_process", { pid });
            fetchPorts(); // Refresh to see if port was released
        } catch { }
    };

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(251,146,60,0.12)" }}>🔌</div>
                <div className="detail-meta"><h1 className="detail-title">Listening Ports</h1><p className="detail-desc">TCP ports đang mở trên máy</p></div>
            </div>
            <div className="detail-toolbar">
                <button className="btn-pill primary" onClick={fetchPorts}>🔄 Refresh</button>
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
    );
}
