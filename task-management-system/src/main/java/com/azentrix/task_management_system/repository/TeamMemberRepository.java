package com.azentrix.task_management_system.repository;

import com.azentrix.task_management_system.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByUserUserId(Long userId);
    List<TeamMember> findByTeamTeamId(Long teamId);
    Optional<TeamMember> findByTeamTeamIdAndUserUserId(Long teamId, Long userId);
    boolean existsByTeamTeamIdAndUserUserId(Long teamId, Long userId);
    long countByTeamTeamIdAndRole(Long teamId, String role);
}
