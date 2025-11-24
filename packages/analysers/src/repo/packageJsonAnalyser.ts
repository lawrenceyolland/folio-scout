import * as fs from "node:fs";
import { HTTPException } from "hono/http-exception";

type PackageJson = {
    name?: string;
    version?: string;
    license?: string;
    type?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;

    [key: string]: unknown;
};

type PackageJsonFields = keyof PackageJson

type ScriptFields = "start" |
    "build" |
    "test" |
    "dev"

type DependencyCheck =
    "hasDependencies" |
    "hasDevDependencies" |
    "hasPeerDependencies";

type ScriptCheck =
    "hasScripts" |
    "hasScriptStart" |
    "hasScriptDev" |
    "hasScriptBuild" |
    "hasScriptTest"

type MetaCheck = "hasName" |
    "hasVersion" |
    "hasLicense" |
    "hasType" |
    "hasTypeModule"

class PackageJsonAnalyser {
    private pkg: PackageJson | null = null;

    constructor(private jobPath: string) {
        this.load();
    }

    load = (): any | null => {
        const pkgPath = `${this.jobPath}/package.json`;

        if (!fs.existsSync(pkgPath)) {
            this.pkg = null;
            return null
        }

        try {
            const rawFile = fs.readFileSync(pkgPath, "utf8")
            this.pkg = JSON.parse(rawFile) as PackageJson;
        } catch (e) {
            this.pkg = null;
            console.error('failed to read package json');
            throw new HTTPException(404);
        }
    }

    hasField = (field: PackageJsonFields): boolean => {
        return !!this.pkg && Object.hasOwn(this.pkg, field);
    }

    hasScript = (field: ScriptFields): boolean => {
        return !!this.pkg?.scripts && Object.hasOwn(this.pkg?.scripts, field);
    }

    checkDependencies= (): Record<DependencyCheck, boolean | null> => {
        return {
            hasDependencies: this.hasField("dependencies"),
            hasDevDependencies: this.hasField("devDependencies"),
            hasPeerDependencies: this.hasField("peerDependencies"),
        } as (Record<DependencyCheck, boolean | null>);
    }

    checkScripts = (): Record<ScriptCheck, boolean | null> => {
        const scriptFieldMap : Record<ScriptFields, ScriptCheck> = {
            start: "hasScriptStart",
            dev: "hasScriptDev",
            build: "hasScriptBuild",
            test: "hasScriptTest",
        };

        const scriptFields = Object.keys(scriptFieldMap) as ScriptFields[];
        const hasScripts = this.hasField("scripts");
        const scriptsResult = { hasScripts: hasScripts } as Record<ScriptCheck, boolean | null>;

        if (hasScripts) {
            for (const field of scriptFields) {
                const fieldName: ScriptCheck = scriptFieldMap[field];
                scriptsResult[fieldName] = hasScripts ? this.hasScript(field) : null;
            }
        }

        return scriptsResult;
    }

    checkMeta = (): Record<MetaCheck, boolean | null> => {
        const hasType = this.hasField("type");

        return {
            hasName: this.hasField("name"),
            hasVersion: this.hasField("version"),
            hasLicense: this.hasField("license"),
            hasType: hasType,
            hasTypeModule: hasType ? this.pkg?.type === 'module' : null
        } as (Record<MetaCheck, boolean | null>);
    }

    runPackageJsonChecks = () => {
        if (!this.pkg) {
            return null;
        }
        const dependencyResult = this.checkDependencies();
        const scriptsResult = this.checkScripts();
        const metaResult = this.checkMeta();

        return {
            dependencies: dependencyResult,
            scripts: scriptsResult,
            meta: metaResult,
        }
    }
}

export default PackageJsonAnalyser