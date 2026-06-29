package com.azentrix.task_management_system.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.azentrix.task_management_system.dto.BoardRequest;
import com.azentrix.task_management_system.dto.BoardResponse;
import com.azentrix.task_management_system.service.interfaces.BoardService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/v1/boards")
@Slf4j
@RequiredArgsConstructor
public class BoardController {
    
    private final BoardService boardService;

    @GetMapping("/{id}")
    @PreAuthorize("@securityGuard.hasBoardAccess(#id)")
    public ResponseEntity<BoardResponse> getById(@PathVariable long id) {
        log.info("Received request to fetch board with ID: {}", id);
        BoardResponse board = boardService.getById(id);
        log.info("Successfully fetched board with ID: {}", id);
        return ResponseEntity.status(HttpStatus.OK).body(board);
    }

    @GetMapping
    public ResponseEntity<List<BoardResponse>> getAll() {
        log.info("Received request to fetch all boards");
        List<BoardResponse> boards = boardService.getAll();
        log.info("Successfully fetched {} boards", boards.size());
        return ResponseEntity.status(HttpStatus.OK).body(boards);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityGuard.hasBoardAdminAccess(#id)")
    public ResponseEntity<BoardResponse> update(@PathVariable long id, @Valid @RequestBody BoardRequest boardRequest) {
        log.info("Received request to update board with ID: {}", id);
        BoardResponse updatedBoard = boardService.update(id, boardRequest);
        log.info("Successfully updated board with ID: {}", updatedBoard.getBoardId());
        return ResponseEntity.status(HttpStatus.OK).body(updatedBoard);
    }

}
