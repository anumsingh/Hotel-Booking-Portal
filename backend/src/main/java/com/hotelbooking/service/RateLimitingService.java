package com.hotelbooking.service;

import com.hotelbooking.exception.RateLimitExceededException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * In-memory sliding window rate limiter.
 * Mitigates brute-force credential stuffing, enumeration, and denial-of-service attacks
 * against sensitive booking lookup and cancellation endpoints.
 */
@Service
public class RateLimitingService {

    private static class RequestWindow {
        private final Queue<Instant> timestamps = new ConcurrentLinkedQueue<>();
        private Instant blockedUntil = Instant.MIN;
        private int consecutiveFailures = 0;

        public synchronized boolean isBlocked() {
            return Instant.now().isBefore(blockedUntil);
        }

        public synchronized long getSecondsUntilUnblocked() {
            long diff = blockedUntil.getEpochSecond() - Instant.now().getEpochSecond();
            return Math.max(diff, 1);
        }

        public synchronized void recordFailure(int threshold, long lockoutSeconds) {
            consecutiveFailures++;
            if (consecutiveFailures >= threshold) {
                blockedUntil = Instant.now().plusSeconds(lockoutSeconds);
                consecutiveFailures = 0; // reset counter once blocked
            }
        }

        public synchronized void recordSuccess() {
            consecutiveFailures = 0;
        }

        public synchronized boolean tryAcquire(int maxRequests, long windowSeconds) {
            Instant now = Instant.now();
            Instant windowStart = now.minusSeconds(windowSeconds);

            // Remove timestamps outside the sliding window
            while (!timestamps.isEmpty() && timestamps.peek().isBefore(windowStart)) {
                timestamps.poll();
            }

            if (timestamps.size() >= maxRequests) {
                return false;
            }

            timestamps.add(now);
            return true;
        }
    }

    private final Map<String, RequestWindow> clientWindows = new ConcurrentHashMap<>();

    /**
     * Checks rate limits for general requests under a specific operation namespace.
     * Throws RateLimitExceededException if limit is exceeded.
     */
    public void checkRateLimit(String clientIp, String operation, int maxRequests, long windowSeconds) {
        String key = operation + ":" + sanitizeClientIp(clientIp);
        RequestWindow window = clientWindows.computeIfAbsent(key, k -> new RequestWindow());

        if (window.isBlocked()) {
            throw new RateLimitExceededException(
                    "Too many failed attempts. Temporary cooldown in effect. Please try again later.",
                    window.getSecondsUntilUnblocked()
            );
        }

        if (!window.tryAcquire(maxRequests, windowSeconds)) {
            throw new RateLimitExceededException(
                    "Rate limit exceeded for " + operation + ". Please wait before trying again.",
                    windowSeconds
            );
        }
    }

    public void recordFailure(String clientIp, String operation, int threshold, long lockoutSeconds) {
        String key = operation + ":" + sanitizeClientIp(clientIp);
        RequestWindow window = clientWindows.computeIfAbsent(key, k -> new RequestWindow());
        window.recordFailure(threshold, lockoutSeconds);
    }

    public void recordSuccess(String clientIp, String operation) {
        String key = operation + ":" + sanitizeClientIp(clientIp);
        RequestWindow window = clientWindows.get(key);
        if (window != null) {
            window.recordSuccess();
        }
    }

    private String sanitizeClientIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return "unknown";
        }
        return ip.trim();
    }
}
