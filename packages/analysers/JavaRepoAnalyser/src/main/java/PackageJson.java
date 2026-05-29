import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PackageJson {
    public Map<String, String> dependencies;
    public Map<String, String> devDependencies;
    public Map<String, String> peerDependencies;
    public Map<String, String> scripts;
    public String name;
    public String type;
    public String main;
    public String description;
    public JsonNode author;
    public List<JsonNode> contributors;
    public String license;
    public String homepage;
    public JsonNode repository;

    public boolean hasDependencies() { return this.dependencies != null; }
    public boolean hasDevDependencies() {
        return this.devDependencies != null;
    }
    public boolean hasPeerDependencies() {
        return this.peerDependencies != null;
    }
    public boolean hasScripts() { return this.scripts != null; }
    public boolean hasName() {
        return this.name != null;
    }
    public boolean hasType() {
        return this.type != null;
    }
    public boolean hasMain() {
        return this.main != null;
    }
    public boolean hasDescription() {
        return this.description != null;
    }
    public boolean hasAuthor() {
        return this.author != null;
    }
    public boolean hasLicense() {
        return this.license != null;
    }
    public boolean hasHomepage() {
        return this.homepage != null;
    }
    public boolean hasRepository() { return this.repository != null; }
}
