import { z } from "zod";

export const analyzeSchema = z.object({
    repoUrl: z.string().url(),
    siteUrl: z.string().url().optional(),
});

export type AnalyzeSchema = z.infer<typeof analyzeSchema>;
