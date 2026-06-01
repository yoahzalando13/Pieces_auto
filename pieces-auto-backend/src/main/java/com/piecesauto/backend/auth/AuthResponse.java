package com.piecesauto.backend.auth;

import com.piecesauto.backend.user.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private Long userId;
    private String nom;
    private String prenom;
    private String telephone;
    private String email;
    private Role role;
}