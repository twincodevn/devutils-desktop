import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SystemStats, DiskItem } from "../../types";

export function DiskLens({ stats }: { stats: SystemStats | null }) {
    const [diskItems, setDiskItems] = useState<DiskItem[]>([]);

    useEffect(() => {
        invoke<DiskItem[]>("get_disk_breakdown").then(setDiskItems).catch(() => { });
    }, []);

    return (
        <div className="disk-view fade-up">
            <h1 className="disk-title">💾 Disk Lens</h1>
            <p className="disk-sub">{stats ? `${stats.disk_used_gb} GB / ${stats.disk_total_gb} GB — ${stats.disk_free_gb} GB free` : "Loading..."}</p>
            {diskItems.length > 0 ? (
                <>
                    <div className="disk-bar-container"><div className="disk-bar">{diskItems.map((d, i) => (<div key={i} className="disk-segment" style={{ width: `${Math.max(d.pct, 0.5)}%`, background: d.color }} title={`${d.name}: ${d.size_display}`} />))}</div></div>
                    <div className="disk-legend">{diskItems.map((d, i) => (<div className="legend-item" key={i}><div className="legend-dot" style={{ background: d.color }} /><div className="legend-info"><div className="legend-name">{d.name}</div><div className="legend-size">{d.size_display} ({d.pct}%)</div></div></div>))}</div>
                </>
            ) : <p className="scan-sub" style={{ textAlign: "center", marginTop: "3rem" }}><span className="spinning">📊</span> Đang phân tích...</p>}
        </div>
    );
}
