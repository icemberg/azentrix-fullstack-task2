package com.azentrix.task_management_system.service.interfaces;

import com.azentrix.task_management_system.entity.Board;
import com.azentrix.task_management_system.entity.Card;

public interface BoardBroadcastService {
    void broadcastCardCreated(Long boardId, Card card);
    void broadcastCardUpdated(Long boardId, Card card);
    void broadcastCardDeleted(Long boardId, Long cardId);
    void broadcastCardMoved(Long boardId, Card card);
    void broadcastBoardCreated(Board board);
    void broadcastBoardUpdated(Board board);
    void broadcastBoardDeleted(Long teamId, Long boardId);
}
