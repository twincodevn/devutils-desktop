import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ProjectRecommendation } from "../../types/predictive";

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

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(168,85,247,0.12)" }}>💡</div>
                <div className="detail-meta">
                    <h1 className="detail-title">AI Recommendations</h1>
                    <p className="detail-desc">Phát hiện dự án cũ không chạm tới và dọn dẹp để giải phóng hàng GB.</p>
                </div>
            </div>

            {loading ? (
                <p className="scan-sub"><span className="spinning">⏳</span> Đang phân tích file hệ thống...</p>
            ) : recs.length === 0 ? (
                <div className="empty-state">
                    <p className="scan-sub">🎉 Tuyệt vời! Không có dự án cũ nào chiếm dung lượng lớn.</p>
                </div>
            ) : (
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
                                    className="btn btn-clean-small"
                                    disabled={cleaning === rec.path}
                                    onClick={() => cleanProject(rec)}
                                >
                                    {cleaning === rec.path ? "Cleaning..." : "Prune"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
        .recs-list { display: flex; flex_direction: column; gap: 12px; margin-top: 20px; }
        .rec-card { 
          background: rgba(255,255,255,0.03); 
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }
        .rec-card:hover { border-color: rgba(168,85,247,0.4); background: rgba(168,85,247,0.04); }
        .rec-project-name { font-size: 16px; font-weight: 600; margin: 0; color: #f8fafc; }
        .rec-project-path { font-size: 12px; color: #94a3b8; margin: 4px 0 8px 0; font-family: monospace; overflow: hidden; text-overflow: ellipsis; max-width: 300px; }
        .rec-badge-row { display: flex; gap: 6px; }
        .badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
        .badge-stale { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .badge-folder { background: rgba(56,189,248,0.1); color: #0ea5e9; }
        .rec-action-box { text-align: right; }
        .rec-savings { font-size: 18px; font-weight: 700; color: #10b981; margin-bottom: 8px; }
        .btn-clean-small { 
          background: #a855f7; color: white; border: none; padding: 6px 16px; border-radius: 6px; 
          font-weight: 600; cursor: pointer; transition: opacity 0.2s;
        }
        .btn-clean-small:hover { opacity: 0.9; }
        .btn-clean-small:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
        </div>
    );
}
