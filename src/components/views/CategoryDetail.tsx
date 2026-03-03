import { Category, TaskItem, Status } from "../../types";

interface Props {
    activeCat: Category;
    statuses: Record<string, Status>;
    busy: boolean;
    cleanCat: (cat: Category) => void;
    cleanOne: (item: TaskItem) => void;
}

export function CategoryDetail({ activeCat, statuses, busy, cleanCat, cleanOne }: Props) {
    return (
        <div className="detail fade-up" key={activeCat.page}>
            <div className="detail-top">
                <div className="detail-icon-box" style={{ background: activeCat.iconBg }}>{activeCat.icon}</div>
                <div className="detail-meta">
                    <h1 className="detail-title">{activeCat.title}</h1>
                    <p className="detail-desc">{activeCat.subtitle}</p>
                </div>
            </div>
            <div className="detail-toolbar">
                <button className="btn-pill primary" onClick={() => cleanCat(activeCat)} disabled={busy}>
                    🧹 Clean All Safe
                </button>
            </div>
            <div className="tasks">
                {activeCat.items.map((item) => {
                    const st = statuses[item.id] || "idle";
                    return (
                        <div className="task slide-right" key={item.id}>
                            <div className={`task-dot ${st}`}>{st === "done" ? "✓" : st === "error" ? "✕" : ""}</div>
                            <div className="task-body">
                                <div className="task-name">{item.name}</div>
                                <div className="task-desc">{item.desc}</div>
                            </div>
                            <button
                                className={`task-action ${st}`}
                                onClick={() => cleanOne(item)}
                                disabled={st === "running" || st === "done"}
                            >
                                {st === "done" ? "Done ✓" : st === "running" ? "Running..." : st === "error" ? "Retry" : "Clean"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
