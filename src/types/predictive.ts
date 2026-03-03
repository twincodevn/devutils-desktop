export interface ProjectRecommendation {
    name: string;
    path: string;
    last_modified: number;
    target_folder: string;
    potential_savings_bytes: number;
    potential_savings_display: string;
}
