package com.azentrix.task_management_system.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.azentrix.task_management_system.dto.BoardRequest;
import com.azentrix.task_management_system.dto.BoardResponse;
import com.azentrix.task_management_system.entity.Board;
import com.azentrix.task_management_system.entity.Card;
import com.azentrix.task_management_system.exception.AccessDeniedException;
import com.azentrix.task_management_system.exception.ResourceNotFoundException;
import com.azentrix.task_management_system.repository.BoardRepository;
import com.azentrix.task_management_system.repository.CardRepository;
import com.azentrix.task_management_system.repository.TeamRepository;
import com.azentrix.task_management_system.service.interfaces.BoardService;
import com.azentrix.task_management_system.service.interfaces.BoardBroadcastService;
import com.azentrix.task_management_system.mapper.EntityMapper;

import com.azentrix.task_management_system.entity.TeamMember;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.repository.TeamMemberRepository;
import com.azentrix.task_management_system.service.interfaces.NotificationService;
import com.azentrix.task_management_system.service.interfaces.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final TeamRepository teamRepository;
    private final BoardBroadcastService broadcastService;
    private final EntityMapper entityMapper;
    private final TeamMemberRepository teamMemberRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    @Transactional
    public BoardResponse create(BoardRequest boardRequest) {
        log.info("Attempting to create board with name: {}", boardRequest.getBoardname());

        Board board = new Board();
        board.setBoardname(boardRequest.getBoardname());
        board.setDescription(boardRequest.getDescription());
        
        if (boardRequest.getTeamId() != null) {
            board.setTeam(teamRepository.findById(boardRequest.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found")));
        } else {
            throw new IllegalArgumentException("teamId is required to create a board");
        }

        Board savedBoard = boardRepository.save(board);
        log.info("Board created successfully with ID: {}", savedBoard.getBoardId());
        broadcastService.broadcastBoardCreated(savedBoard);
        
        // Notify team members
        String creatorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        List<TeamMember> members = teamMemberRepository.findByTeamTeamId(board.getTeam().getTeamId());
        for (TeamMember member : members) {
            User user = member.getUser();
            if (!user.getUsername().equals(creatorUsername) && user.getPushBoardUpdates() != null && user.getPushBoardUpdates()) {
                String message = creatorUsername + " created a new board: " + savedBoard.getBoardname();
                String link = "/dashboard/boards/" + savedBoard.getBoardId();
                notificationService.createAndSendNotification(user, message, "BOARD_UPDATE", link);
                emailService.sendNotificationEmail(user.getEmail(), "New Board Created", message, link);
            }
        }

        return entityMapper.toBoardResponse(savedBoard, List.of());
    }

    @Override
    public BoardResponse getById(Long id) {
        log.info("Fetching board with ID: {}", id);
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Board not found with ID: {}", id);
                    return new ResourceNotFoundException("Board not found with id: " + id);
                });
        log.debug("Successfully fetched board: {}", board.getBoardname());
        List<Card> cards = cardRepository.findByBoard(board);
        return entityMapper.toBoardResponse(board, cards);
    }

    @Override
    public List<BoardResponse> getAll() {
        log.info("Fetching all boards from database");
        List<Board> boards = boardRepository.findAll();
        log.info("Retrieved {} boards", boards.size());
        return boards.stream().map(board -> entityMapper.toBoardResponse(board, null)).toList();
    }
    
    @Override
    public List<BoardResponse> getByTeamId(Long teamId) {
        log.info("Fetching boards for team: {}", teamId);
        List<Board> boards = boardRepository.findByTeamTeamId(teamId);
        return boards.stream().map(board -> entityMapper.toBoardResponse(board, null)).toList();
    }

    @Override
    @Transactional
    public BoardResponse update(long id, BoardRequest boardRequest) {
        log.info("Attempting to update board with ID: {}", id);

        Board board = boardRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Board not found"));
        log.debug("Existing board found, updating fields");
        board.setBoardname(boardRequest.getBoardname());
        board.setDescription(boardRequest.getDescription());

        Board savedBoard = boardRepository.save(board);
        log.info("Board updated successfully with ID: {}", savedBoard.getBoardId());
        broadcastService.broadcastBoardUpdated(savedBoard);
        log.debug("Board update broadcasted for ID: {}", savedBoard.getBoardId());
        return entityMapper.toBoardResponse(savedBoard, cardRepository.findByBoard(board));
    }
}
