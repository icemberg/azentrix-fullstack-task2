package com.azentrix.task_management_system.enums;

public enum RoleEnum {
    USER("USER"),
    ADMIN("ADMIN");

    private final String role;

    RoleEnum(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
