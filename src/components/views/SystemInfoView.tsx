import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SystemInfo } from "../../types";
import { IconCpu, IconCopy } from "../ui/Icons";

export function SystemInfoView() {
    const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        invoke<SystemInfo>("get_system_info").then(setSysInfo).catch(() => { });
    }, []);

    const copyValue = (label: string, value: string) => {
        navigator.clipboard.writeText(value).catch(() => { });
        setCopied(label);
        setTimeout(() => setCopied(null), 1500);
    };

    const fields = sysInfo ? [
        { icon: "💻", label: "Hostname", value: sysInfo.hostname },
        { icon: "🍎", label: "macOS", value: sysInfo.macos_version },
        { icon: "⚙️", label: "Chip", value: sysInfo.chip },
        { icon: "📦", label: "Model", value: sysInfo.model },
        { icon: "🔑", label: "Serial", value: sysInfo.serial },
        { icon: "🧠", label: "RAM", value: sysInfo.ram },
        { icon: "⏱️", label: "Uptime", value: sysInfo.uptime },
        { icon: "🔧", label: "Kernel", value: sysInfo.kernel },
    ] : [];

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(56,189,248,0.12)" }}>
                    <IconCpu size={24} color="#38bdf8" />
                </div>
                <div className="detail-meta">
                    <h1 className="detail-title">System Info</h1>
                    <p className="detail-desc">Hardware & software details — click to copy.</p>
                </div>
            </div>
            {sysInfo ? (
                <div className="info-list">
                    {fields.map(f => (
                        <div
                            key={f.label}
                            className="info-row"
                            onClick={() => copyValue(f.label, f.value)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="info-icon">{f.icon}</div>
                            <div className="info-label">{f.label}</div>
                            <div className="info-value">{f.value}</div>
                            <div style={{
                                opacity: copied === f.label ? 1 : 0.3,
                                transition: "opacity 0.2s",
                                color: copied === f.label ? "var(--green)" : "var(--text-tertiary)",
                            }}>
                                {copied === f.label ? "✓" : <IconCopy size={14} />}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))}
                </div>
            )}
        </div>
    );
}
