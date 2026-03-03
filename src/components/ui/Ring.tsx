import React from "react";

export function Ring({ pct, children }: { pct: number; children: React.ReactNode }) {
    const r = 125, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
    return (
        <div className="ring-outer">
            <div className={`ring-glow ${pct > 0 ? "active" : ""}`} />
            <svg className="ring-svg" viewBox="0 0 280 280">
                <defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#00d2a0" />
                </linearGradient></defs>
                <circle className="ring-bg" cx="140" cy="140" r={r} />
                <circle className="ring-progress" cx="140" cy="140" r={r} style={{ strokeDasharray: c, strokeDashoffset: off }} />
            </svg>
            <div className="ring-center">{children}</div>
        </div>
    );
}
