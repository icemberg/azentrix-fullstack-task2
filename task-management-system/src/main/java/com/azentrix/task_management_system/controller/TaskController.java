package com.azentrix.task_management_system.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.azentrix.task_management_system.dto.CardResponse;
import com.azentrix.task_management_system.service.interfaces.CardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final CardService cardService;

    @GetMapping
    public ResponseEntity<List<CardResponse>> getAllForCurrentUser() {
        log.info("Received request to fetch all tasks (cards) for current user");
        List<CardResponse> cards = cardService.getAllForCurrentUser();
        log.info("Successfully fetched {} tasks for current user", cards.size());
        return ResponseEntity.status(HttpStatus.OK).body(cards);
    }
}
