use serde::{Deserialize, Serialize};
use sysinfo::{Disks, System};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SystemStats {
    pub cpu_usage: f64,
    pub ram_total_gb: f64,
    pub ram_used_gb: f64,
    pub ram_pct: f64,
    pub disk_total_gb: f64,
    pub disk_used_gb: f64,
    pub disk_free_gb: f64,
    pub disk_pct: f64,
    pub battery_pct: i32,
    pub battery_charging: bool,
    pub uptime: String,
}

pub fn get_stats() -> SystemStats {
    let mut sys = System::new_all();
    sys.refresh_all();

    // CPU
    sys.refresh_cpu_usage();
    std::thread::sleep(sysinfo::MINIMUM_CPU_UPDATE_INTERVAL);
    sys.refresh_cpu_usage();
    let cpu = sys.global_cpu_usage() as f64;

    // RAM
    let total_mem = sys.total_memory() as f64 / 1_073_741_824.0;
    let used_mem = sys.used_memory() as f64 / 1_073_741_824.0;

    // Disk (Root)
    let disks = Disks::new_with_refreshed_list();
    let mut d_total = 0.0;
    let mut d_used = 0.0;
    let mut d_free = 0.0;

    if let Some(root) = disks
        .iter()
        .find(|d| d.mount_point() == std::path::Path::new("/"))
    {
        d_total = root.total_space() as f64 / 1_073_741_824.0;
        d_free = root.available_space() as f64 / 1_073_741_824.0;
        d_used = d_total - d_free;
    }

    // Uptime
    let uptime_sec = System::uptime();
    let days = uptime_sec / 86400;
    let hours = (uptime_sec % 86400) / 3600;
    let mins = (uptime_sec % 3600) / 60;
    let uptime_str = if days > 0 {
        format!("{}d {}h {}m", days, hours, mins)
    } else {
        format!("{}h {}m", hours, mins)
    };

    // Battery - sysinfo doesn't handle battery directly on all platforms easily
    // For macOS, we might still need a quick pmset or another library,
    // but the plan said sysinfo. Let's try to find a native way or keep pmset as a fallback for now.
    // Actually, for a "Retry" and "Elite CTO" persona, I should use a more native way if possible.
    // However, sysinfo v0.30+ removed battery. We can use a small shell command for battery as it's not high-frequency polling compared to CPU/RAM.

    let (_, batt_out, _) = run_shell_internal("pmset -g batt | grep -o '[0-9]*%' | tr -d '%'");
    let batt: i32 = batt_out.trim().parse().unwrap_or(-1);
    let (_, charge_out, _) = run_shell_internal("pmset -g batt | grep -c 'AC Power'");
    let charging = charge_out.trim() == "1";

    SystemStats {
        cpu_usage: (cpu * 10.0).round() / 10.0,
        ram_total_gb: (total_mem * 10.0).round() / 10.0,
        ram_used_gb: (used_mem * 10.0).round() / 10.0,
        ram_pct: if total_mem > 0.0 {
            ((used_mem / total_mem) * 100.0).round()
        } else {
            0.0
        },
        disk_total_gb: d_total.round(),
        disk_used_gb: d_used.round(),
        disk_free_gb: d_free.round(),
        disk_pct: if d_total > 0.0 {
            ((d_used / d_total) * 100.0).round()
        } else {
            0.0
        },
        battery_pct: batt,
        battery_charging: charging,
        uptime: uptime_str,
    }
}

fn run_shell_internal(cmd: &str) -> (bool, String, String) {
    let output = std::process::Command::new("sh").arg("-c").arg(cmd).output();
    match output {
        Ok(out) => (
            out.status.success(),
            String::from_utf8_lossy(&out.stdout).to_string(),
            String::from_utf8_lossy(&out.stderr).to_string(),
        ),
        Err(_) => (false, "".into(), "Command failed".into()),
    }
}
