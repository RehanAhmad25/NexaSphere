package org.nexasphere.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.nexasphere.model.TokenSession;
import org.nexasphere.service.AdminAuthService;
import org.nexasphere.service.LoginRateLimitService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Validated
public class AdminController {

    private final AdminAuthService adminAuthService;
    private final LoginRateLimitService rateLimitService;
    private final org.nexasphere.service.LoginAttemptService loginAttemptService;

    public AdminController(AdminAuthService adminAuthService, LoginRateLimitService rateLimitService, org.nexasphere.service.LoginAttemptService loginAttemptService) {
        this.adminAuthService = adminAuthService;
        this.rateLimitService = rateLimitService;
        this.loginAttemptService = loginAttemptService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        String clientIp = getClientIp(servletRequest);
        
        // 1. IP-level sheer volume rate limiting
        if (!rateLimitService.tryConsume(clientIp)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many requests. Please try again later.");
        }
        
        // 2. Brute-force failure lockout protection
        if (loginAttemptService.isBlocked(clientIp)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many failed login attempts. Please try again later.");
        }

        try {
            TokenSession session = adminAuthService.login(request.email().trim(), request.password());
            // Clear failed attempts on success
            loginAttemptService.loginSucceeded(clientIp);
            return new LoginResponse(session.token(), session.sessionInfo().email());
        } catch (ResponseStatusException e) {
            // Track failed attempts for invalid credentials
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                loginAttemptService.loginFailed(clientIp);
            }
            throw e;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @PostMapping("/logout")
    public Map<String, Boolean> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            adminAuthService.logout(token);
        }
        return Collections.singletonMap("ok", true);
    }

    @GetMapping("/me")
    public Map<String, String> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return Collections.singletonMap("email", auth.getName());
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Collections.singletonMap("status", "ok");
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {
    }

    public record LoginResponse(String token, String email) {
    }
}
