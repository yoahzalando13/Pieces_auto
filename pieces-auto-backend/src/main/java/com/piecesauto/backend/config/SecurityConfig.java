package com.piecesauto.backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.piecesauto.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserRepository userRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

        // =========================
        // PUBLIC
        // =========================
        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
        .requestMatchers("/api/auth/**").permitAll()
        .requestMatchers("/uploads/**").permitAll()
        .requestMatchers("/api/vehicules/**").permitAll()

        // Routes produits sensibles AVANT /api/products/**
        .requestMatchers("/api/products/seller/**").hasRole("VENDEUR")

        .requestMatchers(
                org.springframework.http.HttpMethod.PUT,
                "/api/products/*/image-tags"
        ).hasAnyRole("ADMIN", "VENDEUR")

        .requestMatchers(
                org.springframework.http.HttpMethod.POST,
                "/api/products/*/upload-image"
        ).hasAnyRole("ADMIN", "VENDEUR")

        // Routes produits publiques APRÈS les routes sensibles
        .requestMatchers("/api/products/**").permitAll()

        .requestMatchers(HttpMethod.POST, "/api/sellers/shop").hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/sellers/shops/**").permitAll()

        .requestMatchers("/api/group-buys/open/**").permitAll()
        .requestMatchers("/api/group-buys/completed/**").permitAll()
        .requestMatchers("/api/group-buys/product/**").permitAll()
        .requestMatchers(
                org.springframework.http.HttpMethod.GET,
                "/api/group-buys/*"
        ).permitAll()

        .requestMatchers(
                org.springframework.http.HttpMethod.GET,
                "/api/reviews/product/**"
        ).permitAll()

        // =========================
        // CLIENT / USER CONNECTÉ
        // =========================
        .requestMatchers("/api/cart/**").hasAnyRole("CLIENT", "VENDEUR")

        .requestMatchers("/api/orders/checkout").hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/orders/my/**").hasAnyRole("CLIENT", "VENDEUR")

        .requestMatchers("/api/payments/pay/**").hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/payments/fail/**").hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/payments/my/**").hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/payments/order/**").hasAnyRole("CLIENT", "VENDEUR")

        .requestMatchers("/api/deliveries/create/**").hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/deliveries/my/**").hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/deliveries/order/**").hasAnyRole("CLIENT", "VENDEUR")

        .requestMatchers(
                org.springframework.http.HttpMethod.POST,
                "/api/reviews/product/**"
        ).hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/reviews/my/**").hasAnyRole("CLIENT", "VENDEUR")

        .requestMatchers("/api/group-buys/create/**").hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/group-buys/*/join").hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/group-buys/my/**").hasAnyRole("CLIENT", "VENDEUR")
        .requestMatchers("/api/group-buys/*/cancel").hasAnyRole("CLIENT", "VENDEUR")

        .requestMatchers("/api/notifications/**").hasAnyRole("CLIENT", "VENDEUR")

        .requestMatchers("/api/recommendations/**")
        .hasAnyRole("CLIENT", "VENDEUR", "ADMIN")

        .requestMatchers("/api/image-search/**")
        .hasAnyRole("CLIENT", "VENDEUR", "ADMIN")

        // =========================
        // VENDEUR
        // =========================
        .requestMatchers("/api/sellers/shop/**").hasRole("VENDEUR")
        .requestMatchers("/api/sellers/dashboard/**").hasRole("VENDEUR")

        // =========================
        // ADMIN
        // =========================
        .requestMatchers("/api/orders/admin/**").hasRole("ADMIN")
        .requestMatchers("/api/payments/admin/**").hasRole("ADMIN")
        .requestMatchers("/api/deliveries/admin/**").hasRole("ADMIN")
        .requestMatchers("/api/reviews/admin/**").hasRole("ADMIN")
        .requestMatchers("/api/group-buys/expire-old").hasRole("ADMIN")
        .requestMatchers("/api/sellers/admin/**").hasRole("ADMIN")
        .requestMatchers("/api/product-embeddings/**").hasRole("ADMIN")
        .requestMatchers("/api/admin/**").hasRole("ADMIN")

        // =========================
        // ANCIENNES ROUTES
        // =========================
        .requestMatchers("/api/vendeur/**").hasRole("VENDEUR")
        .requestMatchers("/api/client/**").hasAnyRole("CLIENT", "VENDEUR")

        .anyRequest().authenticated()
)
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(List.of("http://localhost:5173"));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
                configuration.setExposedHeaders(List.of("Authorization"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

    @Bean
    public UserDetailsService userDetailsService() {
        return telephone -> userRepository.findByTelephone(telephone)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();

        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }
}