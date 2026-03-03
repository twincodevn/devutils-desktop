export function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <div className="info-row">
            <span className="info-icon">{icon}</span>
            <span className="info-label">{label}</span>
            <span className="info-value">{value || "—"}</span>
        </div>
    );
}
