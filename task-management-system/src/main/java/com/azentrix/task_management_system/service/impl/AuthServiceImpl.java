package com.azentrix.task_management_system.service.impl;

import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.azentrix.task_management_system.exception.ResourceNotFoundException;
import com.azentrix.task_management_system.dto.LoginRequest;
import com.azentrix.task_management_system.dto.LoginResponse;
import com.azentrix.task_management_system.dto.RegisterRequest;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.entity.UserSession;
import com.azentrix.task_management_system.repository.RoleRepository;
import com.azentrix.task_management_system.repository.UserRepository;
import com.azentrix.task_management_system.repository.UserSessionRepository;
import com.azentrix.task_management_system.service.interfaces.AuthService;
import com.azentrix.task_management_system.service.interfaces.TeamService;
import com.azentrix.task_management_system.utils.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserSessionRepository userSessionRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final TeamService teamService;

    public LoginResponse login(LoginRequest loginRequest) {
        log.info("Attempting to authenticate user: {}", loginRequest.getUsername());
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), loginRequest.getPassword());

        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        log.debug("Authentication successful for user: {}", loginRequest.getUsername());

        // Store the verified authentication state inside the local Thread Context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);

        // Create and save UserSession
        String sessionId = UUID.randomUUID().toString();
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                .getRequest();

        if (user != null) {
            UserSession userSession = new UserSession();
            userSession.setSessionId(sessionId);
            userSession.setUser(user);
            userSession.setIpAddress(request.getRemoteAddr());
            userSession.setUserAgent(request.getHeader("User-Agent"));
            userSession.setLastActiveAt(LocalDateTime.now());
            userSessionRepository.save(userSession);
            log.info("Created new user session for user: {}", user.getUsername());
        }

        String jwtToken = jwtUtils.generateJwtToken(authentication, sessionId);
        log.debug("JWT token generated successfully for user: {}", loginRequest.getUsername());

        List<String> roles = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();

        log.info("User logged in successfully with role: {}", roles.get(0));
        String avatar = user != null ? user.getAvatar() : null;
        String email = user != null ? user.getEmail() : null;
        return new LoginResponse(jwtToken, userDetails.getUsername(), email, roles.get(0), avatar);
    }

    public User register(RegisterRequest registerRequest) {
        log.info("Attempting to register new user: {}", registerRequest.getUsername());
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encoder.encode(registerRequest.getPassword()));

        String role = registerRequest.getRole();
        log.debug("Requested role for new user: {}", role);

        if (role.equalsIgnoreCase("admin")) {
            user.setRole(roleRepository.findById(2L).orElseThrow(() -> {
                log.error("Admin role not found in database");
                return new ResourceNotFoundException("Role not found");
            }));
        } else {
            user.setRole(roleRepository.findById(1L).orElseThrow(() -> {
                log.error("User role not found in database");
                return new ResourceNotFoundException("Role not found");
            }));
        }

        User savedUser = userRepository.save(user);
        log.info("User successfully registered with ID: {}", savedUser.getUserId());

        // Auto-create personal workspace
        teamService.createTeam(savedUser.getUsername() + "'s Workspace", "Personal workspace", "#3b82f6", savedUser);
        log.info("Personal workspace auto-created for user: {}", savedUser.getUsername());

        return savedUser;
    }
}
