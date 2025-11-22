// TODO:
// Does the repo have a root-level src/?
// Does it contain package.json?
// Is there a README?
// Is there a .gitignore?
// Is there a public/ folder?

//  fs.existsSync() / readdir() recursive listing


import * as fs from "node:fs";
const BASE_PATH = '/tmp/folio-scout'

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

    hasNodeModules = (): boolean => {
        return this.files.includes("node_modules");
    }

    hasWebPack = (): boolean => {
        return this.files.includes("webpack");
    }

    hasTypeScript = (): boolean => {
        return this.files.includes("tsconfig");
    }

    hasVite = (): boolean => {
        return this.files.includes("vite");
    }
    hasNpm = (): boolean => {
        return this.files.includes("package-lock.json")
    }

    hasYarn = (): boolean => {
        return this.files.includes("yarn.lock");
    }

    hasYarnAndNpm = (): boolean => {
        return this.hasYarn() && this.hasNpm()
    }


    runRepoChecks = () => {
        const methods : CheckMethods[] = [
            "hasPackageJson",
            "hasReadMe",
            "hasRootSrc",
            "hasGitIgnore",
            "hasNodeModules",
            "hasWebPack",
            "hasYarn",
            "hasNpm",
            "hasYarnAndNpm",
            "hasTypeScript",
            "hasVite"
        ]

        const result: Record<CheckMethods, boolean | null> = {
            hasPackageJson: null,
            hasReadMe: null,
            hasRootSrc: null,
            hasGitIgnore: null,
            hasNodeModules: null,
            hasWebPack: null,
            hasTypeScript: null,
            hasVite: null,
            hasNpm: null,
            hasYarn: null,
            hasYarnAndNpm: null,
        };

        for (const method  of methods) {
            result[method] = this[method]();
        }

        return result
    }
}

export default RepoRootAnalyser
