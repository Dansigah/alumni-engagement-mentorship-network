package com.pastpupils.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI alumniNetworkOpenApi() {
        String schemeName = "bearerAuth";
        return new OpenAPI().info(new Info().title("Alumni Engagement and Mentorship Network API").description(
                "REST API for users, mentorships, sessions, referrals, events, notifications and administration.")
                .version("1.0.0")).addSecurityItem(new SecurityRequirement().addList(schemeName))
                .components(new Components().addSecuritySchemes(schemeName, new SecurityScheme().name(schemeName)
                        .type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }
}
