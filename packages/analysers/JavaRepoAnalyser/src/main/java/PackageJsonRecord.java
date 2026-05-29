import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

public record PackageJsonRecord(
        boolean hasDependencies,
        boolean hasDevDependencies,
        boolean hasPeerDependencies,
        boolean hasScripts,
        boolean hasName,
        boolean hasLicense,
        boolean hasType,
        boolean hasMain,
        boolean hasDescription,
        boolean hasAuthor,
        boolean hasHomepage,
        boolean hasRepository
) {}
