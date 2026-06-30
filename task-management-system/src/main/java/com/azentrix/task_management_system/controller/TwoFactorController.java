package com.azentrix.task_management_system.controller;

import com.azentrix.task_management_system.dto.Enable2faRequest;
import com.azentrix.task_management_system.dto.Generate2faResponse;
import com.azentrix.task_management_system.entity.User;
import com.azentrix.task_management_system.exception.ResourceNotFoundException;
import com.azentrix.task_management_system.repository.UserRepository;
import com.azentrix.task_management_system.service.interfaces.TwoFactorAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/2fa")
@RequiredArgsConstructor
public class TwoFactorController {

    private final TwoFactorAuthService twoFactorAuthService;
    private final UserRepository userRepository;

    @GetMapping("/generate")
    public ResponseEntity<Generate2faResponse> generateQrCode(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String secret = twoFactorAuthService.generateNewSecret();
        String qrCodeImageUri = twoFactorAuthService.generateQrCodeImageUri(secret, user.getEmail());

        return ResponseEntity.ok(new Generate2faResponse(secret, qrCodeImageUri));
    }

    @PostMapping("/enable")
    public ResponseEntity<String> enable2fa(@RequestBody Enable2faRequest request, Authentication authentication) {
        String username = authentication.getName();
        twoFactorAuthService.enable2fa(username, request.getSecret(), request.getCode());
        return ResponseEntity.ok("2FA enabled successfully");
    }

    @PostMapping("/disable")
    public ResponseEntity<String> disable2fa(Authentication authentication) {
        String username = authentication.getName();
        twoFactorAuthService.disable2fa(username);
        return ResponseEntity.ok("2FA disabled successfully");
    }
}
