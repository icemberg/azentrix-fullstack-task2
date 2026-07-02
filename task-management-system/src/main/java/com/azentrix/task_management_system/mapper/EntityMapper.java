package com.azentrix.task_management_system.mapper;

import com.azentrix.task_management_system.dto.BoardResponse;
import com.azentrix.task_management_system.dto.CardResponse;
import com.azentrix.task_management_system.dto.UserResponse;
import com.azentrix.task_management_system.entity.Board;
import com.azentrix.task_management_system.entity.Card;
import com.azentrix.task_management_system.entity.User;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;

import com.azentrix.task_management_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class EntityMapper {

    @Autowired
    private UserRepository userRepository;

    public UserResponse toUserResponse(User user) {
        if (user == null)
            return null;
        return UserResponse.builder()
                .id(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .role(user.getRole() != null ? user.getRole().getName().toString() : "")
                .theme(user.getTheme())
                .defaultView(user.getDefaultView())
                .startOfWeek(user.getStartOfWeek())
                .emailMentions(Optional.ofNullable(user.getEmailMentions()).orElse(false))
                .emailAssignments(Optional.ofNullable(user.getEmailAssignments()).orElse(false))
                .pushDueReminders(Optional.ofNullable(user.getPushDueReminders()).orElse(false))
                .pushBoardUpdates(Optional.ofNullable(user.getPushBoardUpdates()).orElse(false))
                .twoFactorEnabled(Optional.ofNullable(user.getTwoFactorEnabled()).orElse(false))
                .build();
    }

    public CardResponse toCardResponse(Card card) {
        if (card == null)
            return null;
        CardResponse response = CardResponse.builder()
                .id(card.getId())
                .title(card.getTitle())
                .description(card.getDescription())
                .assigneeId(card.getAssigneeId())
                .dueDate(card.getDueDate())
                .priority(card.getPriority())
                .position(card.getPosition())
                .labels(card.getLabels())
                .state(card.getState())
                .boardId(card.getBoard() != null ? card.getBoard().getBoardId() : null)
                .boardName(card.getBoard() != null ? card.getBoard().getBoardname() : null)
                .updatedAt(card.getUpdatedAt())
                .createdBy(card.getUser() != null ? card.getUser().getUserId() : null)
                .user(toUserResponse(card.getUser()))
                .build();

        if (response.getAssigneeId() != null) {
            userRepository.findById(response.getAssigneeId()).ifPresent(u -> {
                response.setAssigneeUsername(u.getUsername());
                response.setAssigneeAvatar(u.getAvatar());
            });
        }
        
        return response;
    }

    public BoardResponse toBoardResponse(Board board, List<Card> cards) {
        if (board == null)
            return null;

        List<CardResponse> cardResponses = cards != null ? cards.stream().map(this::toCardResponse).toList()
                : new ArrayList<>();

        return BoardResponse.builder()
                .boardId(board.getBoardId())
                .boardname(board.getBoardname())
                .description(board.getDescription())
                .updatedAt(board.getUpdatedAt() != null ? board.getUpdatedAt() : board.getCreatedAt())
                .cards(cardResponses)
                .build();
    }
}
