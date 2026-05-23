
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.util.ArrayList;
import java.util.List;


public class RepoRootAnalyser {
    String BASE_PATH = "/tmp/folio-scout/jobs/job_8819a277-7b08-4a88-9386-35814bcf8e81";
    private final List<String> FileNames = new ArrayList<>();

    public record RepoStructure(
        boolean hasPackageJson,
        boolean hasReadMe,
        boolean hasRootSrc,
        boolean hasGitIgnore,
        boolean hasNodeModules,
        boolean hasYarn,
        boolean hasNpm,
        boolean hasYarnAndNpm,
        boolean hasEsLint,
        boolean hasPrettier,
        boolean hasTypeScrypt,
        boolean hasAstro,
        boolean hasNext,
        boolean hasVite,
        boolean hasWebPack
    ){};

    private boolean hasFile(String fileName) {
        return FileNames.contains(fileName);
    }

    private boolean hasConfig(String prefix) {
        List<String> extensions = List.of(".js", ".ts" , ".cjs", ".mjs");

        return extensions.stream().anyMatch(ext -> FileNames.contains(prefix + ext));
    }


    private boolean hasAnyConfig(String... prefixes) {
        for (String prefix : prefixes) {
            if (hasConfig(prefix) || hasFile(prefix) ) {
                return true;
            }
        }
        return false;
    }

    public RepoStructure analyse() {
        return new RepoStructure(
            hasFile("package.json"),
            hasFile("README.md"),
            hasFile("src"),
            hasFile(".gitignore"),
            hasFile("node_modules"),
            hasFile("yarn.lock"),
            hasFile("package-lock.json"),
                hasFile("yarn.lock") && hasFile("package-lock.json"),
                hasAnyConfig("eslint.config", ".eslintrc"),
                hasConfig(".prettierrc"),
                hasConfig("tsconfig"),
                hasConfig("astro"),
                hasConfig("next.config"),
                hasConfig("vite.config"),
                hasConfig("webpack.config")
        );
    }



    public RepoRootAnalyser() {
        File directory = new File(BASE_PATH);
        // check directory exists here= directory.exists()
        File[] rootFiles = directory.listFiles();

        if (rootFiles != null){
            for (File file : rootFiles) {
                FileNames.add(file.getName());
            }
            RepoStructure result = analyse();

            ObjectMapper mapper = new ObjectMapper();
            try {
                String json = mapper.writeValueAsString(result);
                System.out.println(json);
            } catch (Exception e) {
                System.err.println("JSON Error: " + e.getMessage());
            }
        }
    }
}
