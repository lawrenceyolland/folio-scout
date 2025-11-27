import fsp from "node:fs/promises";
import path from "node:path";
import * as fs from "node:fs";
import {PackageJson} from "./packageJsonAnalyser";

type Frameworks = 'React' | 'Vue' | 'Angular' | 'Next' | 'Nuxt' | 'Nest' | 'Astro'

class RepoMetrics {
    private files: string[] | null = [];
    private fileTypesToIgnore = new Set([
        "node_modules",
        ".git",
        "dist",
        "build"
    ])
    private codeFileTypes = new Set([
        ".html",
        ".css",
        ".scss",
        ".ts",
        ".tsx",
        ".js",
        ".jsx"
    ])
    private srcDirs = [
        "components",
        "hooks",
        "utils",
        "helpers",
        "services",
        "api",
        "context",
        "store",
        "styles",
        "assets",
        "pages",
        "routes",
        "constants",
        "config",
        "lib",
        "tests",
        "__tests__",
        "public",
        "types",
    ]

    private maxDepth = 0
    private fileTypes: Record<string, number> | null = {};

    constructor(private jobPath: string, private pkg: PackageJson) {}

     static init = async (jobPath: string, pkg: PackageJson) => {
        const analyzer = new RepoMetrics(jobPath, pkg);
        analyzer.files = await analyzer.readFiles(jobPath, 0);
        analyzer.fileTypes = analyzer.collectFileTypes();

        return analyzer;
    }

    readFiles = async (dir: string, depth: number, filelist: string[] = [], base: string = dir) => {
        const entries= await fsp.readdir(dir);

        if (depth > this.maxDepth) {
            this.maxDepth = depth;
        }

        for (const file of entries) {
            const full = path.join(dir, file);
            const stat = await fsp.stat(full);

            if (stat.isDirectory()) {
                if (this.fileTypesToIgnore.has(file)) {
                    continue;
                }
                // TODO: probably want a depth guard here
                await this.readFiles(full, depth + 1, filelist, base);
            } else {
                filelist.push(path.relative(base, full));
            }
        }

        return filelist;
    };

    collectFileTypes = (): Record<string, number> | null => {
        if (this.files === null) {
            return null
        }

        const fileTypes : Record<string, number> = {};

        for (const file of this.files) {
            const parsedFile = path.parse(file)
            const fileExt = parsedFile.ext.length > 0 ? parsedFile.ext : parsedFile.name;

            if (fileExt in fileTypes) {
                fileTypes[fileExt] = fileTypes[fileExt] += 1
            }  else {
                fileTypes[fileExt] = 1
            }
        }

        return fileTypes
    }

    getFiles = () => {
        return this.files;
    }

    getFileTypes = () => {
        return this.fileTypes;
    }

    getMaxDepth = () => {
        return this.maxDepth;
    }

    getNumCodeFiles = (): number => {
        if (!this.fileTypes) {
            return 0
        }

        return Object.entries(this.fileTypes)
            .filter(([key,]) => this.codeFileTypes.has(key))
            .reduce((acc, [key, val]) => acc += val, 0);
    }

    getNumTotalFiles = (): number => {
        if (!this.fileTypes) {
            return 0
        }

        return Object.values(this.fileTypes).reduce(
            (acc, curr) => acc += curr, 0);
    }

    getLinesPerCodeFile = async (): Promise<Record<string, number> | null> => {
        if (!this.files) {
            return null;
        }

        const linesPerCodeFile: Record<string, number> = {}

        for (const file of this.files) {
            const filePath = `${this.jobPath}/${file}`
            const parsedFile = path.parse(filePath)

            if (this.codeFileTypes.has(parsedFile.ext)) {
                linesPerCodeFile[file] = 0;
                const content = await fsp.readFile(filePath, "utf8");

                let lines = 0;
                for (let i = 0; i < content.length; i++) {
                    if (content.charCodeAt(i) === 10) {
                        lines++;
                    }
                }

                if (lines === 0 && content.length > 0) {
                    lines = 1;
                }

                linesPerCodeFile[file] = lines;
            }
        }

        return linesPerCodeFile;
    }

    static getLinesPerFileType = (codeFileLines: Record<string, number>): Record<string, number> => {
        const linesPerFileType: Record<string, number> = {};

        for (const [filePath, count] of Object.entries(codeFileLines)) {
            const parsedFile = path.parse(filePath);
            linesPerFileType[parsedFile.ext] = (linesPerFileType[parsedFile.ext] ?? 0) + count;
        }

        return linesPerFileType;
    }

