import { Category } from "../types";

export const categories: Category[] = [
    {
        page: "system-junk", icon: "🗑️", iconBg: "rgba(124,58,237,0.12)", title: "System Junk", subtitle: "Cache, logs, temp files, DNS",
        items: [
            { id: "uc", name: "User Cache", desc: "~/Library/Caches — app cache tích lũy", command: "clean_user_cache", risk: "safe" },
            { id: "sl", name: "System Logs", desc: "Log files & diagnostic data", command: "clean_system_logs", risk: "safe" },
            { id: "ql", name: "QuickLook Thumbnails", desc: "Preview cache thumbnails", command: "clean_quicklook_cache", risk: "safe" },
            { id: "dc", name: "DNS Cache", desc: "Flush DNS resolver", command: "clean_dns_cache", risk: "safe" },
        ],
    },
    {
        page: "developer", icon: "🛠️", iconBg: "rgba(56,189,248,0.12)", title: "Developer", subtitle: "Xcode, Homebrew, pip, CocoaPods, Gradle",
        items: [
            { id: "xd", name: "Xcode Derived Data", desc: "Build artifacts, archives & device logs", command: "clean_xcode_derived", risk: "safe" },
            { id: "hb", name: "Homebrew Cache", desc: "Old formula versions & downloads", command: "clean_homebrew", risk: "safe" },
            { id: "pp", name: "pip Cache", desc: "Python package download cache", command: "clean_pip_cache", risk: "safe" },
            { id: "cp", name: "CocoaPods Cache", desc: "iOS/macOS pod dependencies", command: "clean_cocoapods_cache", risk: "safe" },
            { id: "gm", name: "Gradle & Maven", desc: "Java/Android build cache", command: "clean_gradle_maven", risk: "moderate" },
        ],
    },
    {
        page: "browser", icon: "🌐", iconBg: "rgba(244,114,182,0.12)", title: "Browsers", subtitle: "Safari, Chrome, Firefox, Edge, Brave",
        items: [
            { id: "bc", name: "All Browser Caches", desc: "Safari + Chrome + Firefox + Edge + Brave", command: "clean_browser_cache", risk: "moderate" },
        ],
    },
    {
        page: "app-leftovers", icon: "📦", iconBg: "rgba(0,210,160,0.12)", title: "App Leftovers", subtitle: "Crash reports, saved state, trash",
        items: [
            { id: "cr", name: "Crash Reports", desc: "Diagnostic & crash report files", command: "clean_crash_reports", risk: "safe" },
            { id: "ss", name: "Saved App State", desc: "Window restore & tab data", command: "clean_saved_state", risk: "safe" },
            { id: "tr", name: "Empty Trash", desc: "Xóa vĩnh viễn file trong thùng rác", command: "clean_trash", risk: "caution" },
        ],
    },
    {
        page: "optimize", icon: "⚡", iconBg: "rgba(251,191,36,0.12)", title: "Optimization", subtitle: "RAM, Spotlight, performance tuning",
        items: [
            { id: "pr", name: "Purge RAM", desc: "Giải phóng inactive memory", command: "purge_ram", risk: "safe" },
            { id: "sp", name: "Rebuild Spotlight", desc: "Xây dựng lại search index", command: "rebuild_spotlight", risk: "safe" },
        ],
    },
];
