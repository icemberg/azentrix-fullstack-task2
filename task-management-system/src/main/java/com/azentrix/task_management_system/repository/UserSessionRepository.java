package com.azentrix.task_management_system.repository;

import com.azentrix.task_management_system.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    
    Optional<UserSession> findBySessionId(String sessionId);
    
    List<UserSession> findByUser_UserIdAndActiveTrueOrderByLastActiveAtDesc(Long userId);
}
