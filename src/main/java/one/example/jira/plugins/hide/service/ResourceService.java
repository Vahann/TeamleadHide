package one.example.jira.plugins.hide.service;

import javax.inject.Named;
import java.io.IOException;
import java.util.Properties;

@Named
public class ResourceService {

    private final Properties properties = new Properties();

    public ResourceService() throws IOException {
        java.io.InputStream is = this.getClass().getClassLoader().getResourceAsStream("maven.properties");
        if (is != null) {
            properties.load(is);
        }
    }

    public String getProperty(String propertyName)  {
        return this.properties.getProperty(propertyName);
    }
}
