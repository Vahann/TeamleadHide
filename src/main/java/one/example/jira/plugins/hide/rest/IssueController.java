package one.example.jira.plugins.hide.rest;

import com.atlassian.jira.avatar.Avatar;
import com.atlassian.jira.avatar.AvatarService;
import com.atlassian.jira.bc.issue.IssueService;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.exception.RemoveException;
import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.issue.IssueInputParameters;
import com.atlassian.jira.issue.IssueInputParametersImpl;
import com.atlassian.jira.issue.IssueManager;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.jira.user.util.UserManager;
import com.atlassian.jira.util.ErrorCollection;
import com.atlassian.jira.util.json.JSONArray;
import com.atlassian.jira.util.json.JSONException;
import com.atlassian.jira.util.json.JSONObject;
import one.example.jira.plugins.hide.ao.service.TableNameService;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.log4j.Logger;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URI;
import java.util.List;
import java.util.Map;

/**
 * @author Vahan_Harutyunyan
 */
@Path("/issue") ////issueS
public class IssueController {

    private static final Logger log = Logger.getLogger(IssueController.class);

    private static final String HTTP_HEADER_NAME = "ServerTypeIdentification";
    private static final String HTTP_HEADER_VALUE = "DC";
    private final TableNameService tableService;
    private final UserManager userManager;

    private final AvatarService avatarService;

    private final IssueManager issueManager;

    private final IssueService issueService;


    public IssueController(TableNameService tableService) {
        this.tableService = tableService;
        this.userManager = ComponentAccessor.getUserManager();
        this.avatarService = ComponentAccessor.getComponent(AvatarService.class);
        this.issueManager = ComponentAccessor.getIssueManager();
        this.issueService = ComponentAccessor.getIssueService();
    }


    @GET
    public Response findIssues() throws JSONException {

        final JSONObject result = new JSONObject();
        ApplicationUser loggedInUser = ComponentAccessor.getJiraAuthenticationContext().getLoggedInUser();

        JSONArray issues = new JSONArray();
        List<Issue> issuesByUser = tableService.findIssuesAssignedToCurrentUser(loggedInUser);
        for (Issue issue : issuesByUser) {
            JSONObject item = new JSONObject();
            item.put("id", issue.getId());
            item.put("key", issue.getKey());
            item.put("description", issue.getDescription());
            item.put("summary", issue.getSummary());
            item.put("status", issue.getStatus().getSimpleStatus().getName());
            item.put("assignee", issue.getAssignee().getDisplayName());
            ApplicationUser assigneeUser = userManager.getUserByName(issue.getAssignee().getUsername());
            URI avatarAbsoluteURL = avatarService.getAvatarAbsoluteURL(loggedInUser, assigneeUser, Avatar.Size.SMALL);
            item.put("avatar", avatarAbsoluteURL);

            issues.put(item);
        }
        result.put("issues", issues);

        return Response.ok(result.toString()).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
    }

    @PUT
    @Path("/{issueId}")
    @Produces({MediaType.APPLICATION_JSON})
    public Response updateIssue(
            @PathParam("issueId") final Long issueId,
            final Map<String, String> body) throws JSONException {

        ApplicationUser loggedInUser = ComponentAccessor.getJiraAuthenticationContext().getLoggedInUser();
        Issue issueToUpdate = issueManager.getIssueObject(issueId);
        JiraAuthenticationContext authContext = ComponentAccessor.getJiraAuthenticationContext();


        if (issueToUpdate != null) {

            String newSummary = body.get("summary");
            String newDescription = body.get("description");

            IssueInputParameters issueInputParameters = new IssueInputParametersImpl();
            issueInputParameters.setDescription(newDescription);
            issueInputParameters.setSummary(newSummary);

            IssueService.UpdateValidationResult validationResult = issueService.validateUpdate(authContext.getLoggedInUser(), issueToUpdate.getId(), issueInputParameters);

            if (validationResult.isValid()) {
                issueService.update(authContext.getLoggedInUser(), validationResult);

                ErrorCollection errors = validationResult.getErrorCollection();
                if (errors != null && !errors.hasAnyErrors()) {
                    Issue updatedIssue = issueManager.getIssueObject(issueId);
                    JSONObject result = new JSONObject();
                    result.put("id", updatedIssue.getId());
                    result.put("summary", updatedIssue.getSummary());
                    result.put("description", updatedIssue.getDescription());
                    result.put("status", updatedIssue.getStatus().getSimpleStatus().getName());
                    result.put("assignee", updatedIssue.getAssignee().getDisplayName());
                    ApplicationUser assigneeUser = userManager.getUserByName(updatedIssue.getAssignee().getUsername());
                    URI avatarAbsoluteURL = avatarService.getAvatarAbsoluteURL(loggedInUser, assigneeUser, Avatar.Size.SMALL);
                    result.put("avatar", avatarAbsoluteURL);
                    return Response.ok(result.toString()).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
                }
            }
        }

        return Response.status(HttpStatus.SC_BAD_REQUEST).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
    }

    @DELETE
    @Path("/{issueId}")
    public Response deleteIssue(@PathParam("issueId") final Long issueId) throws RemoveException {

        Issue issueToDelete = issueManager.getIssueObject(issueId);

        if (issueToDelete != null) {
            issueManager.deleteIssueNoEvent(issueToDelete);
            return Response.status(HttpStatus.SC_NO_CONTENT).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
        }
        return Response.status(HttpStatus.SC_BAD_REQUEST).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();

    }

}
