package com.hotelbooking.security;

import com.hotelbooking.config.SecurityHeadersFilter;
import com.hotelbooking.dto.BookingRequestDto;
import com.hotelbooking.exception.RateLimitExceededException;
import com.hotelbooking.service.BookingVerificationService;
import com.hotelbooking.service.RateLimitingService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecurityHardeningTest {

    private Validator validator;
    private BookingVerificationService verificationService;
    private RateLimitingService rateLimitingService;
    private SecurityHeadersFilter securityHeadersFilter;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
        verificationService = new BookingVerificationService();
        rateLimitingService = new RateLimitingService();
        securityHeadersFilter = new SecurityHeadersFilter();
    }

    @Test
    @DisplayName("Security: Verification session token is valid for correct credentials and single-use")
    void testVerificationSessionLifecycle() {
        String ref = "THB-20261124-ABC123";
        String email = "guest@example.com";

        // 1. Issue session token
        String token = verificationService.createSession(ref, email);
        assertNotNull(token);
        assertEquals(64, token.length()); // 32 bytes hex encoded

        // 2. Validate token matches exact reference and email
        assertTrue(verificationService.validateSession(token, ref, email));
        assertFalse(verificationService.validateSession(token, ref, "attacker@example.com"));
        assertFalse(verificationService.validateSession(token, "THB-OTHER-999999", email));
        assertFalse(verificationService.validateSession("invalid-token", ref, email));

        // 3. Invalidate token (single-use upon cancellation)
        verificationService.invalidateSession(token);
        assertFalse(verificationService.validateSession(token, ref, email));
    }

    @Test
    @DisplayName("Security: Rate limiter enforces request caps and temporary lockout on brute force")
    void testRateLimiterEnforcement() {
        String ip = "192.168.1.100";
        String op = "test-lookup";

        // Allow 3 requests in 10 seconds
        assertDoesNotThrow(() -> rateLimitingService.checkRateLimit(ip, op, 3, 10));
        assertDoesNotThrow(() -> rateLimitingService.checkRateLimit(ip, op, 3, 10));
        assertDoesNotThrow(() -> rateLimitingService.checkRateLimit(ip, op, 3, 10));

        // 4th request must throw RateLimitExceededException
        assertThrows(RateLimitExceededException.class, () ->
                rateLimitingService.checkRateLimit(ip, op, 3, 10)
        );

        // Lockout mechanism: 2 failures trigger 60s lockout
        String bruteIp = "10.0.0.99";
        rateLimitingService.recordFailure(bruteIp, "auth", 2, 60);
        rateLimitingService.recordFailure(bruteIp, "auth", 2, 60);

        RateLimitExceededException ex = assertThrows(RateLimitExceededException.class, () ->
                rateLimitingService.checkRateLimit(bruteIp, "auth", 10, 60)
        );
        assertTrue(ex.getMessage().contains("Temporary cooldown in effect"));
    }

    @Test
    @DisplayName("Security: SecurityHeadersFilter applies OWASP security headers & no-store on sensitive paths")
    void testSecurityHeadersApplied() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/bookings/lookup");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        securityHeadersFilter.doFilter(request, response, chain);

        assertEquals("nosniff", response.getHeader("X-Content-Type-Options"));
        assertEquals("DENY", response.getHeader("X-Frame-Options"));
        assertEquals("strict-origin-when-cross-origin", response.getHeader("Referrer-Policy"));
        assertTrue(response.getHeader("Cache-Control").contains("no-store"));
        assertTrue(response.getHeader("Cache-Control").contains("no-cache"));
        assertTrue(response.getHeader("Content-Security-Policy").contains("default-src 'none'"));
        verify(chain, times(1)).doFilter(request, response);
    }

    @Test
    @DisplayName("Security: Input validation rejects XSS / HTML payloads in guestName")
    void testXssPayloadRejectedInValidation() {
        BookingRequestDto dto = new BookingRequestDto(
                1L,
                1L,
                "<script>alert('xss')</script>",
                "guest@example.com",
                LocalDate.now().plusDays(2),
                LocalDate.now().plusDays(4)
        );

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Guest name contains invalid characters")));
    }
}
