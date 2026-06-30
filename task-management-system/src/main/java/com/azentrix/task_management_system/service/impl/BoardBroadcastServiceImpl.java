package com.azentrix.task_management_system.service.impl;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.azentrix.task_management_system.dto.WebSocketEvent;
import com.azentrix.task_management_system.entity.Board;
import com.azentrix.task_management_system.entity.Card;
import com.azentrix.task_management_system.service.interfaces.BoardBroadcastService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardBroadcastServiceImpl implements BoardBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void broadcastCardCreated(Long boardId, Card card) {
        log.debug("Broadcasting CARD_CREATED event for card ID: {} on board ID: {}", card.getId(), boardId);
        sendEvent(boardId, new WebSocketEvent("CARD_CREATED", card.getId()));
        log.info("Broadcasted CARD_CREATED for board ID: {}", boardId);
    }

    @Override
    public void broadcastCardUpdated(Long boardId, Card card) {
        log.debug("Broadcasting CARD_UPDATED event for card ID: {} on board ID: {}", card.getId(), boardId);
        sendEvent(boardId, new WebSocketEvent("CARD_UPDATED", card.getId()));
        log.info("Broadcasted CARD_UPDATED for board ID: {}", boardId);
    }

    @Override
    public void broadcastCardDeleted(Long boardId, Long cardId) {
        log.debug("Broadcasting CARD_DELETED event for card ID: {} on board ID: {}", cardId, boardId);
        sendEvent(boardId, new WebSocketEvent("CARD_DELETED", cardId));
        log.info("Broadcasted CARD_DELETED for board ID: {}", boardId);
    }

    @Override
    public void broadcastCardMoved(Long boardId, Card card) {
        log.debug("Broadcasting CARD_MOVED event for card ID: {} on board ID: {}", card.getId(), boardId);
        sendEvent(boardId, new WebSocketEvent("CARD_MOVED", card.getId()));
        log.info("Broadcasted CARD_MOVED for board ID: {}", boardId);
    }

    @Override
    public void broadcastBoardCreated(Board board) {
        log.debug("Broadcasting BOARD_CREATED event for board ID: {}", board.getBoardId());
        sendTeamEvent(board.getTeam().getTeamId(), new WebSocketEvent("BOARD_CREATED", board.getBoardId()));
        log.info("Broadcasted BOARD_CREATED for board ID: {}", board.getBoardId());
    }

    @Override
    public void broadcastBoardUpdated(Board board) {
        log.debug("Broadcasting BOARD_UPDATED event for board ID: {}", board.getBoardId());
        sendEvent(board.getBoardId(), new WebSocketEvent("BOARD_UPDATED", board.getBoardId()));
        sendTeamEvent(board.getTeam().getTeamId(), new WebSocketEvent("BOARD_UPDATED", board.getBoardId()));
        log.info("Broadcasted BOARD_UPDATED for board ID: {}", board.getBoardId());
    }
    
    @Override
    public void broadcastBoardDeleted(Long teamId, Long boardId) {
        log.debug("Broadcasting BOARD_DELETED event for board ID: {}", boardId);
        sendTeamEvent(teamId, new WebSocketEvent("BOARD_DELETED", boardId));
        log.info("Broadcasted BOARD_DELETED for board ID: {}", boardId);
    }

    private void sendEvent(Long boardId, WebSocketEvent event) {
        log.debug("Sending STOMP message to /topic/board/{} with event type: {}", boardId, event.getType());
        Runnable sendTask = () -> messagingTemplate.convertAndSend("/topic/board/" + boardId, event);
        
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendTask.run();
                }
            });
        } else {
            sendTask.run();
        }
    }
    
    private void sendTeamEvent(Long teamId, WebSocketEvent event) {
        log.debug("Sending STOMP message to /topic/team/{} with event type: {}", teamId, event.getType());
        Runnable sendTask = () -> messagingTemplate.convertAndSend("/topic/team/" + teamId, event);
        
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendTask.run();
                }
            });
        } else {
            sendTask.run();
        }
    }
}
