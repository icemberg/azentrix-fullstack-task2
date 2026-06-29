package com.azentrix.task_management_system.service.interfaces;

import java.util.List;

import com.azentrix.task_management_system.dto.CardRequest;
import com.azentrix.task_management_system.dto.MoveCardRequest;
import com.azentrix.task_management_system.dto.CardResponse;

public interface CardService {
    CardResponse create(CardRequest cardRequest);
    CardResponse getById(Long id);
    List<CardResponse> getAllForCurrentUser();
    CardResponse update(Long id, CardRequest cardRequest);
    void delete(Long id);
    CardResponse moveCard(Long boardId, Long cardId, MoveCardRequest request, Long userId);
}
