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
import org.springframework.beans.factory.annotation.Value;

import com.azentrix.task_management_system.exception.ResourceNotFoundException;
import com.azentrix.task_management_system.dto.LoginRequest;
import com.azentrix.task_management_system.dto.LoginResponse;
import com.azentrix.task_management_system.dto.GoogleLoginRequest;
import com.azentrix.task_management_system.dto.RegisterRequest;
import com.azentrix.task_management_system.dto.Verify2faRequest;
import com.azentrix.task_management_system.entity.User;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
import com.azentrix.task_management_system.entity.UserSession;
import com.azentrix.task_management_system.repository.RoleRepository;
import com.azentrix.task_management_system.repository.UserRepository;
import com.azentrix.task_management_system.repository.UserSessionRepository;
import com.azentrix.task_management_system.service.interfaces.AuthService;
import com.azentrix.task_management_system.service.interfaces.TeamService;
import com.azentrix.task_management_system.service.interfaces.TwoFactorAuthService;
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
    private final TwoFactorAuthService twoFactorAuthService;

    @Value("${google.client.id}")
    private String googleClientId;

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

        if (user != null && user.getTwoFactorEnabled() != null && user.getTwoFactorEnabled()) {
            log.info("User {} requires 2FA verification", user.getUsername());
            return new LoginResponse(user.getUsername(), true);
        }

        return createSessionAndGenerateResponse(authentication, user, userDetails);
    }

    public LoginResponse verify2fa(Verify2faRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getTwoFactorEnabled() == null || !user.getTwoFactorEnabled()) {
            throw new RuntimeException("2FA is not enabled for this user");
        }

        if (!twoFactorAuthService.isOtpValid(user.getTwoFactorSecret(), request.getCode())) {
            throw new RuntimeException("Invalid 2FA code");
        }

        // We need an Authentication object to generate JWT. 
        // We will create a fresh one since the user has fully authenticated.
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
            user.getUsername(), user.getPassword(), 
            Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getName().name()))
        );
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return createSessionAndGenerateResponse(authentication, user, userDetails);
    }

    private LoginResponse createSessionAndGenerateResponse(Authentication authentication, User user, UserDetails userDetails) {
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
        log.debug("JWT token generated successfully for user: {}", userDetails.getUsername());

        List<String> roles = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();

        log.info("User logged in successfully with role: {}", roles.get(0));
        String avatar = user != null ? user.getAvatar() : null;
        String email = user != null ? user.getEmail() : null;
        return new LoginResponse(jwtToken, userDetails.getUsername(), email, roles.get(0), avatar, false);
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

    public LoginResponse googleLogin(GoogleLoginRequest request) {
        try {
            HttpTransport transport = new NetHttpTransport();
            JsonFactory jsonFactory = new GsonFactory();
            
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                .setAudience(Collections.singletonList(googleClientId))
                .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");
                
                User user = userRepository.findByEmail(email).orElse(null);
                if (user == null) {
                    // Register user automatically
                    user = new User();
                    user.setUsername(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 4));
                    user.setEmail(email);
                    user.setPassword(encoder.encode(UUID.randomUUID().toString())); // Random password
                    user.setAuthProvider("GOOGLE");
                    user.setAvatar(pictureUrl);
                    user.setRole(roleRepository.findById(1L).orElseThrow(() -> new ResourceNotFoundException("Role not found")));
                    user = userRepository.save(user);
                    teamService.createTeam(user.getUsername() + "'s Workspace", "Personal workspace", "#3b82f6", user);
                }

                UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                    user.getUsername(), user.getPassword(), 
                    Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getName().name()))
                );
                Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);

                return createSessionAndGenerateResponse(authentication, user, userDetails);
            } else {
                throw new RuntimeException("Invalid ID token.");
            }
        } catch (Exception e) {
            log.error("Google login failed", e);
            throw new RuntimeException("Google login failed", e);
        }
    }
}
