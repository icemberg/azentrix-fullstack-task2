package com.azentrix.task_management_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import com.azentrix.task_management_system.entity.Board;
import com.azentrix.task_management_system.entity.Card;

import jakarta.transaction.Transactional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByAssigneeId(Long assigneeId);

    List<Card> findByDueDateBetweenAndDueNotificationSentFalse(LocalDateTime start, LocalDateTime end);

    List<Card> findByBoard(Board board);

    @Modifying
    @Transactional
    @Query("UPDATE Card c SET c.state = :state WHERE c.id = :cardId and c.board.id = :boardId")
    void updateCardState(@Param("cardId") Long cardId, @Param("boardId") Long boardId, @Param("state") String state);

}
