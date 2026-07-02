package com.azentrix.task_management_system.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.azentrix.task_management_system.dto.UserResponse;
import com.azentrix.task_management_system.dto.UserUpdateRequest;
import com.azentrix.task_management_system.dto.CardResponse;
import com.azentrix.task_management_system.service.interfaces.UserService;
import com.azentrix.task_management_system.service.interfaces.CardService;
import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/v1/users")
@Slf4j
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CardService cardService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        log.info("Received request to fetch current user profile");
        UserResponse user = userService.getCurrentUserProfile();
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UserUpdateRequest request) {
        log.info("Received request to update current user profile");
        UserResponse user = userService.updateProfile(request);
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("Received request to fetch all users");
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.status(HttpStatus.OK).body(users);
    }

    @GetMapping("/me/tasks")
    public ResponseEntity<List<CardResponse>> getMyTasks() {
        log.info("Received request to fetch tasks for current user");
        List<CardResponse> tasks = cardService.getAllForCurrentUser();
        return ResponseEntity.status(HttpStatus.OK).body(tasks);
    }
}
