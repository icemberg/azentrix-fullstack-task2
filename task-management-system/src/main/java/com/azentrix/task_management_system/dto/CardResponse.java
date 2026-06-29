package com.azentrix.task_management_system.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.azentrix.task_management_system.enums.CardPriorityEnum;
import com.azentrix.task_management_system.enums.CardStateEnum;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardResponse {
    private Long id;
    private String title;
    private String description;
    private Long assigneeId;
    private LocalDateTime dueDate;
    private CardPriorityEnum priority;
    private String position;
    private List<String> labels;
    private CardStateEnum state;
    private Long boardId;
    private LocalDateTime updatedAt;
    private UserResponse user;
}
