import './globals.css'

const DMG_URL = 'https://github.com/twincodevn/devutils-desktop/releases/download/v1.0.0/devutils-desktop_0.1.0_aarch64.dmg'
const GITHUB_URL = 'https://github.com/twincodevn/devutils-desktop'
const VERSION = 'v1.0.0'

const features = [
    {
        icon: '🚀',
        bg: 'rgba(124,58,237,0.12)',
        title: 'Smart Scan',
        desc: 'Scan your entire Mac for junk: caches, logs, crash reports, browser data. See exactly what\'s eating your storage.',
    },
    {
        icon: '💾',
        bg: 'rgba(251,191,36,0.12)',
        title: 'Disk Lens',
        desc: 'Visual breakdown of disk usage by folder — Documents, Downloads, Library, Movies. Instantly find what\'s eating space.',
    },
    {
        icon: '🛠️',
        bg: 'rgba(56,189,248,0.12)',
        title: 'Developer Tools',
        desc: 'Clean Xcode DerivedData, Homebrew, pip, CocoaPods, Gradle & Maven caches. Reclaim gigabytes in seconds.',
    },
    {
        icon: '🖥️',
        bg: 'rgba(56,189,248,0.12)',
        title: 'System Info',
        desc: 'Full hardware & software details: chip, model, serial number, macOS version, kernel, RAM and uptime at a glance.',
    },
    {
        icon: '🌐',
        bg: 'rgba(0,210,160,0.12)',
        title: 'Network Monitor',
        desc: 'See your local IP, public IP, WiFi name, gateway, DNS servers, and ping latency — all in one clean view.',
    },
    {
        icon: '📊',
        bg: 'rgba(244,63,94,0.12)',
        title: 'Process Manager',
        desc: 'Identify top CPU & RAM consumers. Kill runaway processes instantly with one click — no Terminal needed.',
    },
]

