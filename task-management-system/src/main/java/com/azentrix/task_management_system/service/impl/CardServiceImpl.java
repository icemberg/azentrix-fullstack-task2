package com.azentrix.task_management_system.service.impl;

import java.util.List;
import java.util.Map;

import com.azentrix.task_management_system.service.interfaces.BoardBroadcastService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.azentrix.task_management_system.exception.AccessDeniedException;
import com.azentrix.task_management_system.exception.ResourceNotFoundException;
import com.azentrix.task_management_system.exception.UnauthorizedException;
import com.azentrix.task_management_system.dto.CardRequest;
import com.azentrix.task_management_system.dto.MoveCardRequest;
import com.azentrix.task_management_system.dto.CardResponse;
import com.azentrix.task_management_system.entity.Board;
import com.azentrix.task_management_system.entity.Card;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.mapper.EntityMapper;
import com.azentrix.task_management_system.repository.BoardRepository;
import com.azentrix.task_management_system.repository.CardRepository;
import com.azentrix.task_management_system.repository.BoardRepository;
import com.azentrix.task_management_system.repository.UserRepository;
import com.azentrix.task_management_system.service.interfaces.CardService;
import com.azentrix.task_management_system.service.interfaces.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardServiceImpl implements CardService {

    private final CardRepository cardRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final BoardBroadcastService broadcastService;
    private final EntityMapper entityMapper;
    private final EmailService emailService;

    @Override
    @Transactional
    public CardResponse create(CardRequest cardRequest) {
        log.info("Attempting to create card for board ID: {}", cardRequest.getBoardId());
        String currentUsername = getCurrentUsername();
        log.debug("Current user for card creation: {}", currentUsername);

        Board board = boardRepository.findById(cardRequest.getBoardId())
                .orElseThrow(() -> {
                    log.error("Board not found with ID: {}", cardRequest.getBoardId());
                    return new ResourceNotFoundException("Board not found with id: " + cardRequest.getBoardId());
                });

        Card card = new Card();
        card.setTitle(cardRequest.getTitle());
        card.setDescription(cardRequest.getDescription());
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        card.setAssigneeId(cardRequest.getAssigneeId() != null ? cardRequest.getAssigneeId() : currentUser.getUserId());
        card.setDueDate(cardRequest.getDueDate());
        card.setPriority(cardRequest.getPriority());
        card.setPosition(cardRequest.getPosition());
        card.setLabels(cardRequest.getLabels());
        card.setState(cardRequest.getState());
        card.setBoard(board);
        card.setUser(currentUser);

        Card savedCard = cardRepository.save(card);
        log.info("Card created successfully with ID: {}", savedCard.getId());
        broadcastService.broadcastCardCreated(board.getBoardId(), savedCard);
        
        // Notify assignee if different from creator
        if (!currentUser.getUserId().equals(savedCard.getAssigneeId())) {
            userRepository.findById(savedCard.getAssigneeId()).ifPresent(assignee -> {
                emailService.sendAssignmentEmail(assignee, savedCard);
            });
        }
        
        log.debug("Card creation broadcasted for board ID: {}", board.getBoardId());
        return entityMapper.toCardResponse(savedCard);
    }

    @Override
    public CardResponse getById(Long id) {
        log.info("Fetching card with ID: {}", id);
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Card not found with ID: {}", id);
                    return new ResourceNotFoundException("Card not found with id: " + id);
                });

        ensureOwner(card);
        log.debug("Successfully fetched card: {}", card.getTitle());
        return entityMapper.toCardResponse(card);
    }

    @Override
    public List<CardResponse> getAllForCurrentUser() {
        log.info("Fetching all cards for current user");
        String currentUsername = getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Card> cards = cardRepository.findByAssigneeId(currentUser.getUserId());
        log.info("Retrieved {} cards for user: {}", cards.size(), currentUsername);
        return cards.stream().map(entityMapper::toCardResponse).toList();
    }

    @Override
    @Transactional
    public CardResponse update(Long id, CardRequest cardRequest) {
        log.info("Attempting to update card with ID: {}", id);
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Card not found with ID: {}", id);
                    return new ResourceNotFoundException("Card not found with id: " + id);
                });

        ensureOwner(card);
        log.debug("Ownership verified for card update");

        Board board = boardRepository.findById(cardRequest.getBoardId())
                .orElseThrow(() -> {
                    log.error("Board not found with ID: {}", cardRequest.getBoardId());
                    return new ResourceNotFoundException("Board not found with id: " + cardRequest.getBoardId());
                });

        log.debug("Updating card fields");
        card.setTitle(cardRequest.getTitle());
        card.setDescription(cardRequest.getDescription());
        Long oldAssignee = card.getAssigneeId();
        if(cardRequest.getAssigneeId() != null) card.setAssigneeId(cardRequest.getAssigneeId());
        card.setDueDate(cardRequest.getDueDate());
        card.setPriority(cardRequest.getPriority());
        card.setPosition(cardRequest.getPosition());
        card.setLabels(cardRequest.getLabels());
        card.setBoard(board);

        Card savedCard = cardRepository.save(card);
        log.info("Card updated successfully with ID: {}", savedCard.getId());
        broadcastService.broadcastCardUpdated(board.getBoardId(), savedCard);
        
        // Send email if assignee changed
        if (cardRequest.getAssigneeId() != null && !cardRequest.getAssigneeId().equals(oldAssignee)) {
            userRepository.findById(cardRequest.getAssigneeId()).ifPresent(assignee -> {
                emailService.sendAssignmentEmail(assignee, savedCard);
            });
        }
        
        log.debug("Card update broadcasted for board ID: {}", board.getBoardId());
        return entityMapper.toCardResponse(savedCard);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Attempting to delete card with ID: {}", id);
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Card not found with ID: {}", id);
                    return new ResourceNotFoundException("Card not found with id: " + id);
                });

        ensureOwner(card);
        log.debug("Ownership verified for card deletion");
        cardRepository.delete(card);
        log.info("Card deleted successfully with ID: {}", id);
        broadcastService.broadcastCardDeleted(card.getBoard().getBoardId(), id);
        log.debug("Card deletion broadcasted for board ID: {}", card.getBoard().getBoardId());
    }

    @Override
    @Transactional
    public CardResponse moveCard(Long boardId, Long cardId, MoveCardRequest request, Long userId) {
        log.info("Attempting to move card with ID: {} to new state: {}", cardId, request.getShift());
        Card card = cardRepository.findById(cardId).orElseThrow(() -> {
            log.error("Card not found with ID: {}", cardId);
            return new ResourceNotFoundException("Card not found with id: " + cardId);
        });
        
        if(userId != card.getUser().getUserId()) {
            log.warn("User ID {} is not allowed to move card ID: {}", userId, cardId);
            throw new AccessDeniedException("User not allowed to access this card with cardId: "+ cardId);
        }

        log.debug("Updating card state for ID: {}", cardId);
        card.setState(request.getShift());

        Card savedCard = cardRepository.save(card);
        log.info("Card state updated successfully for ID: {}", cardId);
        broadcastService.broadcastCardMoved(boardId, savedCard);
        log.debug("Card move broadcasted for board ID: {}", boardId);
        return entityMapper.toCardResponse(savedCard);
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("Authentication is null or user is not authenticated");
            throw new UnauthorizedException("User is not authenticated");
        }
        return authentication.getName();
    }

    private void ensureOwner(Card card) {
        String currentUsername = getCurrentUsername();
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!card.getAssigneeId().equals(currentUser.getUserId()) && !card.getUser().getUserId().equals(currentUser.getUserId())) {
            log.warn("User '{}' attempted to access card assigned to user ID '{}'", currentUsername, card.getAssigneeId());
            throw new AccessDeniedException("You can only manage your own cards");
        }
    }
}
