import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { NetworkInfo } from "../../types";
import { IconNetwork, IconRefresh, IconWifi } from "../ui/Icons";

export function NetworkView() {
    const [netInfo, setNetInfo] = useState<NetworkInfo | null>(null);

    const fetchNetwork = () => {
        setNetInfo(null);
        invoke<NetworkInfo>("get_network_info").then(setNetInfo).catch(() => { });
    };

    useEffect(() => {
        fetchNetwork();
    }, []);

    const pingColor = () => {
        if (!netInfo) return "var(--text-secondary)";
        const ms = parseFloat(netInfo.ping_ms);
        if (isNaN(ms)) return "var(--text-secondary)";
        if (ms < 30) return "var(--green)";
        if (ms < 80) return "var(--yellow)";
        return "var(--red)";
    };

    const pingLabel = () => {
        if (!netInfo) return "";
        const ms = parseFloat(netInfo.ping_ms);
        if (isNaN(ms)) return "";
        if (ms < 30) return "Excellent";
        if (ms < 80) return "Good";
        return "Slow";
    };

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(52,211,153,0.12)" }}>
                    <IconNetwork size={24} color="#34d399" />
                </div>
                <div className="detail-meta">
                    <h1 className="detail-title">Network</h1>
                    <p className="detail-desc">IP, WiFi, DNS, latency diagnostics.</p>
                </div>
            </div>
            <div className="detail-toolbar">
                <button className="btn-pill primary" onClick={fetchNetwork}>
                    <IconRefresh size={14} color="white" /> Refresh
                </button>
            </div>
            {netInfo ? (
                <div className="info-list">
                    <div className="info-row">
                        <div className="info-icon"><IconWifi size={16} color="var(--blue)" /></div>
                        <div className="info-label">WiFi</div>
                        <div className="info-value">{netInfo.wifi_name}</div>
                    </div>
                    <div className="info-row">
                        <div className="info-icon" style={{ fontSize: "0.9rem" }}>🏠</div>
                        <div className="info-label">Local IP</div>
                        <div className="info-value" style={{ fontFamily: "'SF Mono', monospace", fontSize: "0.78rem" }}>{netInfo.local_ip}</div>
                    </div>
                    <div className="info-row">
                        <div className="info-icon" style={{ fontSize: "0.9rem" }}>🌍</div>
                        <div className="info-label">Public IP</div>
                        <div className="info-value" style={{ fontFamily: "'SF Mono', monospace", fontSize: "0.78rem" }}>{netInfo.public_ip}</div>
                    </div>
                    <div className="info-row">
                        <div className="info-icon" style={{ fontSize: "0.9rem" }}>🚪</div>
                        <div className="info-label">Gateway</div>
                        <div className="info-value" style={{ fontFamily: "'SF Mono', monospace", fontSize: "0.78rem" }}>{netInfo.gateway}</div>
                    </div>
                    <div className="info-row">
                        <div className="info-icon" style={{ fontSize: "0.9rem" }}>📋</div>
                        <div className="info-label">DNS</div>
                        <div className="info-value" style={{ fontFamily: "'SF Mono', monospace", fontSize: "0.78rem" }}>{netInfo.dns_servers}</div>
                    </div>
                    <div className="info-row">
                        <div className="info-icon" style={{ fontSize: "0.9rem" }}>⚡</div>
                        <div className="info-label">Ping (8.8.8.8)</div>
                        <div className="info-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "'SF Mono', monospace", fontSize: "0.78rem" }}>{netInfo.ping_ms}</span>
                            {pingLabel() && (
                                <span className="badge" style={{
                                    background: `color-mix(in srgb, ${pingColor()} 12%, transparent)`,
                                    color: pingColor(),
                                    fontSize: "0.55rem",
                                    padding: "2px 8px",
                                }}>
                                    {pingLabel()}
                                </span>
                            )}
                        </div>
                    </div>
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
