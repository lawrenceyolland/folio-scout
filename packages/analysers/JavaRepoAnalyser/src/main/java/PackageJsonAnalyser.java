import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;

public class PackageJsonAnalyser {
    private final PackageJson pkg;
    private static final ObjectMapper mapper = new ObjectMapper();

    public PackageJsonRecord getPkgFields() {
        return new PackageJsonRecord(
                this.pkg.hasDependencies(),
                this.pkg.hasDevDependencies(),
                this.pkg.hasPeerDependencies(),
                this.pkg.hasScripts(),
                this.pkg.hasName(),
                this.pkg.hasLicense(),
                this.pkg.hasType(),
                this.pkg.hasMain(),
                this.pkg.hasDescription(),
                this.pkg.hasAuthor(),
                this.pkg.hasHomepage(),
                this.pkg.hasRepository()
        );
    }

    public PackageJson getPkg() {
        return this.pkg;
    }

    public PackageJsonAnalyser(String filePath) {
        File pkgFile = new File(filePath, "package.json");
        if (!pkgFile.exists() ) {
            throw new IllegalArgumentException("package.json file does not exist " + filePath);
        }

        try {
            // simple json structure so readValue is easier to work with
            this.pkg = mapper.readValue(pkgFile, PackageJson.class);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
