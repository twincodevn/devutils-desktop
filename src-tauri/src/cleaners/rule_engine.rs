use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CleanupRule {
    pub id: String,
    pub name: String,
    pub category: String,
    pub risk: String,
    pub paths: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RuleCollection {
    pub rules: Vec<CleanupRule>,
}

pub fn get_rules() -> HashMap<String, CleanupRule> {
    let json_data = include_str!("rules.json");
    let collection: RuleCollection =
        serde_json::from_str(json_data).unwrap_or(RuleCollection { rules: vec![] });

    let mut map = HashMap::new();
    for rule in collection.rules {
        map.insert(rule.id.clone(), rule);
    }
    map
}

pub fn resolve_path(path: &str) -> String {
    if path.starts_with("~/") {
        let home = std::env::var("HOME").unwrap_or_default();
        return path.replacen("~/", &format!("{}/", home), 1);
    }
    path.to_string()
}
