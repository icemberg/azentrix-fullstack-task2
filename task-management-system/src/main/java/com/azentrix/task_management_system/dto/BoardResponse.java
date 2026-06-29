package com.azentrix.task_management_system.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardResponse {
    private Long boardId;
    private String boardname;
    private String description;
    private LocalDateTime updatedAt;
    private List<CardResponse> cards;
}
