package com.azentrix.task_management_system.repository;

import com.azentrix.task_management_system.entity.TeamInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {
    List<TeamInvitation> findByTeamTeamIdAndStatus(Long teamId, String status);
    Optional<TeamInvitation> findByTokenAndStatus(String token, String status);
    Optional<TeamInvitation> findByTeamTeamIdAndInvitedEmailAndStatus(Long teamId, String email, String status);
    boolean existsByTeamTeamIdAndInvitedEmailAndStatus(Long teamId, String email, String status);
}
