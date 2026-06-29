package com.azentrix.task_management_system.service.impl;

import com.azentrix.task_management_system.dto.TeamDTO;
import com.azentrix.task_management_system.dto.TeamMemberDTO;
import com.azentrix.task_management_system.entity.Team;
import com.azentrix.task_management_system.entity.TeamMember;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.repository.BoardRepository;
import com.azentrix.task_management_system.repository.TeamMemberRepository;
import com.azentrix.task_management_system.repository.TeamRepository;
import com.azentrix.task_management_system.repository.UserRepository;
import com.azentrix.task_management_system.service.interfaces.TeamService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    @Transactional
    public TeamDTO createTeam(String name, String description, String avatarColor, User creator) {
        Team team = new Team();
        team.setName(name);
        team.setDescription(description);
        team.setAvatarColor(avatarColor != null ? avatarColor : "#3b82f6");
        team.setCreatedBy(creator);
        team.setIsPersonal(false);
        Team savedTeam = teamRepository.save(team);

        TeamMember adminMember = new TeamMember();
        adminMember.setTeam(savedTeam);
        adminMember.setUser(creator);
        adminMember.setRole("TEAM_ADMIN");
        teamMemberRepository.save(adminMember);

        return mapToDTO(savedTeam, creator.getUserId());
    }

    public List<TeamDTO> getUserTeams(Long userId) {
        List<TeamMember> memberships = teamMemberRepository.findByUserUserId(userId);
        return memberships.stream()
                .map(tm -> mapToDTO(tm.getTeam(), userId))
                .collect(Collectors.toList());
    }

    public TeamDTO getTeam(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        return mapToDTO(team, userId);
    }

    @Transactional
    public TeamDTO updateTeam(Long teamId, String name, String description, String avatarColor, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        if (name != null)
            team.setName(name);
        if (description != null)
            team.setDescription(description);
        if (avatarColor != null)
            team.setAvatarColor(avatarColor);

        return mapToDTO(teamRepository.save(team), userId);
    }

    @Transactional
    public void deleteTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));
        if (team.getIsPersonal()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a personal workspace");
        }
        teamRepository.delete(team);
    }

    public List<TeamMemberDTO> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamTeamId(teamId).stream().map(tm -> {
            TeamMemberDTO dto = new TeamMemberDTO();
            dto.setUserId(tm.getUser().getUserId());
            dto.setUsername(tm.getUser().getUsername());
            dto.setEmail(tm.getUser().getEmail());
            dto.setAvatar(tm.getUser().getAvatar());
            dto.setRole(tm.getRole());
            dto.setJoinedAt(tm.getJoinedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateMemberRole(Long teamId, Long userId, String newRole) {
        TeamMember member = teamMemberRepository.findByTeamTeamIdAndUserUserId(teamId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        if ("TEAM_MEMBER".equals(newRole) && "TEAM_ADMIN".equals(member.getRole())) {
            long adminCount = teamMemberRepository.countByTeamTeamIdAndRole(teamId, "TEAM_ADMIN");
            if (adminCount <= 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot demote the last team admin");
            }
        }
        member.setRole(newRole);
        teamMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(Long teamId, Long userId) {
        TeamMember member = teamMemberRepository.findByTeamTeamIdAndUserUserId(teamId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        if ("TEAM_ADMIN".equals(member.getRole())) {
            long adminCount = teamMemberRepository.countByTeamTeamIdAndRole(teamId, "TEAM_ADMIN");
            if (adminCount <= 1) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot remove the last team admin");
            }
        }
        teamMemberRepository.delete(member);
    }

    private TeamDTO mapToDTO(Team team, Long currentUserId) {
        TeamDTO dto = new TeamDTO();
        dto.setTeamId(team.getTeamId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setAvatarColor(team.getAvatarColor());
        dto.setIsPersonal(team.getIsPersonal());
        dto.setCreatedBy(team.getCreatedBy() != null ? team.getCreatedBy().getUserId() : null);
        dto.setCreatedAt(team.getCreatedAt());

        long memberCount = teamMemberRepository.countByTeamTeamIdAndRole(team.getTeamId(), "TEAM_ADMIN") +
                teamMemberRepository.countByTeamTeamIdAndRole(team.getTeamId(), "TEAM_MEMBER"); // Actually a bit hacky,
                                                                                                // let's assume
                                                                                                // teamMemberRepository.countByTeamTeamId(teamId)
                                                                                                // exists
        // Workaround: just use findByTeamTeamId().size() if we didn't add
        // countByTeamTeamId
        dto.setMemberCount((long) teamMemberRepository.findByTeamTeamId(team.getTeamId()).size());
        dto.setBoardCount(boardRepository.countByTeamTeamId(team.getTeamId()));

        if (currentUserId != null) {
            teamMemberRepository.findByTeamTeamIdAndUserUserId(team.getTeamId(), currentUserId)
                    .ifPresent(tm -> dto.setCurrentUserRole(tm.getRole()));
        }

        return dto;
    }
}
