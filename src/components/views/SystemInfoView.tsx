import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SystemInfo } from "../../types";
import { InfoRow } from "../ui/InfoRow";

export function SystemInfoView() {
    const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);

    useEffect(() => {
        invoke<SystemInfo>("get_system_info").then(setSysInfo).catch(() => { });
    }, []);

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(56,189,248,0.12)" }}>🖥️</div>
                <div className="detail-meta"><h1 className="detail-title">System Info</h1><p className="detail-desc">Chi tiết phần cứng & phần mềm</p></div>
            </div>
            {sysInfo ? (
                <div className="info-list">
                    <InfoRow icon="💻" label="Hostname" value={sysInfo.hostname} />
                    <InfoRow icon="🍎" label="macOS" value={sysInfo.macos_version} />
                    <InfoRow icon="⚙️" label="Chip" value={sysInfo.chip} />
                    <InfoRow icon="📦" label="Model" value={sysInfo.model} />
                    <InfoRow icon="🔑" label="Serial" value={sysInfo.serial} />
                    <InfoRow icon="🧠" label="RAM" value={sysInfo.ram} />
                    <InfoRow icon="⏱️" label="Uptime" value={sysInfo.uptime} />
                    <InfoRow icon="🔧" label="Kernel" value={sysInfo.kernel} />
                </div>
            ) : <p className="scan-sub"><span className="spinning">⏳</span> Loading...</p>}
        </div>
    );
}
