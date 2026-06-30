package com.azentrix.task_management_system.service.impl;

import com.azentrix.task_management_system.entity.Notification;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.azentrix.task_management_system.service.interfaces.NotificationService;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void createAndSendNotification(User user, String message, String type, String link) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setLink(link);
        notification = notificationRepository.save(notification);

        // Send via WebSocket to the specific user's topic
        messagingTemplate.convertAndSend("/topic/user/" + user.getUserId() + "/notifications", notification);
    }
}
