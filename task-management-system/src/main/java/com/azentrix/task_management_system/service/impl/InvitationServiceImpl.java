package com.azentrix.task_management_system.service.impl;

import com.azentrix.task_management_system.dto.InvitationDTO;
import com.azentrix.task_management_system.entity.Team;
import com.azentrix.task_management_system.entity.TeamInvitation;
import com.azentrix.task_management_system.entity.TeamMember;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.repository.TeamInvitationRepository;
import com.azentrix.task_management_system.repository.TeamMemberRepository;
import com.azentrix.task_management_system.repository.TeamRepository;
import com.azentrix.task_management_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;
import com.azentrix.task_management_system.service.interfaces.InvitationService;
import com.azentrix.task_management_system.service.interfaces.EmailService;
import com.azentrix.task_management_system.dto.TeamDTO;


@Service
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    private final TeamInvitationRepository teamInvitationRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public InvitationDTO createInvitation(Long teamId, String email, String role, User invitedBy) {
        // 1. Check if user already a member
        userRepository.findByEmail(email).ifPresent(user -> {
            if (teamMemberRepository.existsByTeamTeamIdAndUserUserId(teamId, user.getUserId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already a member of this team");
            }
        });

        // 2. Check pending invitations
        if (teamInvitationRepository.existsByTeamTeamIdAndInvitedEmailAndStatus(teamId, email, "PENDING")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A pending invitation already exists for this email");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found"));

        TeamInvitation inv = new TeamInvitation();
        inv.setTeam(team);
        inv.setInvitedBy(invitedBy);
        inv.setInvitedEmail(email);
        inv.setToken(UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", ""));
        inv.setRole(role != null ? role : "TEAM_MEMBER");
        inv.setStatus("PENDING");
        inv.setExpiresAt(LocalDateTime.now().plusHours(48));

        TeamInvitation savedInv = teamInvitationRepository.save(inv);

        emailService.sendInvitationEmail(email, savedInv.getToken(), team.getName(),
                invitedBy != null ? invitedBy.getUsername() : "System");

        return mapToDTO(savedInv);
    }


    public List<InvitationDTO> getPendingInvitations(Long teamId) {
        return teamInvitationRepository.findByTeamTeamIdAndStatus(teamId, "PENDING")
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void revokeInvitation(Long teamId, Long invitationId) {
        TeamInvitation inv = teamInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (!inv.getTeam().getTeamId().equals(teamId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invitation does not belong to this team");
        }

        inv.setStatus("REVOKED");
        teamInvitationRepository.save(inv);
    }

    public InvitationDTO getInvitationByToken(String token) {
        TeamInvitation inv = teamInvitationRepository.findByTokenAndStatus(token, "PENDING")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Invitation not found, revoked, or already accepted"));

        if (inv.getExpiresAt().isBefore(LocalDateTime.now())) {
            inv.setStatus("EXPIRED");
            teamInvitationRepository.save(inv);
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation has expired");
        }

        return mapToDTO(inv);
    }

    @Transactional
    public TeamDTO acceptInvitation(String token, User currentUser) {
        TeamInvitation inv = teamInvitationRepository.findByTokenAndStatus(token, "PENDING")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (inv.getExpiresAt().isBefore(LocalDateTime.now())) {
            inv.setStatus("EXPIRED");
            teamInvitationRepository.save(inv);
            throw new ResponseStatusException(HttpStatus.GONE, "Invitation has expired");
        }

        if (!inv.getInvitedEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "This invitation was sent to a different email address");
        }

        inv.setStatus("ACCEPTED");
        teamInvitationRepository.save(inv);

        TeamMember member = new TeamMember();
        member.setTeam(inv.getTeam());
        member.setUser(currentUser);
        member.setRole(inv.getRole());
        teamMemberRepository.save(member);

        TeamDTO teamDto = new TeamDTO();
        teamDto.setTeamId(inv.getTeam().getTeamId());
        teamDto.setName(inv.getTeam().getName());
        return teamDto;
    }

    private InvitationDTO mapToDTO(TeamInvitation inv) {
        InvitationDTO dto = new InvitationDTO();
        dto.setId(inv.getId());
        dto.setTeamId(inv.getTeam().getTeamId());
        dto.setTeamName(inv.getTeam().getName());
        dto.setInvitedBy(inv.getInvitedBy() != null ? inv.getInvitedBy().getUsername() : "System");
        dto.setInvitedEmail(inv.getInvitedEmail());
        dto.setToken(inv.getToken());
        dto.setRole(inv.getRole());
        dto.setStatus(inv.getStatus());
        dto.setExpiresAt(inv.getExpiresAt());
        dto.setCreatedAt(inv.getCreatedAt());
        return dto;
    }
}
