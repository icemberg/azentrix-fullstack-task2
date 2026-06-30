package com.azentrix.task_management_system.dto;


import lombok.Data;

@Data
public class LoginResponse {
    
    private String token;
    
    private String type = "Bearer";
    
    private String username;
    
    private String role;
    
    private String avatar;

    private String email;

    public LoginResponse(String token, String username, String email, String role, String avatar) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.avatar = avatar;
    }

}
