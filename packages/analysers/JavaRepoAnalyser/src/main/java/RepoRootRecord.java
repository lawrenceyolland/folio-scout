// TODO: currently returns boolean, will switch this to a more instructive object like:
// boolean present | int (1-10) severity
public record RepoRootRecord(
        boolean hasPackageJson,
        boolean hasReadMe,
        boolean hasRootSrc,
        boolean hasGitIgnore,
        boolean hasNodeModules,
        boolean hasYarn,
        boolean hasNpm,
        boolean hasPNPM,
        boolean hasMultipleLockFiles,
        boolean hasEsLint,
        boolean hasPrettier,
        boolean hasTypeScript,
        boolean hasAstro,
        boolean hasNext,
        boolean hasVite,
        boolean hasWebPack,
        boolean hasEnv,
        boolean hasLockFile
){};
