import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ProjectRecommendation } from "../../types/predictive";
import { IconLightbulb } from "../ui/Icons";

export function RecommendationsView() {
    const [recs, setRecs] = useState<ProjectRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState<string | null>(null);

    useEffect(() => {
        fetchRecs();
    }, []);

    const fetchRecs = async () => {
        setLoading(true);
        try {
            const data = await invoke<ProjectRecommendation[]>("get_cleanup_recommendations");
            setRecs(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const cleanProject = async (rec: ProjectRecommendation) => {
        setCleaning(rec.path);
        try {
            await invoke("clean_stale_project", { path: rec.path, folder: rec.target_folder });
            await fetchRecs();
        } catch (e) {
            console.error(e);
        }
        setCleaning(null);
    };

    const totalSavings = recs.reduce((sum, r) => sum + (r.potential_savings_bytes || 0), 0);
    const formatSize = (bytes: number) => {
        if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
        if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
        return `${(bytes / 1024).toFixed(0)} KB`;
    };

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(168,85,247,0.12)" }}>
                    <IconLightbulb size={24} color="#a855f7" />
                </div>
                <div className="detail-meta">
                    <h1 className="detail-title">AI Recommendations</h1>
                    <p className="detail-desc">Detect stale projects and reclaim disk space automatically.</p>
                </div>
            </div>

            {loading ? (
                <div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))}
                </div>
            ) : recs.length === 0 ? (
                <div className="empty-state">
                    <IconLightbulb size={48} />
                    <p className="scan-sub">🎉 Great! No stale projects found taking up significant space.</p>
                </div>
            ) : (
                <>
                    {totalSavings > 0 && (
                        <div style={{
                            background: "rgba(52,211,153,0.06)",
                            border: "1px solid rgba(52,211,153,0.15)",
                            borderRadius: "var(--r-sm)",
                            padding: "12px 16px",
                            marginBottom: "16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                                Total potential savings
                            </span>
                            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--green)" }}>
                                +{formatSize(totalSavings)}
                            </span>
                        </div>
                    )}
                    <div className="recs-list">
                        {recs.map((rec) => (
                            <div key={rec.path} className="rec-card">
                                <div className="rec-info">
                                    <h3 className="rec-project-name">{rec.name}</h3>
                                    <p className="rec-project-path">{rec.path}</p>
                                    <div className="rec-badge-row">
                                        <span className="badge badge-stale">Stale Project</span>
                                        <span className="badge badge-folder">{rec.target_folder}</span>
                                    </div>
                                </div>
                                <div className="rec-action-box">
                                    <div className="rec-savings">+{rec.potential_savings_display}</div>
                                    <button
                                        className="btn-clean-small"
                                        disabled={cleaning === rec.path}
                                        onClick={() => cleanProject(rec)}
                                    >
                                        {cleaning === rec.path ? "Cleaning..." : "Prune"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
