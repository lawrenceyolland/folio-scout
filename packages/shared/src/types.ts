export interface AnalyzeRequest {
    repoUrl: string;
    siteUrl: string;
}

export interface JobStatus {
    id: string;
    status: "queued" | "running" | "completed" | "failed";
    createdAt: number;
    updatedAt: number;
}

export interface AnalysisResult {
    jobId: string;
    repoScore: number | null;
    designScore: number | null;
    feedback: string[];
}
