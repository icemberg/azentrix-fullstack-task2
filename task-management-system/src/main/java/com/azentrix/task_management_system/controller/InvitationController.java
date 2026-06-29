package com.azentrix.task_management_system.controller;

import com.azentrix.task_management_system.dto.InvitationDTO;
import com.azentrix.task_management_system.dto.TeamDTO;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.repository.UserRepository;
import com.azentrix.task_management_system.security.UserDetailsImpl;
import com.azentrix.task_management_system.service.interfaces.InvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;
    private final UserRepository userRepository;

    private User getUser(UserDetailsImpl userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @PostMapping("/v1/teams/{teamId}/invitations")
    @PreAuthorize("@securityGuard.hasTeamRole(#teamId, 'TEAM_ADMIN')")
    public ResponseEntity<InvitationDTO> createInvitation(@PathVariable Long teamId, @RequestBody Map<String, String> body, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        InvitationDTO inv = invitationService.createInvitation(teamId, body.get("email"), body.get("role"), getUser(userDetails));
        // Note: The email sending service will be integrated here or via events
        return ResponseEntity.status(HttpStatus.CREATED).body(inv);
    }

    @GetMapping("/v1/teams/{teamId}/invitations")
    @PreAuthorize("@securityGuard.hasTeamRole(#teamId, 'TEAM_ADMIN')")
    public ResponseEntity<List<InvitationDTO>> getPendingInvitations(@PathVariable Long teamId) {
        return ResponseEntity.ok(invitationService.getPendingInvitations(teamId));
    }

    @DeleteMapping("/v1/teams/{teamId}/invitations/{invitationId}")
    @PreAuthorize("@securityGuard.hasTeamRole(#teamId, 'TEAM_ADMIN')")
    public ResponseEntity<Void> revokeInvitation(@PathVariable Long teamId, @PathVariable Long invitationId) {
        invitationService.revokeInvitation(teamId, invitationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/v1/invitations/{token}")
    public ResponseEntity<InvitationDTO> getInvitation(@PathVariable String token) {
        return ResponseEntity.ok(invitationService.getInvitationByToken(token));
    }

    @PostMapping("/v1/invitations/{token}/accept")
    public ResponseEntity<TeamDTO> acceptInvitation(@PathVariable String token, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "You must be logged in to accept an invitation");
        }
        TeamDTO team = invitationService.acceptInvitation(token, getUser(userDetails));
        return ResponseEntity.ok(team);
    }
}
