pub mod fs_ops;
pub mod predictive;
pub mod rule_engine;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct CleanResult {
    pub category: String,
    pub command_name: String,
    pub success: bool,
    pub output: String,
    pub error: String,
}

pub fn execute_rule(rule_id: &str) -> CleanResult {
    let rules = rule_engine::get_rules();
    if let Some(rule) = rules.get(rule_id) {
        let mut errors = Vec::new();
        let mut success = true;

        for p in &rule.paths {
            let resolved = rule_engine::resolve_path(p);
            if let Err(e) = fs_ops::safe_remove_dir_contents(&resolved) {
                success = false;
                errors.push(e);
            }
        }

        CleanResult {
            category: rule.category.clone(),
            command_name: rule.name.clone(),
            success,
            output: if success {
                format!("Đã dọn dẹp {}, giải phóng dung lượng.", rule.name)
            } else {
                "".to_string()
            },
            error: errors.join(" | "),
        }
    } else {
        CleanResult {
            category: "Unknown".into(),
            command_name: rule_id.to_string(),
            success: false,
            output: "".into(),
            error: format!("Rule {} not found in engine", rule_id),
        }
    }
}
