package com.pragfy.user.dto;

import com.pragfy.user.UsuarioEntity;
import java.time.LocalDateTime;

public record UsuarioResponseDTO(
        Long id,
        String name,
        String email,
        LocalDateTime createdAt
) {
    public static UsuarioResponseDTO De(UsuarioEntity usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCriadoEm()
        );
    }
}
