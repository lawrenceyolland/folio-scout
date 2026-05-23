import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import tools.jackson.databind.JsonNode;

import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PackageJson {
    String name;
    String version;
    String type;
    String main;
    String description;
    List<String> workspaces;
    List<String> keywords;
    JsonNode author;
    List<JsonNode> contributors;
    String license;
    String homepage;
    Map<String, String> dependencies;
    Map<String, String> devDependencies;
    Map<String, String> peerDependencies;
    Map<String, String> scripts;
    Bugs bugs;
    JsonNode repository;
}
