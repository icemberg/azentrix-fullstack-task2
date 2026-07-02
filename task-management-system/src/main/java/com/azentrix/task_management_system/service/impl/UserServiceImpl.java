package com.azentrix.task_management_system.service.impl;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.azentrix.task_management_system.dto.UserResponse;
import com.azentrix.task_management_system.dto.UserUpdateRequest;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.exception.ResourceNotFoundException;
import com.azentrix.task_management_system.exception.UnauthorizedException;
import com.azentrix.task_management_system.mapper.EntityMapper;
import com.azentrix.task_management_system.repository.UserRepository;
import com.azentrix.task_management_system.repository.RoleRepository;
import com.azentrix.task_management_system.service.interfaces.UserService;
import com.azentrix.task_management_system.enums.RoleEnum;
import com.azentrix.task_management_system.entity.Role;
import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper entityMapper;

    @Override
    public UserResponse getCurrentUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Fetching profile for user: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return entityMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UserUpdateRequest request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Updating profile for user: {}", currentUsername);
        
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        // Check if username is changing and available
        if (!user.getUsername().equals(request.getUsername())) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Username is already taken");
            }
            user.setUsername(request.getUsername());
        }

        user.setAvatar(request.getAvatar());
        
        if (request.getTheme() != null) user.setTheme(request.getTheme());
        if (request.getDefaultView() != null) user.setDefaultView(request.getDefaultView());
        if (request.getStartOfWeek() != null) user.setStartOfWeek(request.getStartOfWeek());
        if (request.getEmailMentions() != null) user.setEmailMentions(request.getEmailMentions());
        if (request.getEmailAssignments() != null) user.setEmailAssignments(request.getEmailAssignments());
        if (request.getPushDueReminders() != null) user.setPushDueReminders(request.getPushDueReminders());
        if (request.getPushBoardUpdates() != null) user.setPushBoardUpdates(request.getPushBoardUpdates());
        if (request.getTwoFactorEnabled() != null) user.setTwoFactorEnabled(request.getTwoFactorEnabled());

        // Update password if requested
        if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            if (user.getPassword() != null) {
                if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                    throw new UnauthorizedException("Current password is incorrect");
                }
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        User updatedUser = userRepository.save(user);
        log.info("Successfully updated profile for user ID: {}", updatedUser.getUserId());
        return entityMapper.toUserResponse(updatedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        log.info("Fetching all users for admin");
        return userRepository.findAll().stream()
                .map(entityMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long userId, String roleName) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        if (!"ADMIN".equals(currentUser.getRole().getName().toString())) {
            throw new UnauthorizedException("Only admins can change roles");
        }

        if (currentUser.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You cannot change your own role");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found: " + userId));

        Role newRole = roleRepository.findByName(RoleEnum.valueOf(roleName.toUpperCase()))
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));

        targetUser.setRole(newRole);
        User savedUser = userRepository.save(targetUser);
        log.info("Successfully updated role for user {} to {}", userId, roleName);
        return entityMapper.toUserResponse(savedUser);
    }
}
