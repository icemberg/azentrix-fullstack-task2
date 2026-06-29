package com.azentrix.task_management_system.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.azentrix.task_management_system.dto.LoginRequest;
import com.azentrix.task_management_system.dto.LoginResponse;
import com.azentrix.task_management_system.dto.RegisterRequest;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.service.interfaces.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/v1/auth")
@Slf4j
@RequiredArgsConstructor
public class AuthController {
	
    private final AuthService authService;

	@RequestMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Received login request for user: {}", loginRequest.getUsername());
        LoginResponse loginResponse = authService.login(loginRequest);
        log.info("Successfully logged in user: {}", loginRequest.getUsername());
        return ResponseEntity.status(HttpStatus.OK).body(loginResponse);
    }

    @RequestMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Received register request for user: {}", registerRequest.getUsername());
    	User registeredUser = authService.register(registerRequest);
        log.info("Successfully registered user: {}", registeredUser.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(registeredUser);
    }
	
}
