package com.azentrix.task_management_system.service.interfaces;

import java.util.List;
import com.azentrix.task_management_system.dto.TeamDTO;
import com.azentrix.task_management_system.dto.TeamMemberDTO;
import com.azentrix.task_management_system.entity.User;

public interface TeamService {
    TeamDTO createTeam(String name, String description, String avatarColor, User creator);
    List<TeamDTO> getUserTeams(Long userId);
    TeamDTO getTeam(Long teamId, Long userId);
    TeamDTO updateTeam(Long teamId, String name, String description, String avatarColor, Long userId);
    void deleteTeam(Long teamId);
    List<TeamMemberDTO> getTeamMembers(Long teamId);
    void updateMemberRole(Long teamId, Long userId, String newRole);
    void removeMember(Long teamId, Long userId);
}
