export interface CleanResult { category: string; command_name: string; success: boolean; output: string; error: string }
export interface ScanResult { category: string; icon: string; size_bytes: number; size_display: string }
export interface ScanSummary { items: ScanResult[]; total_bytes: number; total_display: string }
export interface SystemStats {
  cpu_usage: number; ram_total_gb: number; ram_used_gb: number; ram_pct: number;
  disk_total_gb: number; disk_used_gb: number; disk_free_gb: number; disk_pct: number;
  battery_pct: number; battery_charging: boolean; uptime: string;
}
export interface DiskItem { name: string; size_bytes: number; size_display: string; color: string; pct: number }
export interface SystemInfo { hostname: string; macos_version: string; chip: string; model: string; serial: string; uptime: string; ram: string; kernel: string }
export interface NetworkInfo { local_ip: string; public_ip: string; wifi_name: string; gateway: string; dns_servers: string; ping_ms: string }
export interface ProcessItem { pid: string; name: string; cpu: string; mem: string }
export interface PortItem { port: string; pid: string; process: string; protocol: string }

export type Status = "idle" | "running" | "done" | "error";
export type Page = "smart-scan" | "system-junk" | "developer" | "browser" | "app-leftovers" | "optimize" | "disk-lens" | "sys-info" | "network" | "processes" | "ports" | "recommendations";

export interface TaskItem { id: string; name: string; desc: string; command: string; risk: "safe" | "moderate" | "caution" }
export interface Category { page: Page; icon: string; iconBg: string; title: string; subtitle: string; items: TaskItem[] }
