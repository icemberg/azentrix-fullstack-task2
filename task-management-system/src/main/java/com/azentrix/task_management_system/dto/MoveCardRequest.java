package com.azentrix.task_management_system.dto;

import com.azentrix.task_management_system.enums.CardStateEnum;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MoveCardRequest {
    @NotNull
    private Long cardId;

    @NotNull
    private Long boardId;

    @NotNull
    private CardStateEnum shift;

}
