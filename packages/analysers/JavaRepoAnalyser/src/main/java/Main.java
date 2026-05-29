import com.fasterxml.jackson.databind.ObjectMapper;

public class Main {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Error: Failed to pass filepath to repo");
            System.exit(1);
        }

        RepoRootAnalyser repoRootAnalyser = new RepoRootAnalyser(args[0]);
        RepoRootStructure result = repoRootAnalyser.analyse();

        ObjectMapper mapper = new ObjectMapper();

        try {
            String json = mapper.writeValueAsString(result);
            System.out.println(json);
        } catch (Exception e) {
            System.err.println("JSON Error: " + e.getMessage());
        }
    }
}