

// totalFiles	total number of files in repo
// totalCodeFiles	files that contain code (approx by extension)
// totalLines	sum of all lines in code files
// avgLinesPerFile	totalLines / code file count
//
// These reflect project weight, complexity, and scope.
//
//     Extraction approach:
//
//     Recursively walk directory tree
//
// Filter out noise directories (node_modules, dist, .git)
//
// Count .js, .ts, .tsx, .jsx, .css, .html, etc.

import { readdirSync, statSync } from "node:fs";
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

    constructor(private jobPath: string) {
    }

     static create = async (jobPath: string) => {
        const analyzer = new RepoMetrics(jobPath);
        analyzer.files = await analyzer.readFiles(jobPath);
        return analyzer;
    }

    readFiles = async (dir: string, filelist: string[] = [], base: string = dir) => {
        const entries= await fsp.readdir(dir);

        for (const file of entries) {
            const full = path.join(dir, file);
            const stat = await fsp.stat(full);
            console.log({full, stat})

            if (stat.isDirectory()) {
                if (this.fileTypesToIgnore.has(file)) {
                    continue;
                }
                await this.readFiles(full, filelist, base);
            } else {

                filelist.push(path.relative(base, full));
            }
        }

        return filelist;
    };


    // readFiles = async (jobPath: string) => {
    //     this.files = await fsp.readdir(this.jobPath, { recursive: true })
    // }

    getFiles = () => {
        return this.files;
    }

    getFileTypes = (): Record<string, number> | null => {
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
}

export default RepoMetrics;