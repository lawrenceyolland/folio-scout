// packages/analyzers/src/types.ts

export type AnalysisKind = "repo" | "design";

export interface RepoAnalysisMetrics {
    structureScore: number;  // 0–100
    readabilityScore: number;
    testingScore: number;
    docsScore: number;
}

export interface DesignAnalysisMetrics {
    layoutScore: number;
    accessibilityScore: number;
    consistencyScore: number;
    visualPolishScore: number;
}

export interface RepoAnalysisResult {
    jobId: string;
    kind: "repo";
    metrics: RepoAnalysisMetrics;
    notes: string[];
}

export interface DesignAnalysisResult {
    jobId: string;
    kind: "design";
    metrics: DesignAnalysisMetrics;
    notes: string[];
}

export type AnyAnalysisResult = RepoAnalysisResult | DesignAnalysisResult;
