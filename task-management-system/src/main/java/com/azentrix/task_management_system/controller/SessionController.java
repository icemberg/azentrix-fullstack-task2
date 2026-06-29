package com.azentrix.task_management_system.controller;

import com.azentrix.task_management_system.dto.SessionResponse;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.entity.UserSession;
import com.azentrix.task_management_system.repository.UserRepository;
import com.azentrix.task_management_system.repository.UserSessionRepository;
import com.azentrix.task_management_system.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final UserSessionRepository userSessionRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<SessionResponse>> getActiveSessions(HttpServletRequest request) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        
        String jwt = parseJwt(request);
        String currentSessionId = jwt != null ? jwtUtils.getSessionIdFromJwtToken(jwt) : null;

        List<UserSession> sessions = userSessionRepository.findByUser_UserIdAndActiveTrueOrderByLastActiveAtDesc(user.getUserId());
        
        List<SessionResponse> responses = sessions.stream().map(session -> SessionResponse.builder()
                .sessionId(session.getSessionId())
                .ipAddress(session.getIpAddress())
                .userAgent(session.getUserAgent())
                .lastActiveAt(session.getLastActiveAt())
                .isCurrentSession(session.getSessionId().equals(currentSessionId))
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> revokeSession(@PathVariable String sessionId, HttpServletRequest request) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        Optional<UserSession> sessionOpt = userSessionRepository.findBySessionId(sessionId);
        if (sessionOpt.isPresent()) {
            UserSession session = sessionOpt.get();
            // Ensure the session belongs to the current user
            if (session.getUser().getUserId().equals(user.getUserId())) {
                session.setActive(false);
                userSessionRepository.save(session);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(403).body("Access Denied");
            }
        }
        return ResponseEntity.notFound().build();
    }
}
