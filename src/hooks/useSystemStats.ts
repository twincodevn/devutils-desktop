import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SystemStats } from "../types";

export function useSystemStats(refreshMs: number = 5000) {
    const [stats, setStats] = useState<SystemStats | null>(null);

    useEffect(() => {
        const fetchStats = () => invoke<SystemStats>("get_system_stats").then(setStats).catch(() => { });
        fetchStats();
        const id = setInterval(fetchStats, refreshMs);
        return () => clearInterval(id);
    }, [refreshMs]);

    return { stats, setStats };
}
