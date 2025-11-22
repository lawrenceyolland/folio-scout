// TODO:
// Does the repo have a root-level src/?
// Does it contain package.json?
// Is there a README?
// Is there a .gitignore?
// Is there a public/ folder?

//  fs.existsSync() / readdir() recursive listing


import * as fs from "node:fs";
const BASE_PATH = '/tmp/folio-scout'

type RootFiles = "package.json" |
    "README.md" |
    "src" |
    ".gitignore" |
    "node_modules" |
    "webpack" |
    "tsconfig" |
    "vite" |
    "package-lock.json" |
    "yarn.lock"


type CheckMethods =
    "hasPackageJson" |
    "hasReadMe" |
    "hasRootSrc" |
    "hasGitIgnore" |
    "hasNodeModules" |
    "hasWebPack" |
    "hasTypeScript" |
    "hasVite" |
    "hasYarn" |
    "hasNpm" |
    "hasYarnAndNpm"

class RepoRootAnalyser {
    private files: string[];

    constructor(private jobPath: string) {
        this.files = fs.readdirSync(jobPath);
    }

    hasFile = (file: string): boolean => {
        return this.files.includes(file);
    }

    runRepoChecks = (): Record<CheckMethods, boolean> => {

        const rootFilesMap : Record<RootFiles, CheckMethods> = {
            "package.json": "hasPackageJson",
            "README.md": "hasReadMe",
            src: "hasRootSrc",
            ".gitignore": "hasGitIgnore",
            node_modules: "hasNodeModules",
            webpack: "hasWebPack",
            "yarn.lock": "hasYarn",
            "package-lock.json": "hasNpm",
            tsconfig: "hasTypeScript",
            vite: "hasVite"
        }

        const rootFilesResult = {} as Record<CheckMethods, boolean>
        const rootFileFields = Object.keys(rootFilesMap) as RootFiles[];
        for (const file of rootFileFields) {
            const fieldName: CheckMethods = rootFilesMap[file];
            rootFilesResult[fieldName] = this.hasFile(file);
        }

        rootFilesResult.hasYarnAndNpm = rootFilesResult.hasYarn && rootFilesResult.hasNpm

        return rootFilesResult
    }
}

export default RepoRootAnalyser
