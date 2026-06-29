package com.azentrix.task_management_system.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TeamMemberDTO {
    private Long userId;
    private String username;
    private String email;
    private String avatar;
    private String role;
    private LocalDateTime joinedAt;
}
