use super::fs_ops;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};
use walkdir::WalkDir;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectRecommendation {
    pub name: String,
    pub path: String,
    pub last_modified: u64,    // timestamp
    pub target_folder: String, // e.g., "node_modules"
    pub potential_savings_bytes: u64,
    pub potential_savings_display: String,
}

pub fn get_recommendations() -> Vec<ProjectRecommendation> {
    let mut recs = Vec::new();
    let home = std::env::var("HOME").unwrap_or_default();
    let search_paths = vec![
        format!("{}/Documents", home),
        format!("{}/Developer", home),
        format!("{}/Desktop", home),
    ];

    let stale_threshold_secs = 90 * 24 * 60 * 60; // 90 days
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    for start_path in search_paths {
        if !Path::new(&start_path).exists() {
            continue;
        }

        for entry in WalkDir::new(&start_path)
            .max_depth(3) // Don't go too deep to find project roots
            .into_iter()
            .filter_map(|e| e.ok())
        {
            let path = entry.path();
            if !path.is_dir() {
                continue;
            }

            // Identify project types
            let mut target_subfolder = None;
            let mut marker_file = None;

            if path.join("package.json").exists() {
                target_subfolder = Some("node_modules");
                marker_file = Some("package.json");
            } else if path.join("Cargo.toml").exists() {
                target_subfolder = Some("target");
                marker_file = Some("Cargo.toml");
            } else if path.join("go.mod").exists() {
                // Go doesn't usually have a local heavy folder like node_modules in the same way,
                // but let's stick to the most common ones.
            }

            if let (Some(sub), Some(marker)) = (target_subfolder, marker_file) {
                let marker_path = path.join(marker);
                let metadata = std::fs::metadata(&marker_path);

                if let Ok(meta) = metadata {
                    if let Ok(modified) = meta.modified() {
                        let mod_ts = modified
                            .duration_since(UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_secs();

                        if now - mod_ts > stale_threshold_secs {
                            // Project is stale! Check if the target subfolder exists and its size
                            let target_path = path.join(sub);
                            if target_path.exists() {
                                let size = fs_ops::get_dir_size_native(&target_path).unwrap_or(0);
                                if size > 50 * 1024 * 1024 {
                                    // Only recommend if > 50MB
                                    recs.push(ProjectRecommendation {
                                        name: path
                                            .file_name()
                                            .and_then(|n| n.to_str())
                                            .unwrap_or("Unknown")
                                            .to_string(),
                                        path: path.to_string_lossy().to_string(),
                                        last_modified: mod_ts,
                                        target_folder: sub.to_string(),
                                        potential_savings_bytes: size,
                                        potential_savings_display: format_size(size),
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    recs
}

fn format_size(bytes: u64) -> String {
    if bytes < 1024 {
        format!("{} B", bytes)
    } else if bytes < 1024 * 1024 {
        format!("{:.1} KB", bytes as f64 / 1024.0)
    } else if bytes < 1024 * 1024 * 1024 {
        format!("{:.1} MB", bytes as f64 / (1024.0 * 1024.0))
    } else {
        format!("{:.1} GB", bytes as f64 / (1024.0 * 1024.0 * 1024.0))
    }
}
