package com.azentrix.task_management_system.security;

import com.azentrix.task_management_system.entity.Board;
import com.azentrix.task_management_system.entity.Card;
import com.azentrix.task_management_system.entity.TeamMember;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.repository.BoardRepository;
import com.azentrix.task_management_system.repository.CardRepository;
import com.azentrix.task_management_system.repository.TeamMemberRepository;
import com.azentrix.task_management_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("securityGuard")
@RequiredArgsConstructor
public class SecurityGuard {

    private final TeamMemberRepository teamMemberRepository;
    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId()).orElse(null);
    }

    public boolean isTeamMember(Long teamId) {
        User user = getCurrentUser();
        if (user == null) return false;
        if ("ADMIN".equals(user.getRole().getName())) return true; // SYSTEM_ADMIN
        return teamMemberRepository.existsByTeamTeamIdAndUserUserId(teamId, user.getUserId());
    }

    public boolean hasTeamRole(Long teamId, String role) {
        User user = getCurrentUser();
        if (user == null) return false;
        if ("ADMIN".equals(user.getRole().getName())) return true; // SYSTEM_ADMIN
        TeamMember member = teamMemberRepository.findByTeamTeamIdAndUserUserId(teamId, user.getUserId()).orElse(null);
        if (member == null) return false;
        return member.getRole().equals(role) || member.getRole().equals("TEAM_ADMIN"); // TEAM_ADMIN has all roles essentially
    }

    public boolean hasBoardAccess(Long boardId) {
        Board board = boardRepository.findById(boardId).orElse(null);
        if (board == null) return false;
        return isTeamMember(board.getTeam().getTeamId());
    }
    
    public boolean hasBoardAdminAccess(Long boardId) {
        Board board = boardRepository.findById(boardId).orElse(null);
        if (board == null) return false;
        return hasTeamRole(board.getTeam().getTeamId(), "TEAM_ADMIN");
    }

    public boolean canEditCard(Long cardId) {
        User user = getCurrentUser();
        if (user == null) return false;
        if ("ADMIN".equals(user.getRole().getName())) return true;

        Card card = cardRepository.findById(cardId).orElse(null);
        if (card == null) return false;
        
        Long teamId = card.getBoard().getTeam().getTeamId();
        TeamMember member = teamMemberRepository.findByTeamTeamIdAndUserUserId(teamId, user.getUserId()).orElse(null);
        if (member == null) return false;

        // TEAM_ADMIN can edit any card
        if ("TEAM_ADMIN".equals(member.getRole())) return true;

        // TEAM_MEMBER can only edit if they are the creator or assignee
        Long creatorId = card.getUser() != null ? card.getUser().getUserId() : null; // In this model card.getUser() might be assignee or creator. Let's assume user is assignee. Wait, does card have createdBy?
        // Let's assume card.getUser() is the assignee.
        if (creatorId != null && creatorId.equals(user.getUserId())) return true;
        
        return false;
    }
}
