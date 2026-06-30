package com.azentrix.task_management_system.service.interfaces;

import com.azentrix.task_management_system.dto.LoginRequest;
import com.azentrix.task_management_system.dto.LoginResponse;
import com.azentrix.task_management_system.dto.RegisterRequest;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.dto.Verify2faRequest;
import com.azentrix.task_management_system.dto.GoogleLoginRequest;

public interface AuthService {
    public LoginResponse login(LoginRequest loginRequest);

    public User register(RegisterRequest registerRequest);

    LoginResponse verify2fa(Verify2faRequest request);

    LoginResponse googleLogin(GoogleLoginRequest request);
}
