import * as fs from "node:fs";
const BASE_PATH = '/tmp/folio-scout'

type RootFiles = "package.json" |
    "README.md" |
    "src" |
    ".gitignore" |
    "node_modules" |
    "webpack.config.js" |
    "tsconfig.json" |
    "vite.config.js" |
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
    "hasYarnAndNpm" |
    "hasEsLint" |
    "hasPrettier"

class RepoRootAnalyser {
    private files: string[];

    constructor(private jobPath: string) {
        this.files = fs.readdirSync(jobPath);
    }

    hasFile = (file: string): boolean => {
        console.log(this.files)
        return this.files.includes(file);
    }

    private hasConfigFile(prefix: string): boolean {
        // TODO: example the file extensions yaml, json, etc etc
        const config_extensions = [".js", ".ts", ".cjs", ".mjs"]
        return config_extensions.some(ext =>
            this.files.includes(`${prefix}${ext}`)
        );
    }

    private hasAnyConfig(prefixes: string[]): boolean {
        return prefixes.some((prefix) => this.hasConfigFile(prefix) || this.hasFile(prefix));
    }

    runRepoChecks = (): Record<CheckMethods, boolean> => {
        return {
            hasPackageJson: this.hasFile("package.json"),
            hasReadMe: this.hasFile("README.md"),
            hasRootSrc: this.hasFile("src"),
            hasGitIgnore: this.hasFile(".gitignore"),
            hasNodeModules: this.hasFile("node_modules"),

            // config-family detection
            hasVite: this.hasConfigFile("vite.config"),
            hasWebPack: this.hasConfigFile("webpack.config"),
            hasEsLint: this.hasAnyConfig([
                "eslint.config",
                ".eslintrc"]),
            hasPrettier: this.hasConfigFile(".prettierrc"),
            hasTypeScript: this.hasConfigFile("tsconfig"),

            hasYarn: this.hasFile("yarn.lock"),
            hasNpm: this.hasFile("package-lock.json"),
            hasYarnAndNpm: this.hasFile("yarn.lock") && this.hasFile("package-lock.json"),
        };
    }
}

export default RepoRootAnalyser