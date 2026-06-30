package com.azentrix.task_management_system.service.interfaces;

public interface TwoFactorAuthService {
    String generateNewSecret();
    String generateQrCodeImageUri(String secret, String email);
    boolean isOtpValid(String secret, String code);
    void enable2fa(String username, String secret, String code);
    void disable2fa(String username);
}
