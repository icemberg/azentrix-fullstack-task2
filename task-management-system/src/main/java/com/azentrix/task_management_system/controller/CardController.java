package com.azentrix.task_management_system.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.azentrix.task_management_system.dto.CardRequest;
import com.azentrix.task_management_system.dto.CardResponse;
import com.azentrix.task_management_system.dto.MoveCardRequest;
import com.azentrix.task_management_system.service.interfaces.CardService;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/v1/boards/{boardId}/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("@securityGuard.hasBoardAccess(#boardId)")
    public ResponseEntity<CardResponse> create(@PathVariable("boardId") Long boardId, @Valid @RequestBody CardRequest cardRequest) {
        log.info("Received request to create a new card for board ID: {}", boardId);
        cardRequest.setBoardId(boardId);
        CardResponse card = cardService.create(cardRequest);
        log.info("Successfully created card with ID: {}", card.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(card);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityGuard.hasBoardAccess(#boardId)")
    public ResponseEntity<CardResponse> getById(@PathVariable("boardId") Long boardId, @PathVariable("id") Long id) {
        log.info("Received request to fetch card with ID: {} for board: {}", id, boardId);
        CardResponse card = cardService.getById(id);
        log.info("Successfully fetched card with ID: {}", id);
        return ResponseEntity.status(HttpStatus.OK).body(card);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityGuard.canEditCard(#id)")
    public ResponseEntity<CardResponse> update(@PathVariable("boardId") Long boardId, @PathVariable("id") Long id,
            @Valid @RequestBody CardRequest cardRequest) {
        log.info("Received request to update card with ID: {} for board: {}", id, boardId);
        cardRequest.setBoardId(boardId);
        CardResponse card = cardService.update(id, cardRequest);
        log.info("Successfully updated card with ID: {}", id);
        return ResponseEntity.status(HttpStatus.OK).body(card);
    }
    
    @PutMapping("/{id}/move")
    @PreAuthorize("@securityGuard.canEditCard(#id)")
    public ResponseEntity<CardResponse> moveCard(@PathVariable("boardId") Long boardId, @PathVariable("id") Long id,
            @RequestBody MoveCardRequest request) {
        log.info("Received request to move card with ID: {} for board: {}", id, boardId);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElseThrow();
        CardResponse card = cardService.moveCard(boardId, id, request, currentUser.getUserId());
        return ResponseEntity.status(HttpStatus.OK).body(card);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityGuard.canEditCard(#id)")
    public ResponseEntity<Void> delete(@PathVariable("boardId") Long boardId, @PathVariable("id") Long id) {
        log.info("Received request to delete card with ID: {}", id);
        cardService.delete(id);
        log.info("Successfully deleted card with ID: {}", id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
