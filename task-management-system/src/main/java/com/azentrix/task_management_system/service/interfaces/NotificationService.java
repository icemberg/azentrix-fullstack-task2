package com.azentrix.task_management_system.service.interfaces;

import com.azentrix.task_management_system.entity.User;

public interface NotificationService {
    void createAndSendNotification(User user, String message, String type, String link);
}
