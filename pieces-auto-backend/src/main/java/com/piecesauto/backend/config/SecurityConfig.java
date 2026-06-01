package com.piecesauto.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
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
        .requestMatchers("/api/cart/**").hasRole("CLIENT")

        .requestMatchers("/api/orders/checkout").hasRole("CLIENT")
        .requestMatchers("/api/orders/my/**").hasRole("CLIENT")

        .requestMatchers("/api/payments/pay/**").hasRole("CLIENT")
        .requestMatchers("/api/payments/fail/**").hasRole("CLIENT")
        .requestMatchers("/api/payments/my/**").hasRole("CLIENT")
        .requestMatchers("/api/payments/order/**").hasRole("CLIENT")

        .requestMatchers("/api/deliveries/create/**").hasRole("CLIENT")
        .requestMatchers("/api/deliveries/my/**").hasRole("CLIENT")
        .requestMatchers("/api/deliveries/order/**").hasRole("CLIENT")

        .requestMatchers(
                org.springframework.http.HttpMethod.POST,
                "/api/reviews/product/**"
        ).hasRole("CLIENT")
        .requestMatchers("/api/reviews/my/**").hasRole("CLIENT")

        .requestMatchers("/api/group-buys/create/**").hasRole("CLIENT")
        .requestMatchers("/api/group-buys/*/join").hasRole("CLIENT")
        .requestMatchers("/api/group-buys/my/**").hasRole("CLIENT")
        .requestMatchers("/api/group-buys/*/cancel").hasRole("CLIENT")

        .requestMatchers("/api/notifications/**").hasRole("CLIENT")

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
        .requestMatchers("/api/client/**").hasRole("CLIENT")

        .anyRequest().authenticated()
)
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
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