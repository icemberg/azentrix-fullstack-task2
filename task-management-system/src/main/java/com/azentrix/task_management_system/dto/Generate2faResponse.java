package com.azentrix.task_management_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Generate2faResponse {
    private String secret;
    private String qrCodeImageUri;
}
