package com.projet.pp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Autoriser tous les endpoints de projets
                        .requestMatchers("/api/projects/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()

                        // vos autres règles existantes...
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/projects/upload",
                                "/api/projects/**",
                                "/api/projects",
                                "/api/projects/tester/**",
                                "/api/assignments/**",
                                "/api/assignments/testing-projects",
                                "/api/chat/**" ,
                                "/api/projects/user/**",
                                "/api/users/**",
                                "/api/users/signup",
                                "/api/users/send-otp**",
                                "/api/users/verify-otp",
                                "/api/taches" ,
                                "/api/taches/create**",
                                "/api/taches/update/**",
                                "/api/taches/download",
                                "/api/test/stats",    // if you have thi
                                "/api/projects/stats**",
                                "/api/taches/stats**",
                                "/api/test/stats**",
                                "/api/users/devstats/**",    // Corrected pattern
                                "/api/users/testerstats/**",
                                "/api/users/testerstats**",
                                "/api/users/devstats**",
                                "/api/taches/stats/**",
                                "/api/projects/stats/tester/**",
                                "/api/assignments/stats/**",
                                "/api/users/testerstats**",
                                "/api/users/testerstats/**",
                                //"/api/notifications/user/**",
                                "/api/notifications/**"
                                //"/api/notifications/user**",
                                //"/api/notifications/user/**"

                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
