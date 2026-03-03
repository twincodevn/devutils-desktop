use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Serialize, Deserialize, Clone)]
pub struct CleanResult {
    pub category: String,
    pub command_name: String,
    pub success: bool,
    pub output: String,
    pub error: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ScanResult {
    pub category: String,
    pub icon: String,
    pub size_bytes: u64,
    pub size_display: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ScanSummary {
    pub items: Vec<ScanResult>,
    pub total_bytes: u64,
    pub total_display: String,
}

/// Run a shell command and return stdout + stderr
fn run_shell(cmd: &str) -> (bool, String, String) {
    match Command::new("sh").arg("-c").arg(cmd).output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            (output.status.success(), stdout, stderr)
        }
        Err(e) => (false, String::new(), format!("Failed to execute: {}", e)),
    }
}

/// Get directory size in bytes
fn dir_size(path: &str) -> u64 {
    let (ok, output, _) = run_shell(&format!(
        "du -sk {} 2>/dev/null | awk '{{s+=$1}} END {{print s}}'",
        path
    ));
    if ok {
        output.trim().parse::<u64>().unwrap_or(0) * 1024
    } else {
        0
    }
}

fn format_size(bytes: u64) -> String {
    if bytes == 0 {
        return "0 B".to_string();
    }
    let gb = bytes as f64 / 1_073_741_824.0;
    let mb = bytes as f64 / 1_048_576.0;
    if gb >= 1.0 {
        format!("{:.1} GB", gb)
    } else if mb >= 1.0 {
        format!("{:.0} MB", mb)
    } else {
        format!("{:.0} KB", bytes as f64 / 1024.0)
    }
}

// ============================================================
// SCAN COMMANDS
// ============================================================

#[tauri::command]
fn scan_system() -> ScanSummary {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/Users".to_string());

    let categories = vec![
        (
            "System Junk",
            "🗑️",
            vec![
                format!("{}/Library/Caches", home),
                format!("{}/Library/Logs", home),
            ],
        ),
        (
            "Developer Caches",
            "🛠️",
            vec![
                format!("{}/.gradle/caches", home),
                format!("{}/.m2/repository", home),
                format!("{}/Library/Developer/Xcode/DerivedData", home),
                format!("{}/Library/Caches/CocoaPods", home),
                format!("{}/Library/Caches/pip", home),
            ],
        ),
        (
            "Browser Data",
            "🌐",
            vec![
                format!("{}/Library/Caches/com.apple.Safari", home),
                format!("{}/Library/Caches/Google/Chrome", home),
                format!("{}/Library/Caches/Firefox", home),
                format!("{}/Library/Caches/com.microsoft.edgemac", home),
                format!("{}/Library/Caches/BraveSoftware", home),
            ],
        ),
        (
            "App Leftovers",
            "📱",
            vec![
                format!("{}/Library/Logs/DiagnosticReports", home),
                format!("{}/Library/Saved Application State", home),
            ],
        ),
    ];

    let mut items = Vec::new();
    let mut total: u64 = 0;

    for (name, icon, paths) in categories {
        let mut cat_size: u64 = 0;
        for p in &paths {
            cat_size += dir_size(p);
        }
        total += cat_size;
        items.push(ScanResult {
            category: name.to_string(),
            icon: icon.to_string(),
            size_bytes: cat_size,
            size_display: format_size(cat_size),
        });
    }

    // Downloads
    let downloads_size = dir_size(&format!("{}/Downloads", home));
    total += downloads_size;
    items.push(ScanResult {
        category: "Downloads".to_string(),
        icon: "📦".to_string(),
        size_bytes: downloads_size,
        size_display: format_size(downloads_size),
    });

    // Trash
    let trash_size = dir_size(&format!("{}/.Trash", home));
    total += trash_size;
    items.push(ScanResult {
        category: "Trash".to_string(),
        icon: "🗑️".to_string(),
        size_bytes: trash_size,
        size_display: format_size(trash_size),
    });

    ScanSummary {
        items,
        total_bytes: total,
        total_display: format_size(total),
    }
}

// ============================================================
// CLEAN COMMANDS
// ============================================================

