package com.azentrix.task_management_system.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InvitationDTO {
    private Long id;
    private Long teamId;
    private String teamName;
    private String invitedBy;
    private String invitedEmail;
    private String token;
    private String role;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
