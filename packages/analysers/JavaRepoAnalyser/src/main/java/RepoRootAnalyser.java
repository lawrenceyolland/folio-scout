import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.util.ArrayList;
import java.util.List;


public class RepoRootAnalyser {
    private final File directory;
    private final List<String> fileNames = new ArrayList<>();


    private boolean hasFile(String fileName) {
        return fileNames.contains(fileName);
    }

    private boolean hasConfig(String prefix) {
        List<String> extensions = List.of(".js", ".ts" , ".cjs", ".mjs");

        return extensions.stream().anyMatch(ext -> fileNames.contains(prefix + ext));
    }

    private boolean hasAnyConfig(String... prefixes) {
        for (String prefix : prefixes) {
            if (hasConfig(prefix) || hasFile(prefix) ) {
                return true;
            }
        }
        return false;
    }

    private boolean hasAnyFile(String... files) {
        for (String file : files) {
            if (hasFile(file)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasMultipleFilesOfType(String... files) {
        int counter = 0;

        for (String file : files) {
            if (hasFile(file)) {
                counter += 1;
            }
        }

        return counter > 1;
    }

    public RepoRootStructure analyse() {
        File[] rootFiles = directory.listFiles();

        if (rootFiles != null) {
            for (File file : rootFiles) {
                this.fileNames.add(file.getName());
            }
        }

        return new RepoRootStructure(
            hasFile("package.json"),
            hasFile("README.md"),
            hasFile("src"),
            hasFile(".gitignore"),
            hasFile("node_modules"),
            hasFile("yarn.lock"),
            hasFile("package-lock.json"),
                hasFile("pnpm-lock.yaml"),
                hasMultipleFilesOfType("yarn.lock", "package-lock.json", "pnpm-lock.yaml"),
                hasAnyConfig("eslint.config", ".eslintrc"),
                hasConfig(".prettierrc"),
                hasConfig("tsconfig"),
                hasConfig("astro"),
                hasConfig("next.config"),
                hasConfig("vite.config"),
                hasConfig("webpack.config"),
                hasFile(".env"),
                hasAnyFile("yarn.lock", "package-lock.json")
        );
    }

    public RepoRootAnalyser(String filePath) {
        this.directory = new File(filePath);
        if (!directory.exists() || !directory.isDirectory()){
            throw new IllegalArgumentException("Repository root does not exist");
        }
    }
}
