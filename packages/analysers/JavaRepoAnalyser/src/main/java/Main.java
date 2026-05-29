import com.fasterxml.jackson.databind.ObjectMapper;

public class Main {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Error: Failed to pass filepath to repo");
            System.exit(1);
        }

        String filePath = args[0];

        RepoRootAnalyser repoRootAnalyser = new RepoRootAnalyser(filePath);
        RepoRootRecord rootResult = repoRootAnalyser.analyse();

        // PackageJson pkg;
        PackageJsonRecord pkgResult = null;
        if (rootResult.hasPackageJson()) {
            PackageJsonAnalyser packageJsonAnalyser = new PackageJsonAnalyser(filePath);
            pkgResult = packageJsonAnalyser.getPkgFields();
            // pkg = packageJsonAnalyser.getPkg();
        }
        // TODO: if env file exists check contents result.hasEnv()
        ObjectMapper mapper = new ObjectMapper();

        try {
            RepoAnalysisRecord combinedAnalysis = new RepoAnalysisRecord(
                    rootResult,
                    pkgResult
            );
            String json = mapper.writeValueAsString(combinedAnalysis);
            System.out.println(json);
        } catch (Exception e) {
            System.err.println("JSON Error: " + e.getMessage());
        }
    }
}