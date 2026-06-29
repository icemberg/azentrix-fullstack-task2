package com.azentrix.task_management_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserUpdateRequest {
    
    @NotBlank(message = "Username is required")
    private String username;
    
    private String avatar;
    
    private String currentPassword;
    private String newPassword;

    private String theme;
    private String defaultView;
    private String startOfWeek;
    private Boolean emailMentions;
    private Boolean emailAssignments;
    private Boolean pushDueReminders;
    private Boolean pushBoardUpdates;
    private Boolean twoFactorEnabled;
}
