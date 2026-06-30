package com.azentrix.task_management_system.service.impl;

import com.azentrix.task_management_system.entity.Card;
import com.azentrix.task_management_system.repository.CardRepository;
import com.azentrix.task_management_system.service.interfaces.EmailService;
import com.azentrix.task_management_system.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import com.azentrix.task_management_system.service.interfaces.TaskSchedulerService;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskSchedulerServiceImpl implements TaskSchedulerService {

    private final CardRepository cardRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 * * * *") // Run at the top of every hour
    public void sendDueDateReminders() {
        log.info("Running scheduled due date reminders check...");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next24Hours = now.plusHours(24);

        // Fetch cards that are due in exactly 24 hours (within the next hour)
        List<Card> dueCards = cardRepository.findByDueDateBetweenAndDueNotificationSentFalse(now, next24Hours);
        for (Card card : dueCards) {
            if (card.getUser() != null && card.getUser().getPushDueReminders() != null && card.getUser().getPushDueReminders()) {
                String message = "Your task '" + card.getTitle() + "' is due soon.";
                String link = "/dashboard/boards/" + card.getBoard().getBoardId();
                notificationService.createAndSendNotification(card.getUser(), message, "DUE_REMINDER", link);
                emailService.sendNotificationEmail(card.getUser().getEmail(), "Task Due Reminder: " + card.getTitle(), message, link);
                card.setDueNotificationSent(true);
                cardRepository.save(card);
            }
        }
    }
}
