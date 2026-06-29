package com.azentrix.task_management_system.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class RegisterResponse {

    private Long id;
    
    private String username;
    
    private String role;

    private LocalDateTime timestamp;

}
