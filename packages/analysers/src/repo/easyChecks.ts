// TODO:
// Does the repo have a root-level src/?
// Does it contain package.json?
// Is there a README?
// Is there a .gitignore?
// Is there a public/ folder?

//  fs.existsSync() / readdir() recursive listing


import * as fs from "node:fs";
const BASE_PATH = '/tmp/folio-scout'

class EasyRepoChecks {
    private files: string[];

    constructor(private jobPath: string) {
        this.files = fs.readdirSync(jobPath);
    }

    hasPackageJson = (): boolean => {
        return this.files.includes("package.json");
    }

    hasReadMe = (): boolean => {
        return this.files.includes("README.md");
    }

    hasRootSrc = (): boolean => {
        return this.files.includes("src");
    }

    hasGitIgnore = (): boolean => {
        return this.files.includes(".gitignore");
    }
}

export default EasyRepoChecks
