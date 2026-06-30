package com.azentrix.task_management_system.dto;

import lombok.Data;

@Data
public class Enable2faRequest {
    private String secret;
    private String code;
}
