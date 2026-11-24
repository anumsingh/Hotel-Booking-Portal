package com.hotelbooking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service managing cryptographically secure, short-lived server-side verification sessions.
 * Guarantees that sensitive actions (such as reservation cancellation) can only be executed
 * by a guest who has verified ownership within the last 15 minutes.
 */
@Service
public class BookingVerificationService {

    private static final Logger log = LoggerFactory.getLogger(BookingVerificationService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final long SESSION_EXPIRY_SECONDS = 900; // 15 minutes

    public static class VerificationSession {
        private final String bookingReference;
        private final String guestEmail;
        private final Instant expiresAt;

        public VerificationSession(String bookingReference, String guestEmail, Instant expiresAt) {
            this.bookingReference = bookingReference;
            this.guestEmail = guestEmail;
            this.expiresAt = expiresAt;
        }

        public String getBookingReference() {
            return bookingReference;
        }

        public String getGuestEmail() {
            return guestEmail;
        }

        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private final Map<String, VerificationSession> sessionStore = new ConcurrentHashMap<>();

    /**
     * Issues a new 32-byte (64 hex characters) cryptographic verification token
     * bound to the verified booking reference and email.
     */
    public String createSession(String bookingReference, String guestEmail) {
        cleanupExpiredSessions();

        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String token = HexFormat.of().formatHex(randomBytes);

        VerificationSession session = new VerificationSession(
                bookingReference.trim(),
                guestEmail.trim().toLowerCase(),
                Instant.now().plusSeconds(SESSION_EXPIRY_SECONDS)
        );

        sessionStore.put(token, session);
        return token;
    }

    /**
     * Verifies that the token exists, has not expired, and belongs to the exact reference and email.
     */
    public boolean validateSession(String token, String bookingReference, String guestEmail) {
        if (token == null || token.isBlank()) {
            return false;
        }

        VerificationSession session = sessionStore.get(token.trim());
        if (session == null) {
            return false;
        }

        if (session.isExpired()) {
            sessionStore.remove(token.trim());
            return false;
        }

        boolean referenceMatches = session.getBookingReference().equalsIgnoreCase(bookingReference.trim());
        boolean emailMatches = session.getGuestEmail().equalsIgnoreCase(guestEmail.trim());

        return referenceMatches && emailMatches;
    }

    /**
     * Invalidates a session token upon successful completion of a sensitive operation (single-use pattern).
     */
    public void invalidateSession(String token) {
        if (token != null) {
            sessionStore.remove(token.trim());
        }
    }

    private void cleanupExpiredSessions() {
        sessionStore.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}
