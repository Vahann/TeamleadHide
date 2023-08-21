package one.example.jira.plugins.hide.rest;

import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.jira.util.json.JSONException;
import com.atlassian.jira.util.json.JSONObject;
import one.example.jira.plugins.hide.ao.entity.TableName;
import one.example.jira.plugins.hide.ao.service.TableNameService;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.log4j.Logger;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Map;
import java.util.Objects;

/**
 * @author Vahan_Harutyunyan
 */
@Path("/tables")
public class TableController {

    private static final Logger log = Logger.getLogger(TableController.class);
    private static final String HTTP_HEADER_NAME = "ServerTypeIdentification";
    private static final String HTTP_HEADER_VALUE = "DC";

    private final TableNameService tableService;

    public TableController(TableNameService tableService) {
        this.tableService = tableService;
    }


    @GET
    public Response findTables(@Context HttpHeaders httpHeaders) throws JSONException {

        final JSONObject result = new JSONObject();
        ApplicationUser loggedInUser = ComponentAccessor.getJiraAuthenticationContext().getLoggedInUser();

        TableName table = tableService.getTableByCurrentUser(loggedInUser);
        if (table != null) {

            result.put("id", table.getID());
            result.put("text", table.getName());
            result.put("userId", table.getUserId());

//            JSONArray issues = new JSONArray();
//            List<Issue> issuesByUser = tableService.findIssuesAssignedToCurrentUser(loggedInUser);
//            for (Issue issue : issuesByUser) {
//                JSONObject item = new JSONObject();
//                item.put("id", issue.getId());
//                item.put("summary", issue.getSummary());
//                item.put("description", issue.getDescription());
//                item.put("status", issue.getStatus().toString());
//                item.put("assignee", issue.getAssignee());
//
//                issues.put(item);
//            }
//            result.put("issues", issues);
            return Response.ok(result.toString()).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
        } else {
            return Response.status(HttpStatus.SC_NOT_FOUND).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
        }
    }

    @POST
    @Produces({MediaType.APPLICATION_JSON})
    public Response createTable(final Map<String, String> table, @Context HttpHeaders httpHeaders) throws JSONException {

        TableName savedTable = tableService.createTable(table.get("text"));
        if (savedTable == null) {
            return Response.status(HttpStatus.SC_BAD_REQUEST).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
        }
        final JSONObject result = new JSONObject();
        result.put("id", savedTable.getID());
        result.put("text", savedTable.getName());
        result.put("userId", savedTable.getUserId());

        return Response.ok(result.toString()).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
//        return Response.status(HttpStatus.SC_CREATED).entity(result.toString()).build();
    }

    @PUT
//    @Path("/{tableId}")
    @Produces({MediaType.APPLICATION_JSON})
    public Response updateTable(final Map<String, String> table, @Context HttpHeaders httpHeaders) throws JSONException {

        ApplicationUser loggedInUser = ComponentAccessor.getJiraAuthenticationContext().getLoggedInUser();
        TableName tableByCurrentUser = tableService.getTableByCurrentUser(loggedInUser);
        if(tableByCurrentUser == null){
            return createTable(table, httpHeaders);
        }

        Integer tableId = tableByCurrentUser.getID();
        TableName updatedTable = tableService.updateTable(tableId, table);

        if (Objects.isNull(updatedTable)) {
            return Response.status(HttpStatus.SC_BAD_REQUEST).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();

        }
        final JSONObject result = new JSONObject();
        result.put("id", updatedTable.getID());
        result.put("text", updatedTable.getName());
        result.put("userId", updatedTable.getUserId());

//        return Response.ok(result.toString()).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
        return Response.ok(result.toString()).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
    }

    @DELETE
    @Path("/{tableId}")
    public Response deleteTable(@PathParam("tableId") final Integer tableId) {

        boolean isDelete = tableService.deleteTable(tableId);

        if (isDelete) {
            return Response.status(HttpStatus.SC_NO_CONTENT).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
        } else {
            return Response.status(HttpStatus.SC_BAD_REQUEST).header(HTTP_HEADER_NAME,HTTP_HEADER_VALUE).build();
        }
    }
}
