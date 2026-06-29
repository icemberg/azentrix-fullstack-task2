package com.azentrix.task_management_system.service.impl;

import com.azentrix.task_management_system.entity.Card;
import com.azentrix.task_management_system.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.azentrix.task_management_system.service.interfaces.EmailService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@azentrix.com}")
    private String fromEmail;

    public void sendAssignmentEmail(User user, Card card) {
        if (user.getEmailAssignments() != null && user.getEmailAssignments()) {
            String subject = "You have been assigned to a card: " + card.getTitle();
            String text = "Hello " + user.getUsername() + ",\n\n" +
                          "You have been assigned to the card '" + card.getTitle() + "' on board '" + card.getBoard().getBoardname() + "'.\n\n" +
                          "Description: " + card.getDescription() + "\n\n" +
                          "Thanks,\nTask Management System";
            sendEmail(user.getEmail(), subject, text);
        }
    }

    public void sendInvitationEmail(String email, String token, String teamName, String inviterName) {
        String subject = "You've been invited to join " + teamName;
        String text = "Hello,\n\n" +
                      inviterName + " has invited you to join their team '" + teamName + "' on the Task Management System.\n\n" +
                      "Click the link below to accept the invitation:\n" +
                      "http://localhost:5173/invite/" + token + "\n\n" + // Frontend URL
                      "Thanks,\nTask Management System";
        sendEmail(email, subject, text);
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }

    }
}
