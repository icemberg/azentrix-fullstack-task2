package com.azentrix.task_management_system.service.interfaces;

import java.util.List;
import com.azentrix.task_management_system.dto.InvitationDTO;
import com.azentrix.task_management_system.dto.TeamDTO;
import com.azentrix.task_management_system.entity.User;

public interface InvitationService {
    InvitationDTO createInvitation(Long teamId, String email, String role, User invitedBy);
    List<InvitationDTO> getPendingInvitations(Long teamId);
    void revokeInvitation(Long teamId, Long invitationId);
    InvitationDTO getInvitationByToken(String token);
    TeamDTO acceptInvitation(String token, User currentUser);
}
