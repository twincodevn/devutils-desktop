import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { NetworkInfo } from "../../types";
import { InfoRow } from "../ui/InfoRow";

export function NetworkView() {
    const [netInfo, setNetInfo] = useState<NetworkInfo | null>(null);

    const fetchNetwork = () => {
        setNetInfo(null);
        invoke<NetworkInfo>("get_network_info").then(setNetInfo).catch(() => { });
    };

    useEffect(() => {
        fetchNetwork();
    }, []);

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(0,210,160,0.12)" }}>🌐</div>
                <div className="detail-meta"><h1 className="detail-title">Network</h1><p className="detail-desc">IP, WiFi, DNS, latency</p></div>
            </div>
            <div className="detail-toolbar">
                <button className="btn-pill primary" onClick={fetchNetwork}>🔄 Refresh</button>
            </div>
            {netInfo ? (
                <div className="info-list">
                    <InfoRow icon="📡" label="WiFi" value={netInfo.wifi_name} />
                    <InfoRow icon="🏠" label="Local IP" value={netInfo.local_ip} />
                    <InfoRow icon="🌍" label="Public IP" value={netInfo.public_ip} />
                    <InfoRow icon="🚪" label="Gateway" value={netInfo.gateway} />
                    <InfoRow icon="📋" label="DNS" value={netInfo.dns_servers} />
                    <InfoRow icon="⚡" label="Ping (8.8.8.8)" value={netInfo.ping_ms} />
                </div>
            ) : <p className="scan-sub"><span className="spinning">⏳</span> Loading...</p>}
        </div>
    );
}
