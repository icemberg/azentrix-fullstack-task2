package com.azentrix.task_management_system.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import com.azentrix.task_management_system.dto.CardRequest;
import com.azentrix.task_management_system.dto.MoveCardRequest;
import com.azentrix.task_management_system.service.interfaces.BoardService;
import com.azentrix.task_management_system.service.interfaces.CardService;

import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
@RequiredArgsConstructor
public class RealTimeBoardController {
    
    private final CardService cardService;
    private final BoardService boardService;

    @MessageMapping("/board/{boardId}/card.create")
    public void createCard(@DestinationVariable Long boardId, @Payload CardRequest cardRequest) {
        log.info("WebSocket request received to create card for board ID: {}", boardId);
        cardRequest.setBoardId(boardId);
        cardService.create(cardRequest);
        log.info("WebSocket request processed successfully for card creation on board ID: {}", boardId);
    }

    @MessageMapping("/board/{boardId}/card.update")
    public void updateCard(@DestinationVariable Long boardId, @Payload UpdateCardPayload payload) {
        log.info("WebSocket request received to update card ID: {} for board ID: {}", payload.getCardId(), boardId);
        payload.getCardRequest().setBoardId(boardId);
        cardService.update(payload.getCardId(), payload.getCardRequest());
        log.info("WebSocket request processed successfully for card update ID: {}", payload.getCardId());
    }

    @MessageMapping("/board/{boardId}/card.move")
    public void moveCard(@DestinationVariable Long boardId, @Payload MoveCardPayload payload) {
        log.info("WebSocket request received to move card ID: {} on board ID: {}", payload.getCardId(), boardId);
        cardService.moveCard(boardId, payload.getCardId(), payload.getMoveCardRequest(), payload.getUserId());
        log.info("WebSocket request processed successfully for card move ID: {}", payload.getCardId());
    }

    @MessageMapping("/board/{boardId}/card.delete")
    public void deleteCard(@DestinationVariable Long boardId, @Payload DeleteCardPayload payload) {
        log.info("WebSocket request received to delete card ID: {} on board ID: {}", payload.getCardId(), boardId);
        cardService.delete(payload.getCardId());
        log.info("WebSocket request processed successfully for card deletion ID: {}", payload.getCardId());
    }

    @Data
    public static class UpdateCardPayload {
        private Long cardId;
        private CardRequest cardRequest;
    }

    @Data
    public static class MoveCardPayload {
        private Long cardId;
        private Long userId;
        private MoveCardRequest moveCardRequest;
    }

    @Data
    public static class DeleteCardPayload {
        private Long cardId;
    }
}
