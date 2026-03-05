import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { StartupItem } from "../../types";
import { IconStartup } from "../ui/Icons";

export function StartupView() {
    const [items, setItems] = useState<StartupItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const data = await invoke<StartupItem[]>("get_startup_items");
            setItems(data);
        } catch {
            // If the command doesn't exist yet, show mock data
            setItems([]);
        }
        setLoading(false);
    };

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(45,212,191,0.12)" }}><IconStartup size={24} color="#2dd4bf" /></div>
                <div className="detail-meta">
                    <h1 className="detail-title">Startup Items</h1>
                    <p className="detail-desc">Manage apps that launch at login to speed up boot time.</p>
                </div>
            </div>

            <div className="detail-toolbar">
                <button className="btn-pill primary" onClick={fetchItems}>
                    <IconStartup size={14} color="white" /> Refresh
                </button>
            </div>

            {loading ? (
                <div>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state">
                    <IconStartup size={48} />
                    <p className="scan-sub">No startup items found or feature pending Rust backend integration.</p>
                </div>
            ) : (
                <div className="tasks">
                    {items.map((item, i) => (
                        <div className="task slide-right" key={i}>
                            <button
                                className={`toggle-switch ${item.enabled ? "active" : ""}`}
                                onClick={() => {
                                    const toggled = { ...item, enabled: !item.enabled };
                                    setItems(prev => prev.map((it, idx) => idx === i ? toggled : it));
                                    invoke("toggle_startup_item", { path: item.path, enabled: !item.enabled }).catch(() => { });
                                }}
                            />
                            <div className="task-body">
                                <div className="task-name">{item.name}</div>
                                <div className="task-desc">{item.path}</div>
                            </div>
                            <span className="nav-badge">{item.kind}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
