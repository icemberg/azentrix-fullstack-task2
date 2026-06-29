package com.azentrix.task_management_system.service.interfaces;

import com.azentrix.task_management_system.entity.Card;
import com.azentrix.task_management_system.entity.User;

public interface EmailService {
    void sendAssignmentEmail(User user, Card card);
    void sendInvitationEmail(String email, String token, String teamName, String inviterName);
}