#[tauri::command]
fn clean_user_cache() -> CleanResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let (ok, out, err) = run_shell(&format!("rm -rf {}/Library/Caches/* 2>&1", home));
    CleanResult {
        category: "System Junk".into(),
        command_name: "User Cache".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_system_logs() -> CleanResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let cmd = format!("rm -rf {home}/Library/Logs/* 2>&1");
    let (ok, out, err) = run_shell(&cmd);
    CleanResult {
        category: "System Junk".into(),
        command_name: "System Logs".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_quicklook_cache() -> CleanResult {
    let (ok, out, err) = run_shell("qlmanage -r cache 2>&1");
    CleanResult {
        category: "System Junk".into(),
        command_name: "QuickLook Cache".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_dns_cache() -> CleanResult {
    let (ok, out, err) =
        run_shell("sudo dscacheutil -flushcache 2>&1 && sudo killall -HUP mDNSResponder 2>&1");
    CleanResult {
        category: "System Junk".into(),
        command_name: "DNS Cache".into(),
        success: ok || true, // DNS flush may fail without sudo but isn't critical
        output: if out.is_empty() {
            "DNS cache flushed".into()
        } else {
            out
        },
        error: err,
    }
}

#[tauri::command]
fn clean_xcode_derived() -> CleanResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let cmd = format!(
        "rm -rf {home}/Library/Developer/Xcode/DerivedData/* 2>&1 && \
         rm -rf {home}/Library/Developer/Xcode/Archives/* 2>&1 && \
         rm -rf {home}/Library/Developer/Xcode/iOS\\ Device\\ Logs/* 2>&1"
    );
    let (ok, out, err) = run_shell(&cmd);
    CleanResult {
        category: "Developer".into(),
        command_name: "Xcode Derived Data".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_homebrew() -> CleanResult {
    let (ok, out, err) =
        run_shell("brew cleanup --prune=all -s 2>&1 && rm -rf $(brew --cache) 2>&1");
    CleanResult {
        category: "Developer".into(),
        command_name: "Homebrew Cache".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_pip_cache() -> CleanResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let (ok, out, err) = run_shell(&format!(
        "pip3 cache purge 2>/dev/null; rm -rf {}/Library/Caches/pip 2>&1",
        home
    ));
    CleanResult {
        category: "Developer".into(),
        command_name: "pip Cache".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_cocoapods_cache() -> CleanResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let (ok, out, err) = run_shell(&format!(
        "pod cache clean --all 2>/dev/null; rm -rf {}/Library/Caches/CocoaPods 2>&1",
        home
    ));
    CleanResult {
        category: "Developer".into(),
        command_name: "CocoaPods Cache".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_gradle_maven() -> CleanResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let (ok, out, err) = run_shell(&format!(
        "rm -rf {}/.gradle/caches/* 2>&1 && rm -rf {}/.m2/repository/* 2>&1",
        home, home
    ));
    CleanResult {
        category: "Developer".into(),
        command_name: "Gradle & Maven Cache".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_browser_cache() -> CleanResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let cmd = format!(
        "rm -rf {home}/Library/Caches/com.apple.Safari/* 2>&1 && \
         rm -rf {home}/Library/Caches/Google/Chrome/* 2>&1 && \
         rm -rf {home}/Library/Caches/Firefox/* 2>&1 && \
         rm -rf {home}/Library/Caches/com.microsoft.edgemac/* 2>&1 && \
         rm -rf {home}/Library/Caches/BraveSoftware/* 2>&1"
    );
    let (ok, out, err) = run_shell(&cmd);
    CleanResult {
        category: "Browser".into(),
        command_name: "All Browser Caches".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_crash_reports() -> CleanResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let (ok, out, err) = run_shell(&format!(
        "rm -rf {}/Library/Logs/DiagnosticReports/* 2>&1",
        home
    ));
    CleanResult {
        category: "App Leftovers".into(),
        command_name: "Crash Reports".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_saved_state() -> CleanResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let (ok, out, err) = run_shell(&format!(
        "rm -rf {}/Library/Saved\\ Application\\ State/* 2>&1",
        home
    ));
    CleanResult {
        category: "App Leftovers".into(),
        command_name: "Saved Application State".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn clean_trash() -> CleanResult {
    let home = std::env::var("HOME").unwrap_or_default();
    let (ok, out, err) = run_shell(&format!("rm -rf {}/.Trash/* 2>&1", home));
    CleanResult {
        category: "System".into(),
        command_name: "Trash".into(),
        success: ok,
        output: out,
        error: err,
    }
}

#[tauri::command]
fn purge_ram() -> CleanResult {
    let (ok, out, err) = run_shell("sudo purge 2>&1");
    CleanResult {
        category: "Optimization".into(),
        command_name: "Purge RAM".into(),
        success: ok,
        output: if out.is_empty() {
            "RAM purged successfully".into()
        } else {
            out
        },
        error: err,
    }
}

#[tauri::command]
fn rebuild_spotlight() -> CleanResult {
    let (ok, out, err) = run_shell("sudo mdutil -E / 2>&1");
    CleanResult {
        category: "Optimization".into(),
        command_name: "Rebuild Spotlight".into(),
        success: ok,
        output: out,
        error: err,
    }
}

// ============================================================
// SYSTEM STATS
// ============================================================

#[derive(Serialize, Deserialize, Clone)]
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

#[tauri::command]
fn get_system_stats() -> SystemStats {
    // CPU
    let (_, cpu_out, _) =
        run_shell("top -l 1 -n 0 | grep 'CPU usage' | awk '{print $3}' | tr -d '%'");
    let cpu: f64 = cpu_out.trim().parse().unwrap_or(0.0);

    // RAM
    let (_, pages_free, _) = run_shell("vm_stat | awk '/Pages free/ {print $3}' | tr -d '.'");
    let (_, pages_active, _) = run_shell("vm_stat | awk '/Pages active/ {print $3}' | tr -d '.'");
    let (_, pages_inactive, _) =
        run_shell("vm_stat | awk '/Pages inactive/ {print $3}' | tr -d '.'");
    let (_, pages_wired, _) = run_shell("vm_stat | awk '/Pages wired/ {print $4}' | tr -d '.'");
    let (_, pages_speculative, _) =
        run_shell("vm_stat | awk '/Pages speculative/ {print $3}' | tr -d '.'");
    let page_size: f64 = 16384.0; // Apple Silicon
    let free: f64 = pages_free.trim().parse().unwrap_or(0.0);
    let active: f64 = pages_active.trim().parse().unwrap_or(0.0);
    let inactive: f64 = pages_inactive.trim().parse().unwrap_or(0.0);
    let wired: f64 = pages_wired.trim().parse().unwrap_or(0.0);
    let speculative: f64 = pages_speculative.trim().parse().unwrap_or(0.0);
    let total_pages = free + active + inactive + wired + speculative;
    let used_pages = active + wired;
    let ram_total = (total_pages * page_size) / 1_073_741_824.0;
    let ram_used = (used_pages * page_size) / 1_073_741_824.0;

    // Disk
    let (_, df_out, _) = run_shell("df -g / | tail -1 | awk '{print $2, $3, $4}'");
    let parts: Vec<&str> = df_out.trim().split_whitespace().collect();
    let disk_total: f64 = parts.first().and_then(|s| s.parse().ok()).unwrap_or(0.0);
    let disk_used: f64 = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0.0);
    let disk_free: f64 = parts.get(2).and_then(|s| s.parse().ok()).unwrap_or(0.0);

    // Battery
    let (_, batt_out, _) = run_shell("pmset -g batt | grep -o '[0-9]*%' | tr -d '%'");
    let batt: i32 = batt_out.trim().parse().unwrap_or(-1);
    let (_, charge_out, _) = run_shell("pmset -g batt | grep -c 'AC Power'");
    let charging = charge_out.trim() == "1";

    // Uptime
    let (_, up_out, _) = run_shell("uptime | awk -F'up ' '{print $2}' | awk -F',' '{print $1}'");

    SystemStats {
        cpu_usage: cpu,
        ram_total_gb: (ram_total * 10.0).round() / 10.0,
        ram_used_gb: (ram_used * 10.0).round() / 10.0,
        ram_pct: if ram_total > 0.0 {
            ((ram_used / ram_total) * 100.0).round()
        } else {
            0.0
        },
        disk_total_gb: disk_total,
        disk_used_gb: disk_used,
        disk_free_gb: disk_free,
        disk_pct: if disk_total > 0.0 {
            ((disk_used / disk_total) * 100.0).round()
        } else {
            0.0
        },
        battery_pct: batt,
        battery_charging: charging,
        uptime: up_out.trim().to_string(),
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DiskItem {
    pub name: String,
    pub size_bytes: u64,
    pub size_display: String,
    pub color: String,
    pub pct: f64,
}

#[tauri::command]
fn get_disk_breakdown() -> Vec<DiskItem> {
    let home = std::env::var("HOME").unwrap_or_default();
    let p_docs = format!("{}/Documents", home);
    let p_down = format!("{}/Downloads", home);
    let p_desk = format!("{}/Desktop", home);
    let p_pics = format!("{}/Pictures", home);
    let p_music = format!("{}/Music", home);
    let p_movies = format!("{}/Movies", home);
    let p_lib = format!("{}/Library", home);
    let p_dev = format!("{}/Developer", home);

    let dirs: Vec<(&str, &str, &str)> = vec![
        ("Applications", "/Applications", "#6c5ce7"),
        ("Documents", &p_docs, "#00d2a0"),
        ("Downloads", &p_down, "#ffc312"),
        ("Desktop", &p_desk, "#fd9644"),
        ("Pictures", &p_pics, "#fd79a8"),
        ("Music", &p_music, "#4dabf7"),
        ("Movies", &p_movies, "#e056fd"),
        ("Library", &p_lib, "#ff5252"),
        ("Developer", &p_dev, "#7bed9f"),
    ];

    let (_, total_out, _) = run_shell("df -k / | tail -1 | awk '{print $2}'");
    let total_kb: f64 = total_out.trim().parse().unwrap_or(1.0);
    let total_bytes = total_kb * 1024.0;

    let mut items: Vec<DiskItem> = Vec::new();
    for (name, path, color) in dirs {
        let sz = dir_size(path);
        if sz > 0 {
            items.push(DiskItem {
                name: name.to_string(),
                size_bytes: sz,
                size_display: format_size(sz),
                color: color.to_string(),
                pct: (sz as f64 / total_bytes * 100.0 * 10.0).round() / 10.0,
            });
        }
    }
    items.sort_by(|a, b| b.size_bytes.cmp(&a.size_bytes));
    items
}

// ============================================================
// TRANSLATOR
// ============================================================

#[derive(Serialize, Deserialize, Clone)]
pub struct TranslateResult {
    pub source: String,
    pub translated: String,
    pub success: bool,
    pub error: String,
}

#[tauri::command]
fn translate_text(text: String) -> TranslateResult {
    if text.trim().is_empty() {
        return TranslateResult {
            source: text,
            translated: String::new(),
            success: false,
            error: "Empty text".into(),
        };
    }

    // URL-encode the text for the API call
    let encoded = text
        .replace('%', "%25")
        .replace(' ', "%20")
        .replace('&', "%26")
        .replace('=', "%3D")
        .replace('+', "%2B")
        .replace('#', "%23")
        .replace('\n', "%0A")
        .replace('\r', "%0D")
        .replace('?', "%3F")
        .replace('"', "%22")
        .replace('\'', "%27");

    let url = format!(
        "https://api.mymemory.translated.net/get?q={}&langpair=en|vi",
        encoded
    );

    let cmd = format!("curl -s --max-time 10 '{}'", url);

    let (ok, out, err) = run_shell(&cmd);

    if !ok || out.trim().is_empty() {
        return TranslateResult {
            source: text,
            translated: String::new(),
            success: false,
            error: if err.is_empty() {
                "Translation API request failed".into()
            } else {
                err
            },
        };
    }

    // Parse JSON response to extract translatedText
    match serde_json::from_str::<serde_json::Value>(&out) {
        Ok(json) => {
            if let Some(translated) = json["responseData"]["translatedText"].as_str() {
                TranslateResult {
                    source: text,
                    translated: translated.to_string(),
                    success: true,
                    error: String::new(),
                }
            } else {
                TranslateResult {
                    source: text,
                    translated: String::new(),
                    success: false,
                    error: "Could not parse translation response".into(),
                }
            }
        }
        Err(e) => TranslateResult {
            source: text,
            translated: String::new(),
            success: false,
            error: format!("JSON parse error: {}", e),
        },
    }
}

// ============================================================
// SYSTEM INFO
// ============================================================

#[derive(Serialize, Deserialize, Clone)]
pub struct SystemInfo {
    pub hostname: String,
    pub macos_version: String,
    pub chip: String,
    pub model: String,
    pub serial: String,
    pub uptime: String,
    pub ram: String,
    pub kernel: String,
}

#[tauri::command]
fn get_system_info() -> SystemInfo {
    let run = |cmd: &str| {
        let (_, o, _) = run_shell(cmd);
        o.trim().to_string()
    };
    SystemInfo {
        hostname: run("scutil --get ComputerName 2>/dev/null || hostname"),
        macos_version: run("sw_vers -productVersion"),
        chip: run("sysctl -n machdep.cpu.brand_string 2>/dev/null || sysctl -n hw.model"),
        model: run("sysctl -n hw.model"),
        serial: run(
            "system_profiler SPHardwareDataType 2>/dev/null | awk '/Serial Number/ {print $NF}'",
        ),
        uptime: run("uptime | sed 's/.*up //' | sed 's/,.*//' | xargs"),
        ram: run("sysctl -n hw.memsize | awk '{printf \"%.0f GB\", $1/1073741824}'"),
        kernel: run("uname -r"),
    }
}

// ============================================================
// NETWORK
// ============================================================

#[derive(Serialize, Deserialize, Clone)]
pub struct NetworkInfo {
    pub local_ip: String,
    pub public_ip: String,
    pub wifi_name: String,
    pub gateway: String,
    pub dns_servers: String,
    pub ping_ms: String,
}

#[tauri::command]
fn get_network_info() -> NetworkInfo {
    let run = |cmd: &str| {
        let (_, o, _) = run_shell(cmd);
        o.trim().to_string()
    };
    NetworkInfo {
        local_ip:    run("ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo N/A"),
        public_ip:   run("curl -s --max-time 4 https://api.ipify.org 2>/dev/null || echo N/A"),
        wifi_name:   run("networksetup -getairportnetwork en0 2>/dev/null | sed 's/Current Wi-Fi Network: //' | sed 's/You are not associated.*/Not connected/'"),
        gateway:     run("route -n get default 2>/dev/null | awk '/gateway:/ {print $2}'"),
        dns_servers: run("scutil --dns 2>/dev/null | awk '/nameserver\\[0\\]/ {print $3}' | head -3 | tr '\\n' ' '"),
        ping_ms:     run("ping -c 1 -t 3 8.8.8.8 2>/dev/null | tail -1 | awk -F'/' '{printf \"%.1f ms\", $5}' || echo N/A"),
    }
}

// ============================================================
// PROCESS MANAGER
// ============================================================

#[derive(Serialize, Deserialize, Clone)]
pub struct ProcessItem {
    pub pid: String,
    pub name: String,
    pub cpu: String,
    pub mem: String,
}

#[tauri::command]
fn get_top_processes() -> Vec<ProcessItem> {
    let (_, out, _) = run_shell("ps aux | sort -rk3 | head -11 | tail -10 | awk '{printf \"%s|%s|%s|%s\\n\", $2, $11, $3, $4}'");
    out.trim()
        .lines()
        .filter_map(|line| {
            let p: Vec<&str> = line.splitn(4, '|').collect();
            if p.len() >= 4 {
                Some(ProcessItem {
                    pid: p[0].to_string(),
                    name: p[1].split('/').last().unwrap_or(p[1]).to_string(),
                    cpu: format!("{}%", p[2]),
                    mem: format!("{}%", p[3]),
                })
            } else {
                None
            }
        })
        .collect()
}

#[tauri::command]
fn kill_process(pid: String) -> CleanResult {
    let (ok, out, err) = run_shell(&format!("kill -9 {}", pid));
    CleanResult {
        category: "Process".into(),
        command_name: format!("Kill PID {}", pid),
        success: ok,
        output: out,
        error: err,
    }
}

// ============================================================
// PORT CHECKER
// ============================================================

#[derive(Serialize, Deserialize, Clone)]
pub struct PortItem {
    pub port: String,
    pub pid: String,
    pub process: String,
    pub protocol: String,
}

#[tauri::command]
fn get_listening_ports() -> Vec<PortItem> {
    let (_, out, _) = run_shell("lsof -iTCP -sTCP:LISTEN -nP 2>/dev/null | awk 'NR>1 {printf \"%s|%s|%s|%s\\n\", $9, $2, $1, $8}' | head -20");
    out.trim()
        .lines()
        .filter_map(|line| {
            let p: Vec<&str> = line.splitn(4, '|').collect();
            if p.len() >= 4 {
                let port = p[0].rsplit(':').next().unwrap_or("?").to_string();
                Some(PortItem {
                    port,
                    pid: p[1].to_string(),
                    process: p[2].to_string(),
                    protocol: p[3].to_string(),
                })
            } else {
                None
            }
        })
        .collect()
}

// ============================================================
// MAIN APP ENTRY
// ============================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scan_system,
            get_system_stats,
            get_disk_breakdown,
            get_system_info,
            get_network_info,
            get_top_processes,
            kill_process,
            get_listening_ports,
            clean_user_cache,
            clean_system_logs,
            clean_quicklook_cache,
            clean_dns_cache,
            clean_xcode_derived,
            clean_homebrew,
            clean_pip_cache,
            clean_cocoapods_cache,
            clean_gradle_maven,
            clean_browser_cache,
            clean_crash_reports,
            clean_saved_state,
            clean_trash,
            purge_ram,
            rebuild_spotlight,
            translate_text,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
