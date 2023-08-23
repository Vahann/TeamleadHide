package one.example.plugin.jira.ao.service;

import com.atlassian.activeobjects.external.ActiveObjects;
import com.atlassian.jira.bc.issue.search.SearchService;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.issue.search.SearchException;
import com.atlassian.jira.issue.search.SearchResults;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.jira.web.bean.PagerFilter;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import net.java.ao.Query;
import one.example.plugin.jira.ao.entity.TableName;
import org.apache.log4j.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;


/**
 * @author Vahan_Harutyunyan
 */
@Scanned
public class TableNameServiceImpl implements TableNameService {

    private static final Logger log = Logger.getLogger(TableNameServiceImpl.class);

    private final ActiveObjects ao;
    private final SearchService searchService;

    public TableNameServiceImpl(ActiveObjects ao, SearchService searchService) {
        this.ao = ao;
        this.searchService = searchService;
    }


    @Override
    public TableName getTableByCurrentUser(ApplicationUser currentUser) {

        if (currentUser == null) {
            throw new NullPointerException("Resource is not found");
        }
        Long userId = currentUser.getId();
        Query query = Query.select().where("USER_ID = ? ", userId);
        TableName[] tables = ao.find(TableName.class, query);

        if (tables != null && tables.length > 0) {
            return tables[0];
        }
        return null;
    }

    @Override
    public TableName createTable(String tableName) {

        Long userId = ComponentAccessor.getJiraAuthenticationContext().getLoggedInUser().getId();

        if (tableName == null || tableName.isEmpty() || userId == null) {
            return null;
        }

        TableName savedTable = ao.executeInTransaction(() -> {

            TableName toSave = ao.create(TableName.class);
            toSave.setName(tableName);
            toSave.setUserId(userId);
            toSave.save();

            return toSave;
        });


        return savedTable;
    }

    @Override
    public TableName updateTable(Integer tableId, Map<String, String> table) {

        String tableName = table.get("text");
        if (tableName != null && !tableName.isEmpty()) {

            TableName updated = ao.executeInTransaction(() -> {
                TableName toUpdate = ao.get(TableName.class, tableId);
                if (toUpdate != null) {
                    toUpdate.setName(tableName);
                    toUpdate.save();
                }
                return toUpdate;
            });
            return updated;
        }
        return null;
    }

    @Override
    public boolean deleteTable(Integer tableId) {

        //validation

        boolean deleted;

        deleted = ao.executeInTransaction(() -> {
            TableName toDelete = ao.get(TableName.class, tableId);
            if (toDelete != null) {
                ao.delete(toDelete);
                return true;
            } else {
                return false;
            }
        });

        return deleted;
    }

    //for quick implementation of the prototype, this functionality is added to the `Table` service
    @Override
    public List<Issue> findIssuesAssignedToCurrentUser(ApplicationUser currentUser) {

        String jql = "assignee = currentUser()";
        List<Issue> results = new ArrayList<>();
        SearchService.ParseResult parseResult = searchService.parseQuery(currentUser, jql);
        if (parseResult.isValid()) {
            SearchResults<Issue> searchResults = null;
            try {
                searchResults = searchService.search(currentUser, parseResult.getQuery(), PagerFilter.getUnlimitedFilter());
                log.debug("searchResults is " + searchResults);
                if (Objects.nonNull(searchResults)) {
                    results = searchResults.getResults();
                }
            } catch (SearchException e) {
                log.error(e);
                return null;
            }
        }
        return results;
    }


}