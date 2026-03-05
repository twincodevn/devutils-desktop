import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SystemStats, DiskItem } from "../../types";
import { IconDisk } from "../ui/Icons";

export function DiskLens({ stats }: { stats: SystemStats | null }) {
    const [diskItems, setDiskItems] = useState<DiskItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        invoke<DiskItem[]>("get_disk_breakdown").then(data => {
            setDiskItems(data);
            setLoading(false);
        }).catch(() => { setLoading(false); });
    }, []);

    return (
        <div className="disk-view fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(251,191,36,0.12)" }}>
                    <IconDisk size={24} color="#fbbf24" />
                </div>
                <div className="detail-meta">
                    <h1 className="detail-title">Disk Lens</h1>
                    <p className="detail-desc">
                        {stats ? `${stats.disk_used_gb} GB / ${stats.disk_total_gb} GB — ${stats.disk_free_gb} GB free` : "Analyzing disk usage..."}
                    </p>
                </div>
            </div>

            {loading ? (
                <div>
                    <div className="skeleton" style={{ height: 24, borderRadius: 12, marginBottom: 24 }} />
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))}
                </div>
            ) : diskItems.length > 0 ? (
                <>
                    <div className="disk-bar-container">
                        <div className="disk-bar">
                            {diskItems.map((d, i) => (
                                <div
                                    key={i}
                                    className="disk-segment"
                                    style={{ width: `${Math.max(d.pct, 0.5)}%`, background: d.color }}
                                    title={`${d.name}: ${d.size_display}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="disk-legend">
                        {diskItems.map((d, i) => (
                            <div className="legend-item" key={i}>
                                <div className="legend-dot" style={{ background: d.color }} />
                                <div className="legend-info">
                                    <div className="legend-name">{d.name}</div>
                                    <div className="legend-size">{d.size_display} ({d.pct}%)</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <IconDisk size={48} />
                    <p className="scan-sub">No disk data available.</p>
                </div>
            )}
        </div>
    );
}