    static reshapeFileTypeCounts = (codeFileLines: Record<string, number>):Record<string, number[]> => {
        const reshapedFileTypeCounts : Record<string, number[]> = {}

        for (const [filePath, count] of Object.entries(codeFileLines)) {
            const parsedFile = path.parse(filePath);
            if (!reshapedFileTypeCounts[parsedFile.ext]) {
                reshapedFileTypeCounts[parsedFile.ext] = [];
            }
            reshapedFileTypeCounts[parsedFile.ext].push(count);
        }

        return reshapedFileTypeCounts
    }

    static getAvgLinesPerFileType = (codeFileLines: Record<string, number>, filesInRepo: Record<string, number>): Record<string, number> => {

        const reshapedFileTypeCounts : Record<string, number[]> = this.reshapeFileTypeCounts(codeFileLines)

        const avgPerFileType: Record<string, number> = {}

        for (const [ext, count] of Object.entries(reshapedFileTypeCounts)) {
            const countsLength = count.length
            const lineSum = count.reduce((acc, curr) => acc += curr, 0)

            avgPerFileType[ext] = Math.floor(lineSum / countsLength);
        }

        return avgPerFileType;
    }

    static getMedianLinesPerFileType = (codeFileLines: Record<string, number>, filesInRepo: Record<string, number>): Record<string, number> => {
        const reshapedFileTypeCounts : Record<string, number[]> = this.reshapeFileTypeCounts(codeFileLines)
        const medianPerFileType: Record<string, number> = {}

        for (const [ext, count] of Object.entries(reshapedFileTypeCounts)) {
            const sortedCounts = count.sort((a, b) => a-b);

            const countsLength = sortedCounts.length
            const mid = Math.floor(countsLength / 2)

            if (countsLength === 2) {
                medianPerFileType[ext] = Math.floor((count[0] + count[1]) / 2);
            } else if (countsLength % 2 === 0) {
                medianPerFileType[ext] = sortedCounts[mid + 1];
            } else {
                medianPerFileType[ext] = sortedCounts[mid];
            }
        }
        return medianPerFileType;
    }

     toHasKey = (dir: string) => {
        if (dir === "__tests__") return "hasUnderscoreTests";

        return (
            "has" +
            dir
                .replace(/[^a-zA-Z0-9]/g, "")
                .replace(/^\w/, (c) => c.toUpperCase())
        );
    };


    checkStructure = (): Record<string, boolean> | null => {
        if (!this.files) {
            return null;
        }

        const src = fs.readdirSync(`${this.jobPath}/src`);
        const srcLower = src.map((name) => name.toLowerCase());

        const srcStructure: Record<string, boolean> = {}

        for (const item of this.srcDirs) {
            srcStructure[this.toHasKey(item)] = srcLower.includes(item)
        }

        return srcStructure;
    }

    hasFramework = () => {
        // check package.json, check root, check cdn
        if (!this.pkg) {
            return
        }
        //TODO: React
        //     "@types/react": "^19.1.8",
        //     "@types/react-dom": "^19.1.6",
        //      "react": "^19.1.0",
        //      "react-dom": "^19.1.0",
        // "eslint-plugin-react-hooks": "^5.2.0",
        //     "eslint-plugin-react-refresh": "^0.4.20",
        const reactSignals = ["@types/react", "@types/react-dom", "react", "react-dom"]
        //TODO: Vue
        const vueSignals = ["vue", "@vue/"];
        // TODO: Astro
        const astroSignals = ["astro"]
        const frameworkSignals : Record<Frameworks, number> = {
            React: 0,
            Vue: 0,
            Astro: 0,
            Angular: 0,
            Next: 0,
            Nuxt: 0,
            Nest: 0,
        }

        for (const key of Object.keys(this.pkg ?? {})) {
            if (key === 'dependencies' || key === 'devDependencies') {
                for (const depKey of Object.keys(this.pkg?.[key] ?? {})) {
                    if (reactSignals.some((rs) => depKey.startsWith(rs)) || depKey.includes('react')) {
                        frameworkSignals.React++
                    } else if (vueSignals.some((vs) => depKey.startsWith(vs)) || depKey.includes('vue')) {
                        frameworkSignals.Vue++
                    }
                }
            }
        }

        return frameworkSignals

    }
}

// "structure": {
//     "hasComponents": true,
//         "hasPages": false,
//         "hasUtils": true,
//         "hasHooks": false,
//         "maxDirectoryDepth": 5,
//         "largestDirectory": {
//         "path": "src/components",
//             "fileCount": 28
//     }
// }

export default RepoMetrics;