export default function Page() {
    return (
        <>
            {/* NAV */}
            <nav className="nav">
                <a href="/" className="nav-logo">
                    <div className="logo-icon">⚡</div>
                    <span>DevUtils Desktop</span>
                </a>
                <div className="nav-actions">
                    <a href={GITHUB_URL} className="nav-link" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href={DMG_URL} className="btn-download" download>
                        ↓ Download Free
                    </a>
                </div>
            </nav>

            {/* HERO */}
            <section className="hero">
                <div className="hero-badge">
                    <span>🎉</span> {VERSION} — Free & Open Source
                </div>
                <h1 className="hero-title">
                    The Mac tool<br />
                    <span className="gradient">developers deserve</span>
                </h1>
                <p className="hero-sub">
                    Clean junk, monitor system, visualize disk usage, inspect network,
                    manage processes and ports — all in one premium native app.
                </p>
                <div className="hero-cta">
                    <a href={DMG_URL} className="btn-download large" download>
                        ⬇️ Download for Mac
                    </a>
                    <a href={GITHUB_URL} className="nav-link" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem' }}>
                        View on GitHub →
                    </a>
                </div>
                <p className="hero-meta">
                    <span>Free forever</span>
                    <span>macOS 12+</span>
                    <span>Apple Silicon & Intel</span>
                    <span>3 MB</span>
                </p>

                {/* APP PREVIEW */}
                <div className="preview-wrap floating" style={{ marginTop: '3.5rem' }}>
                    <div className="preview-glow" />
                    <div className="preview-frame">
                        {/* Window chrome */}
                        <div className="preview-bar">
                            <div className="traffic-dot" style={{ background: '#ff5f57' }} />
                            <div className="traffic-dot" style={{ background: '#febc2e' }} />
                            <div className="traffic-dot" style={{ background: '#28c840' }} />
                        </div>
                        <div className="preview-content">
                            {/* Sidebar */}
                            <div className="preview-sidebar">
                                <div className="preview-brand">
                                    <div className="preview-brand-icon">⚡</div>
                                    <div>
                                        <div className="preview-brand-text">DevUtils</div>
                                        <div className="preview-brand-sub">DEVUTILS PRO</div>
                                    </div>
                                </div>
                                <div className="preview-nav-label">Overview</div>
                                <div className="preview-nav-item active">
                                    <div className="preview-nav-icon" style={{ background: 'rgba(124,58,237,0.12)' }}>🚀</div>
                                    Smart Scan
                                </div>
                                <div className="preview-nav-item">
                                    <div className="preview-nav-icon" style={{ background: 'rgba(251,191,36,0.12)' }}>💾</div>
                                    Disk Lens
                                </div>
                                <div className="preview-separator" />
                                <div className="preview-nav-label">Cleanup</div>
                                {[['🗑️', 'rgba(124,58,237,0.12)', 'System Junk'], ['🛠️', 'rgba(56,189,248,0.12)', 'Developer'], ['🌐', 'rgba(244,114,182,0.12)', 'Browsers']].map(([icon, bg, label]) => (
                                    <div className="preview-nav-item" key={label as string}>
                                        <div className="preview-nav-icon" style={{ background: bg as string }}>{icon}</div>
                                        {label}
                                    </div>
                                ))}
                                <div className="preview-separator" />
                                <div className="preview-nav-label">Tools</div>
                                {[['🖥️', 'rgba(56,189,248,0.12)', 'System Info'], ['📊', 'rgba(244,63,94,0.12)', 'Processes'], ['🔌', 'rgba(251,146,60,0.12)', 'Ports']].map(([icon, bg, label]) => (
                                    <div className="preview-nav-item" key={label as string}>
                                        <div className="preview-nav-icon" style={{ background: bg as string }}>{icon}</div>
                                        {label}
                                    </div>
                                ))}
                            </div>

                            {/* Main content */}
                            <div className="preview-main">
                                <div className="preview-ring">
                                    <svg width="130" height="130" viewBox="0 0 130 130">
                                        <defs>
                                            <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#7c3aed" />
                                                <stop offset="100%" stopColor="#00d2a0" />
                                            </linearGradient>
                                        </defs>
                                        <circle cx="65" cy="65" r="55" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                                        <circle cx="65" cy="65" r="55" fill="none" stroke="url(#rg)" strokeWidth="6" strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 55}`}
                                            strokeDashoffset={`${2 * Math.PI * 55 * 0.35}`}
                                        />
                                    </svg>
                                    <div className="preview-ring-center">
                                        <div className="preview-ring-val">2.4 GB</div>
                                        <div className="preview-ring-lbl">detected</div>
                                    </div>
                                </div>
                                <div className="preview-title">Scan Complete</div>
                                <div className="preview-sub">Found 2.4 GB of junk. Click Clean to remove automatically.</div>
                                <div className="preview-btn">🧹 Clean All Safe</div>
                                <div className="preview-monitor-grid">
                                    {[
                                        { icon: '🖥️', val: '12%', lbl: 'CPU', fill: '#00d2a0', pct: 12 },
                                        { icon: '🧠', val: '68%', lbl: 'RAM', fill: '#38bdf8', pct: 68 },
                                        { icon: '💾', val: '74%', lbl: 'Disk', fill: '#a78bfa', pct: 74 },
                                        { icon: '🔋', val: '85%', lbl: 'Battery', fill: '#00d2a0', pct: 85 },
                                    ].map((m) => (
                                        <div className="preview-mc" key={m.lbl}>
                                            <div className="preview-mc-icon">{m.icon}</div>
                                            <div className="preview-mc-val">{m.val}</div>
                                            <div className="preview-mc-lbl">{m.lbl}</div>
                                            <div className="preview-mc-bar">
                                                <div className="preview-mc-fill" style={{ width: `${m.pct}%`, background: m.fill }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="divider" />

            {/* STATS */}
            <div className="stats">
                <div>
                    <div className="stat-num">8</div>
                    <div className="stat-lbl">Built-in tools</div>
                </div>
                <div>
                    <div className="stat-num">3 MB</div>
                    <div className="stat-lbl">App size</div>
                </div>
                <div>
                    <div className="stat-num">100%</div>
                    <div className="stat-lbl">Free & open source</div>
                </div>
            </div>

            <div className="divider" />

            {/* FEATURES */}
            <section className="features">
                <div className="section-label">Features</div>
                <h2 className="section-title">Everything your Mac needs</h2>
                <p className="section-sub">
                    A complete toolkit for developers who demand more from their machine.
                </p>
                <div className="features-grid">
                    {features.map((f) => (
                        <div className="feat-card" key={f.title}>
                            <div className="feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                            <div className="feat-title">{f.title}</div>
                            <p className="feat-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="divider" />

            {/* CTA */}
            <section className="cta-section">
                <h2 className="cta-title">Ready to clean your Mac?</h2>
                <p className="cta-sub">Download DevUtils Desktop for free. No account, no ads, no tracking.</p>
                <a href={DMG_URL} className="btn-download large" download>
                    ⬇️ Download for macOS — Free
                </a>
                <p className="cta-note">macOS 12 Monterey or later · Apple Silicon (M1–M4) · 3 MB</p>
            </section>

            {/* FOOTER */}
            <footer>
                <div className="footer-copy">© 2026 DevUtils Desktop · Made with ⚡ and Rust</div>
                <div className="footer-links">
                    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href={`${GITHUB_URL}/releases`} target="_blank" rel="noopener noreferrer">Releases</a>
                    <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer">Report Bug</a>
                </div>
            </footer>
        </>
    )
}
