package one.example.plugin.jira.ao.entity;

import net.java.ao.Entity;

public interface TableName extends Entity {

    String getName();

    void setName(String name);


    Long getUserId();

    void setUserId(Long userId);
}
