use std::fs;
use std::path::Path;
use walkdir::WalkDir;

/// Extracted safe filesystem operations to replace dangerous `rm -rf` shell executions.
pub fn safe_remove_dir_all<P: AsRef<Path>>(path: P) -> Result<(), String> {
    let path = path.as_ref();
    if !path.exists() {
        return Ok(());
    }

    // Safety check: Never allow deleting root or home dir entirely
    let path_str = path.to_string_lossy();
    if path_str == "/"
        || path_str == "/Users"
        || path_str == std::env::var("HOME").unwrap_or_default()
    {
        return Err(
            "Unsafe deletion prevented by strictly blocking root/home directory targeting."
                .to_string(),
        );
    }

    match fs::remove_dir_all(path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete {:?}: {}", path, e)),
    }
}

pub fn safe_remove_dir_contents<P: AsRef<Path>>(path: P) -> Result<(), String> {
    let path = path.as_ref();
    if !path.exists() {
        return Ok(());
    }

    let mut errors = Vec::new();
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries.flatten() {
            let entry: fs::DirEntry = entry;
            let p = entry.path();
            if p.is_dir() {
                if let Err(e) = safe_remove_dir_all(&p) {
                    errors.push(e);
                }
            } else {
                if let Err(e) = fs::remove_file(&p) {
                    errors.push(format!("Failed to delete file {:?}: {}", p, e));
                }
            }
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors.join(" | "))
    }
}
pub fn get_dir_size_native<P: AsRef<Path>>(path: P) -> Result<u64, String> {
    let mut total: u64 = 0;
    for entry in WalkDir::new(path).into_iter().filter_map(|e| e.ok()) {
        if let Ok(meta) = entry.metadata() {
            if meta.is_file() {
                total += meta.len();
            }
        }
    }
    Ok(total)
}
