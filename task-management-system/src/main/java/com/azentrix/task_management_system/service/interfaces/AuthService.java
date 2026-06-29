package com.azentrix.task_management_system.service.interfaces;

import com.azentrix.task_management_system.dto.LoginRequest;
import com.azentrix.task_management_system.dto.LoginResponse;
import com.azentrix.task_management_system.dto.RegisterRequest;
import com.azentrix.task_management_system.entity.User;

public interface AuthService {
    public LoginResponse login(LoginRequest loginRequest);
    public User register(RegisterRequest registerRequest);
}
