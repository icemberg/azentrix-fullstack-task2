package com.azentrix.task_management_system.service.impl;

import com.azentrix.task_management_system.entity.Card;
import com.azentrix.task_management_system.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.azentrix.task_management_system.service.interfaces.EmailService;
import org.springframework.mail.javamail.JavaMailSender;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:taskflow.engine@gmail.com}")
    private String fromEmail;

    public void sendAssignmentEmail(User user, Card card) {
        if (user.getEmailAssignments() != null && user.getEmailAssignments()) {
            String subject = "You have been assigned to a card: " + card.getTitle();
            String text = "Hello " + user.getUsername() + ",\n\n" +
                    "You have been assigned to the card '" + card.getTitle() + "' on board '"
                    + card.getBoard().getBoardname() + "'.\n\n" +
                    "Description: " + card.getDescription() + "\n\n" +
                    "Thanks,\nTask Management System";
            sendEmail(user.getEmail(), subject, text, false);
        }
    }

    public void sendInvitationEmail(String email, String token, String teamName, String inviterName) {
        String subject = "You've been invited to join " + teamName + "!";
        String inviteLink = frontendUrl + "/invite/" + token;

        String html = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='utf-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
                "<style>" +
                "  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }"
                +
                "  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); }"
                +
                "  .header { background-color: #0f172a; padding: 32px 40px; text-align: center; border-bottom: 3px solid #3b82f6; }"
                +
                "  .logo { max-width: 48px; margin-bottom: 16px; }" +
                "  .header-title { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }"
                +
                "  .content { padding: 40px; color: #334155; line-height: 1.6; }" +
                "  .greeting { font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 24px; }"
                +
                "  .message { font-size: 16px; margin-bottom: 32px; }" +
                "  .highlight { font-weight: 600; color: #0f172a; }" +
                "  .button-container { text-align: center; margin: 40px 0; }" +
                "  .button { background-color: #3b82f6; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(59,130,246,0.25); transition: background-color 0.2s; }"
                +
                "  .button:hover { background-color: #2563eb; }" +
                "  .footer { padding: 24px 40px; text-align: center; font-size: 14px; color: #64748b; background-color: #f8fafc; border-top: 1px solid #e2e8f0; }"
                +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <img src='" + frontendUrl + "/favicon.svg' alt='TaskFlow Logo' class='logo'>" +
                "      <h1 class='header-title'>TaskFlow</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <h2 class='greeting'>Hello!</h2>" +
                "      <p class='message'><span class='highlight'>" + inviterName
                + "</span> has invited you to collaborate with them in <span class='highlight'>" + teamName
                + "</span>.</p>" +
                "      <p class='message'>Join them to start managing tasks, tracking progress, and achieving your goals together.</p>"
                +
                "      <div class='button-container'>" +
                "        <a href='" + inviteLink + "' class='button'>Accept Invitation</a>" +
                "      </div>" +
                "      <p style='font-size: 14px; color: #94a3b8; margin-top: 40px; margin-bottom: 0;'>If the button doesn't work, you can copy and paste this link into your browser:</p>"
                +
                "      <p style='font-size: 13px; color: #3b82f6; word-break: break-all; margin-top: 8px;'>"
                + inviteLink + "</p>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      &copy; 2026 TaskFlow. All rights reserved." +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";

        sendEmail(email, subject, html, true);
    }

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private void sendEmail(String to, String subject, String text, boolean isHtml) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(
                    message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, isHtml);

            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }
}
