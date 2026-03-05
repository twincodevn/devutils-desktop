import { IconSettings, IconBolt } from "../ui/Icons";

export function SettingsView() {
    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <IconSettings size={24} color="var(--text-secondary)" />
                </div>
                <div className="detail-meta">
                    <h1 className="detail-title">Settings</h1>
                    <p className="detail-desc">Customize your DevUtils Pro experience.</p>
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-section-title">General</div>
                <div className="settings-row">
                    <div>
                        <div className="settings-row-label">Launch at Login</div>
                        <div className="settings-row-desc">Start DevUtils Pro when you log in</div>
                    </div>
                    <button className="toggle-switch" onClick={(e) => {
                        (e.target as HTMLElement).classList.toggle("active");
                    }} />
                </div>
                <div className="settings-row">
                    <div>
                        <div className="settings-row-label">Real-time Monitoring</div>
                        <div className="settings-row-desc">Show CPU/RAM usage in sidebar (updates every 5s)</div>
                    </div>
                    <button className="toggle-switch active" onClick={(e) => {
                        (e.target as HTMLElement).classList.toggle("active");
                    }} />
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-section-title">Cleanup</div>
                <div className="settings-row">
                    <div>
                        <div className="settings-row-label">Safe Mode Only</div>
                        <div className="settings-row-desc">Only show safe cleanup tasks (skip moderate / caution)</div>
                    </div>
                    <button className="toggle-switch" onClick={(e) => {
                        (e.target as HTMLElement).classList.toggle("active");
                    }} />
                </div>
                <div className="settings-row">
                    <div>
                        <div className="settings-row-label">Auto Scan on Launch</div>
                        <div className="settings-row-desc">Automatically run Smart Scan when app opens</div>
                    </div>
                    <button className="toggle-switch" onClick={(e) => {
                        (e.target as HTMLElement).classList.toggle("active");
                    }} />
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-section-title">About</div>
                <div className="settings-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="brand-icon" style={{ width: 32, height: 32, borderRadius: 8 }}>
                            <IconBolt size={14} color="white" />
                        </div>
                        <div>
                            <div className="settings-row-label">DevUtils Pro</div>
                            <div className="settings-row-desc">Version 1.0.0 • Built with Tauri + React</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
