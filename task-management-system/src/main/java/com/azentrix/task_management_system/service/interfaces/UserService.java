package com.azentrix.task_management_system.service.interfaces;

import com.azentrix.task_management_system.dto.UserResponse;
import com.azentrix.task_management_system.dto.UserUpdateRequest;
import java.util.List;

public interface UserService {
    
    UserResponse getCurrentUserProfile();
    
    UserResponse updateProfile(UserUpdateRequest request);
    
    List<UserResponse> getAllUsers();
    
    UserResponse updateUserRole(Long userId, String roleName);
}
