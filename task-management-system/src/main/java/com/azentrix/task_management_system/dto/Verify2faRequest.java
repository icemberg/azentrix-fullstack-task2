package com.azentrix.task_management_system.dto;

import lombok.Data;

@Data
public class Verify2faRequest {
    private String username;
    private String code;
}
