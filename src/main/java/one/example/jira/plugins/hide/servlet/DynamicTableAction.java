package one.example.jira.plugins.hide.servlet;

import com.atlassian.jira.security.request.RequestMethod;
import com.atlassian.jira.security.request.SupportedMethods;
import com.atlassian.jira.web.action.JiraWebActionSupport;

@SupportedMethods({RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH})
public class DynamicTableAction extends JiraWebActionSupport {


    @SupportedMethods({RequestMethod.GET, RequestMethod.POST})
    public String doExecute() throws Exception {
        return "Hellllo";
    }
}
