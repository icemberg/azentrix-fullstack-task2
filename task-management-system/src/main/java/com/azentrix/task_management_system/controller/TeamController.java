package com.azentrix.task_management_system.controller;

import com.azentrix.task_management_system.dto.TeamDTO;
import com.azentrix.task_management_system.dto.TeamMemberDTO;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.repository.UserRepository;
import com.azentrix.task_management_system.security.UserDetailsImpl;
import com.azentrix.task_management_system.dto.BoardRequest;
import com.azentrix.task_management_system.dto.BoardResponse;
import com.azentrix.task_management_system.service.interfaces.BoardService;
import com.azentrix.task_management_system.service.interfaces.TeamService;
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
@RequestMapping("/v1/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;
    private final BoardService boardService;
    private final UserRepository userRepository;

    private User getUser(UserDetailsImpl userDetails) {
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @PostMapping
    public ResponseEntity<TeamDTO> createTeam(@RequestBody Map<String, String> body, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User creator = getUser(userDetails);
        TeamDTO team = teamService.createTeam(body.get("name"), body.get("description"), body.get("avatarColor"), creator);
        return ResponseEntity.status(HttpStatus.CREATED).body(team);
    }

    @GetMapping
    public ResponseEntity<List<TeamDTO>> getUserTeams(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(teamService.getUserTeams(userDetails.getId()));
    }

    @GetMapping("/{teamId}")
    @PreAuthorize("@securityGuard.isTeamMember(#teamId)")
    public ResponseEntity<TeamDTO> getTeam(@PathVariable Long teamId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(teamService.getTeam(teamId, userDetails.getId()));
    }

    @PatchMapping("/{teamId}")
    @PreAuthorize("@securityGuard.hasTeamRole(#teamId, 'TEAM_ADMIN')")
    public ResponseEntity<TeamDTO> updateTeam(@PathVariable Long teamId, @RequestBody Map<String, String> body, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        TeamDTO team = teamService.updateTeam(teamId, body.get("name"), body.get("description"), body.get("avatarColor"), userDetails.getId());
        return ResponseEntity.ok(team);
    }

    @DeleteMapping("/{teamId}")
    @PreAuthorize("@securityGuard.hasTeamRole(#teamId, 'TEAM_ADMIN')")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long teamId) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{teamId}/members")
    @PreAuthorize("@securityGuard.isTeamMember(#teamId)")
    public ResponseEntity<List<TeamMemberDTO>> getTeamMembers(@PathVariable Long teamId) {
        return ResponseEntity.ok(teamService.getTeamMembers(teamId));
    }

    @PatchMapping("/{teamId}/members/{userId}")
    @PreAuthorize("@securityGuard.hasTeamRole(#teamId, 'TEAM_ADMIN')")
    public ResponseEntity<Void> updateMemberRole(@PathVariable Long teamId, @PathVariable Long userId, @RequestBody Map<String, String> body) {
        teamService.updateMemberRole(teamId, userId, body.get("role"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    @PreAuthorize("@securityGuard.hasTeamRole(#teamId, 'TEAM_ADMIN')")
    public ResponseEntity<Void> removeMember(@PathVariable Long teamId, @PathVariable Long userId) {
        teamService.removeMember(teamId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/leave")
    @PreAuthorize("@securityGuard.isTeamMember(#teamId)")
    public ResponseEntity<Void> leaveTeam(@PathVariable Long teamId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        teamService.removeMember(teamId, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/boards")
    @PreAuthorize("@securityGuard.hasTeamRole(#teamId, 'TEAM_ADMIN')")
    public ResponseEntity<BoardResponse> createBoard(@PathVariable Long teamId, @RequestBody BoardRequest boardRequest) {
        boardRequest.setTeamId(teamId);
        BoardResponse createdBoard = boardService.create(boardRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBoard);
    }
    
    @GetMapping("/{teamId}/boards")
    @PreAuthorize("@securityGuard.isTeamMember(#teamId)")
    public ResponseEntity<List<BoardResponse>> getTeamBoards(@PathVariable Long teamId) {
        return ResponseEntity.ok(boardService.getByTeamId(teamId));
    }
}
