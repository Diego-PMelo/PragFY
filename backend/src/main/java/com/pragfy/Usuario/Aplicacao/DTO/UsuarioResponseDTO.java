package com.pragfy.Usuario.Aplicacao.DTO;

import com.pragfy.Usuario.Dominio.UsuarioEntity;
import java.time.LocalDateTime;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        LocalDateTime criadoEm
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
