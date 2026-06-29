package com.azentrix.task_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SessionResponse {
    private String sessionId;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime lastActiveAt;
    private boolean isCurrentSession;
}
