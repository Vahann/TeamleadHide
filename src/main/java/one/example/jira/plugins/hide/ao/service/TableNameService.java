package one.example.jira.plugins.hide.ao.service;

import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.user.ApplicationUser;
import one.example.jira.plugins.hide.ao.entity.TableName;

import java.util.List;
import java.util.Map;


/**
 * @author Vahan_Harutyunyan
 */
public interface TableNameService {

    TableName getTableByCurrentUser(ApplicationUser currentUser);

    TableName createTable(String table);

    TableName updateTable(Integer tableId, Map<String, String> table);

    boolean deleteTable(Integer tableId);

    // for quick implementation of the prototype, this functionality is added to the `Table` service
    List<Issue> findIssuesAssignedToCurrentUser(ApplicationUser currentUser);

}
