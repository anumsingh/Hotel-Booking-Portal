package com.hotelbooking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Hardened CORS Configuration.
 * Restricts access strictly to authorized frontend origins,
 * explicit HTTP methods, and safe headers. Wildcards with credentials are disallowed.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:4200",
                        "http://127.0.0.1:4200"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders(
                        "Content-Type",
                        "Accept",
                        "Authorization",
                        "X-Requested-With",
                        "Origin"
                )
                .exposedHeaders("Retry-After")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
