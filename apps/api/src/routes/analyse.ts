import {Hono} from "hono";
import { HTTPException } from 'hono/http-exception'
import { requestId } from 'hono/request-id'
import * as fs from "node:fs";
import { simpleGit } from 'simple-git';
import EasyRepoChecks from "../../../../packages/analysers/src/repo/easyChecks.js";

const router = new Hono();

const BASE_PATH = '/tmp/folio-scout'

router.post("", async (c) => {
    const body = await c.req.json()

    if (!body?.repoUrl) {
      throw new HTTPException(500)
    }

    const jobId = `job_${c.get("requestId")}`
    let files = []
    try {
        const jobPath = `${BASE_PATH}/job/${jobId}`

        if (!fs.existsSync(jobPath)) {
            fs.mkdirSync(jobPath, {recursive: true})
        }

        await simpleGit().clone(body.repoUrl, jobPath)

        const easyRepoChecks = new EasyRepoChecks(jobPath);

        const easyChecksResult = {
            hasPackageJson: easyRepoChecks.hasPackageJson(),
            hasRootSrc: easyRepoChecks.hasRootSrc(),
            hasReadMe: easyRepoChecks.hasReadMe(),
            hasGitIgnore: easyRepoChecks.hasGitIgnore()
        }

        fs.writeFileSync(`${jobPath}/easy-check.json`, JSON.stringify(easyChecksResult))

        return c.json({
            success: true,
            data: {
                easyChecksResult
            }
        })

    } catch (e) {
        console.error("FS ERROR:", e)
        throw new HTTPException(500)
    }
})

export default router