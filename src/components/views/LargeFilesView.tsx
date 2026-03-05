import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LargeFile } from "../../types";
import { IconLargeFile, IconSearch, IconTrash } from "../ui/Icons";

export function LargeFilesView() {
    const [files, setFiles] = useState<LargeFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const data = await invoke<LargeFile[]>("find_large_files");
            setFiles(data);
        } catch {
            setFiles([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const deleteFile = async (path: string) => {
        setDeleting(path);
        try {
            await invoke("delete_file", { path });
            setFiles(prev => prev.filter(f => f.path !== path));
        } catch { }
        setDeleting(null);
    };

    const filtered = files.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.path.toLowerCase().includes(search.toLowerCase())
    );

    const maxSize = files.length > 0 ? Math.max(...files.map(f => f.size_bytes)) : 1;

    return (
        <div className="detail fade-up">
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: "rgba(244,114,182,0.12)" }}>
                    <IconLargeFile size={24} color="#f472b6" />
                </div>
                <div className="detail-meta">
                    <h1 className="detail-title">Large Files</h1>
                    <p className="detail-desc">Find and remove files larger than 100 MB to free up space.</p>
                </div>
            </div>

            <div className="detail-toolbar">
                <button className="btn-pill primary" onClick={fetchFiles} disabled={loading}>
                    <IconSearch size={14} color="white" /> {loading ? "Scanning..." : "Scan"}
                </button>
            </div>

            {files.length > 0 && (
                <div className="search-wrapper">
                    <IconSearch size={14} />
                    <input
                        className="search-input"
                        placeholder="Filter files..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            {loading ? (
                <div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))}
                </div>
            ) : filtered.length === 0 && files.length === 0 ? (
                <div className="empty-state">
                    <IconLargeFile size={48} />
                    <p className="scan-sub">No large files found or scan pending.</p>
                </div>
            ) : (
                <div className="tasks">
                    {filtered.map((f, i) => (
                        <div className="task slide-right" key={i}>
                            <div className="task-body">
                                <div className="task-name">{f.name}</div>
                                <div className="task-desc">{f.path}</div>
                                <div className="file-size-bar">
                                    <div className="file-size-fill" style={{ width: `${(f.size_bytes / maxSize) * 100}%` }} />
                                </div>
                            </div>
                            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--pink)", marginRight: 8, fontVariantNumeric: "tabular-nums" }}>
                                {f.size_display}
                            </span>
                            <button
                                className="btn-pill danger"
                                disabled={deleting === f.path}
                                onClick={() => deleteFile(f.path)}
                            >
                                <IconTrash size={12} /> {deleting === f.path ? "..." : "Delete"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
