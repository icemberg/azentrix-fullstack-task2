package com.azentrix.task_management_system.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import org.springframework.stereotype.Component;

@Component
public class JwtUtils {
    
    @Value("${azentrix.app.jwtSecret}")
    private String jwtSecret;

    @Value("${azentrix.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    // Helper method to convert your text secret into a secure cryptographic Key object
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generates a signed JWT token string based on verified user authentication
     */
    public String generateJwtToken(Authentication authentication, String sessionId) {
        // Extract the principal user details built by your custom UserDetailsService
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername()) // Sets the tracking identity (username)
                .claim("sessionId", sessionId) // Embed the session id
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Sets expiry window
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Encrypts signature with HMAC-SHA256
                .compact();
    }

    /**
     * Helper method to parse out the Username identity back from an incoming token string
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Helper method to parse out the sessionId from an incoming token string
     */
    public String getSessionIdFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("sessionId", String.class);
    }

    /**
     * Validates if an incoming token is un-tampered, matching our secret key, and not expired
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // In production, log these errors cleanly via an SLF4J Logger
            System.out.println("Invalid JWT Token validation fault: " + e.getMessage());
        }
        return false;
    }
}
