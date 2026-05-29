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
import FrameworkAnalyser from "../../../../packages/analysers/src/repo/frameworkAnalyser.js";
import * as child_process from "node:child_process";
import {exec, spawn} from "node:child_process";
import {promisify} from "node:util";
import path from "node:path"

const router = new Hono();

const BASE_PATH = '/tmp/folio-scout'

// TODO: use new repo job here
const TESTING_FILE_PATH = ''
    // 'job_f72303da-2df1-4674-84cc-6ed566745851'

const execAsync = promisify(exec)


router.post("", async (c) => {
    const body = await c.req.json()

    if (!body?.repoUrl) {
      throw new HTTPException(500)
    }

    const jobId = TESTING_FILE_PATH || `job_${c.get("requestId")}`
    let files = []
    try {
        const jobPath = `${BASE_PATH}/jobs/${jobId}`

        if (!fs.existsSync(jobPath)) {
            fs.mkdirSync(jobPath, { recursive: true })
        }

        // TODO: if no repo supplied reject request
        // clone repo into jobs/{job_id}
        await simpleGit().clone(body.repoUrl, jobPath)

        const jarPath = path.resolve(process.cwd(), '../../packages/analysers/JavaRepoAnalyser/target/JavaRepoAnalyser-1.0-jar-with-dependencies.jar')
        console.log('jarPath: ', jarPath)

        const filePath = "/tmp/folio-scout/jobs/job_ec5844da-1d4a-4167-812d-8d8935d00d81";

        const command = `java -jar ${jarPath} ${filePath}`
        const {stdout, stderr} = await execAsync(command);

        // TODO: if stderr throw or return error response here
        if (stderr) {
            throw new Error(`Error ${stderr}` )
        }

        const easyChecksResult = JSON.parse(stdout);
        console.log('repo root analysis Java: ', easyChecksResult)

        // 1. easy root level checks
        // const easyRepoChecks = new RepoRootAnalyser(jobPath);
        // const easyChecksResult = easyRepoChecks.runRepoChecks() || {};
        // console.log('repo root analysis JS: ', easyChecksResult)

        // 2. package.json analysis
        const packageJsonChecks = new PackageJsonAnalyser(jobPath);
        const pkg = packageJsonChecks.getPackageJson();
        const packageJsonResult = packageJsonChecks.runPackageJsonChecks() || {};

        // 3. get the framework used in the repo
        const projectAnalysis = new FrameworkAnalyser(pkg);
        const frameworkSignals = projectAnalysis.hasFramework()
        const estimatedFramework = projectAnalysis.estimateFramework();

        let frameworkVersion = null;
        let metaFrameworkVersion = null;
        if (estimatedFramework.frameworkCandidate) {
            frameworkVersion = projectAnalysis.getFrameworkVersion();
        }

        if (estimatedFramework.metaFrameworkCandidate) {
            metaFrameworkVersion = projectAnalysis.getMetaFrameworkVersion();
        }

        // 4. repo metrics (counts, sizes, depth)
        const repoMetrics = await RepoMetrics.init(jobPath, pkg);
        const filesInRepo = repoMetrics.getFileTypes() || {};
        const numFiles = repoMetrics.getNumTotalFiles()
        const numCodeFiles = repoMetrics.getNumCodeFiles()
        const maxDepth = repoMetrics.getMaxDepth();
        const linesPerCodeFile = await repoMetrics.getLinesPerCodeFile()
        const linePerFileType = RepoMetrics.getLinesPerFileType(linesPerCodeFile || {});
        const avgPerFileType = RepoMetrics.getAvgLinesPerFileType(linesPerCodeFile || {}, filesInRepo || {})
        const medianPerFileType = RepoMetrics.getMedianLinesPerFileType(linesPerCodeFile || {}, filesInRepo || {})

        //TODO: if no src then dont do the below!
        let srcStructure: Record<string, boolean> | null = null;

        if (easyChecksResult.hasRootSrc) {
            srcStructure = repoMetrics.checkStructure();
        }

        // 4. deeper file discovery (nested)
        // TODO: given the framework (and version) are there any structural outliers - app router vs pages/


        const data = {
            easyChecksResult,
            packageJsonResult,
            srcStructure,
            files: {
                maxDepth: maxDepth,
                numFiles: numFiles,
                numCodeFiles: numCodeFiles,
                types: filesInRepo,
                codeLines: linesPerCodeFile,
                typeLines: linePerFileType,
                avgPerFileType,
                medianPerFileType,
                frameworks: {
                    signals: frameworkSignals,
                    estimatedFramework,
                    frameworkVersion,
                    metaFrameworkVersion,
                }
            },
        }

        // !TESTING_FILE_PATH &&
        // fs.writeFileSync(`${jobPath}/easy-check.json`, JSON.stringify(data));

        return c.json({ success: true, data})
    } catch (e) {
        console.error("FS ERROR:", e);
        throw new HTTPException(500);
    }
})

export default router