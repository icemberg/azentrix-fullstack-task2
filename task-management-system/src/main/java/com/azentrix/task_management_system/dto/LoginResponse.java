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
    
    private Boolean requires2fa;

    public LoginResponse(String token, String username, String email, String role, String avatar, Boolean requires2fa) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.avatar = avatar;
        this.requires2fa = requires2fa;
    }

    public LoginResponse(String token, String username, String role, String email) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.email = email;
        this.requires2fa = false;
    }

    public LoginResponse(String username, Boolean requires2fa) {
        this.username = username;
        this.requires2fa = requires2fa;
    }

}
