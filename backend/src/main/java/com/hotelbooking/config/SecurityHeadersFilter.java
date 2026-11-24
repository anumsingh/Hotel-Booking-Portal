package com.hotelbooking.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Filter applying essential OWASP-recommended HTTP security headers
 * to all backend REST API responses.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (response instanceof HttpServletResponse httpResponse) {
            HttpServletRequest httpRequest = (HttpServletRequest) request;

            // 1. Prevent MIME-sniffing
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");

            // 2. Prevent clickjacking / framing
            httpResponse.setHeader("X-Frame-Options", "DENY");

            // 3. Referrer Policy: avoid leaking sensitive paths to external domains
            httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

            // 4. Content Security Policy for API surface
            httpResponse.setHeader("Content-Security-Policy",
                    "default-src 'none'; frame-ancestors 'none'; sandbox");

            // 5. Restrict browser feature policies
            httpResponse.setHeader("Permissions-Policy",
                    "camera=(), microphone=(), geolocation=(), payment=()");

            // 6. Strict Cache-Control for sensitive booking endpoints (PII & reservation data)
            String path = httpRequest.getRequestURI();
            if (path != null && (path.contains("/api/bookings") || path.contains("/lookup") || path.contains("/cancel"))) {
                httpResponse.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
                httpResponse.setHeader("Pragma", "no-cache");
                httpResponse.setHeader("Expires", "0");
            }
        }

        chain.doFilter(request, response);
    }
}
