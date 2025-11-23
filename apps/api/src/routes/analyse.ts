import {Hono} from "hono";
import { HTTPException } from 'hono/http-exception'
import { requestId } from 'hono/request-id'
import * as fs from "node:fs";
import { simpleGit } from 'simple-git';
import EasyRepoChecks from "../../../../packages/analysers/src/repo/repoRootAnalyser.js";
import RepoRootAnalyser from "../../../../packages/analysers/src/repo/repoRootAnalyser.js";
import PackageJsonAnalyser from "../../../../packages/analysers/src/repo/packageJsonAnalyser.js";
import packageJsonAnalyser from "../../../../packages/analysers/src/repo/packageJsonAnalyser.js";
import RepoMetrics from "../../../../packages/analysers/src/repo/repoMetrics.js";

const router = new Hono();

const BASE_PATH = '/tmp/folio-scout'

const TESTING_FILE_PATH = 'job_ab8de250-23f1-4238-82e3-f2f480c371d9'

router.post("", async (c) => {
    const body = await c.req.json()

    if (!body?.repoUrl) {
      throw new HTTPException(500)
    }

    const jobId = TESTING_FILE_PATH ||  `job_${c.get("requestId")}`
    let files = []
    try {
        const jobPath = `${BASE_PATH}/jobs/${jobId}`

        if (!fs.existsSync(jobPath)) {
            fs.mkdirSync(jobPath, { recursive: true })
        }

        // TODO: if no repo supplied reject request
        // clone repo into jobs/{job_id}
        // await simpleGit().clone(body.repoUrl, jobPath)

        // 1. easy root level checks
        const easyRepoChecks = new RepoRootAnalyser(jobPath);
        const easyChecksResult = easyRepoChecks.runRepoChecks() || {};

        // 2. package.json analysis
        const packageJsonChecks = new PackageJsonAnalyser(jobPath);
        const packageJsonResult = packageJsonChecks.runPackageJsonChecks() || {};

        // 4. repo metrics (counts, sizes, depth)
        const repoMetrics = await RepoMetrics.init(jobPath);
        const filesInRepo = repoMetrics.getFileTypes() || {};
        const numFiles = repoMetrics.getNumTotalFiles()
        const numCodeFiles = repoMetrics.getNumCodeFiles()
        const maxDepth = repoMetrics.getMaxDepth();
        const linesPerCodeFile = await repoMetrics.getLinesPerCodeFile()
        const linePerFileType = RepoMetrics.getLinesPerFileType(linesPerCodeFile || {});
        const avgPerFileType = RepoMetrics.getAvgPerFileType(linesPerCodeFile || {}, filesInRepo || {})
        // 4. deeper file discovery (nested)

        !TESTING_FILE_PATH && fs.writeFileSync(`${jobPath}/easy-check.json`, JSON.stringify(easyChecksResult));

        return c.json({
            success: true,
            data: {
                easyChecksResult,
                packageJsonResult,
                files: {
                    maxDepth: maxDepth,
                    numFiles: numFiles,
                    numCodeFiles: numCodeFiles,
                    types: filesInRepo,
                    codeLines: linesPerCodeFile,
                    typeLines: linePerFileType,
                    avgPerFileType,
                },
            }
        })
    } catch (e) {
        console.error("FS ERROR:", e);
        throw new HTTPException(500);
    }
})

export default router