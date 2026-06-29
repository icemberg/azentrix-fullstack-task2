package com.azentrix.task_management_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BoardRequest {

    @NotBlank(message = "Board name is required")
    private String boardname;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private Long teamId;
}
