package one.example.jira.plugins.hide.servlet;

import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.soy.renderer.SoyException;
import com.atlassian.soy.renderer.SoyTemplateRenderer;
import one.example.jira.plugins.hide.service.ResourceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class DynamicTableServlet extends HttpServlet {
    private static final Logger log = LoggerFactory.getLogger(DynamicTableServlet.class);
    private final ResourceService resourceService;
    private final SoyTemplateRenderer soyTemplateRenderer;

        public DynamicTableServlet(@ComponentImport SoyTemplateRenderer soyTemplateRenderer, ResourceService resourceService) {
        this.resourceService = resourceService;
        this.soyTemplateRenderer = soyTemplateRenderer;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pluginKey = this.resourceService.getProperty("atlassian.plugin.key");
        Map<String, Object> map = new HashMap<>();


        String html = null;
        try {
            html = soyTemplateRenderer.render(pluginKey + ":jira-react-atlaskit-resources", "servlet.ui.dynamictable", map);
        } catch (SoyException e) {
            throw new RuntimeException(e);
        }

        resp.setContentType("text/html");
        resp.getWriter().write(html);
        resp.getWriter().close();   }
//        resp.setContentType("text/html");
//        try {
//            soyTemplateRenderer.render(String.valueOf(resp.getWriter()), "hide.soy.dynamictable", map);
//        } catch (SoyException e) {
//            throw new RuntimeException(e);
//        }
//    }
}