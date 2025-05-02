// src/main/java/com/projet/pp/config/CorsConfig.java
package com.projet.pp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry
                .addMapping("/api/**")                           // toutes les URLs commençant par /api/
                .allowedOrigins("http://localhost:4200")         // votre front Angular
                .allowedMethods("GET", "POST", "PUT", "PATCH",   // méthodes autorisées
                        "DELETE", "OPTIONS")
                .allowedHeaders("*")                             // tous les headers (X-User-Id, Content-Type…)
                .allowCredentials(true)                          // si vous utilisez cookies ou autorisation
                .maxAge(3600);                                   // cache de la pré-requête pendant 1 h
    }
}
