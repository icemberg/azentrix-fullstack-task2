package com.azentrix.task_management_system.service.interfaces;

import java.util.List;

import com.azentrix.task_management_system.dto.BoardRequest;
import com.azentrix.task_management_system.dto.BoardResponse;

public interface BoardService {
    public BoardResponse create(BoardRequest boardRequest);

    public BoardResponse getById(Long id);

    public List<BoardResponse> getAll();
    
    public List<BoardResponse> getByTeamId(Long teamId);

    public BoardResponse update(long id, BoardRequest boardRequest);

    
}
