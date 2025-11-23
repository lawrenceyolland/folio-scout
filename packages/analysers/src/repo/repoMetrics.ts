import fsp from "node:fs/promises";
import path from "node:path";

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
    private maxDepth = 0
    private fileTypes: Record<string, number> | null = {};

    constructor(private jobPath: string) {}

     static init = async (jobPath: string) => {
        const analyzer = new RepoMetrics(jobPath);
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
                linesPerCodeFile[filePath] = 0;
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

                linesPerCodeFile[filePath] = lines;
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

    static getAvgPerFileType = (codeFileLines: Record<string, number>, filesInRepo: Record<string, number>): Record<string, number> => {
        const avgPerFileType: Record<string, number> = {}

        for (const [filePath, count] of Object.entries(codeFileLines)) {
            const parsedFile = path.parse(filePath);
            avgPerFileType[parsedFile.ext] = count / filesInRepo[parsedFile.ext]
        }

        return avgPerFileType;
    }

    static getMedianPerFileType = (codeFileLines: Record<string, number>, filesInRepo: Record<string, number>): Record<string, number> => {
        const reshapedFileTypeCounts : Record<string, number[]> = {}


        for (const [filePath, count] of Object.entries(codeFileLines)) {
            const parsedFile = path.parse(filePath);
            if (!reshapedFileTypeCounts[parsedFile.ext]) {
                reshapedFileTypeCounts[parsedFile.ext] = [];
            }
            reshapedFileTypeCounts[parsedFile.ext].push(count);
        }

        const medianPerFileType: Record<string, number> = {}

        for (const [ext, count] of Object.entries(reshapedFileTypeCounts)) {
            const sortedCounts = count.sort((a,b) => a-b);

            // const mid = ....

            if (sortedCounts.length % 2 === 0) {
            // TODO: finish this method
            //
            } else {
            // ...
            }
        }

        return medianPerFileType;
    }
}


export default RepoMetrics;