package com.azentrix.task_management_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

import com.azentrix.task_management_system.entity.Board;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByTeamTeamId(Long teamId);
    long countByTeamTeamId(Long teamId);
}
