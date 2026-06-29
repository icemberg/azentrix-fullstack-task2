package com.azentrix.task_management_system.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String avatar;

    private String theme;
    private String defaultView;
    private String startOfWeek;
    private boolean emailMentions;
    private boolean emailAssignments;
    private boolean pushDueReminders;
    private boolean pushBoardUpdates;
    private boolean twoFactorEnabled;
}
