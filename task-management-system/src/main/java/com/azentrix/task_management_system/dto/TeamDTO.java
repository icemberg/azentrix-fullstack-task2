package com.azentrix.task_management_system.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TeamDTO {
    private Long teamId;
    private String name;
    private String description;
    private String avatarColor;
    private Boolean isPersonal;
    private Long createdBy;
    private LocalDateTime createdAt;
    
    // Aggregated fields
    private Long memberCount;
    private Long boardCount;
    private String currentUserRole;
}
