package com.azentrix.task_management_system.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.azentrix.task_management_system.enums.CardPriorityEnum;
import com.azentrix.task_management_system.enums.CardStateEnum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CardRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    @NotNull(message = "Priority is required")
    private CardPriorityEnum priority;

    @NotNull(message = "Board id is required")
    private Long boardId;

    private Long assigneeId;

    private String position;

    private List<String> labels;

    @NotNull(message = "State is required")
    private CardStateEnum state;
}
