package com.pragfy.profile.dto;

import com.pragfy.profile.EPerfilRisco;
import com.pragfy.profile.PerfilInvestidorEntity;
import java.time.LocalDateTime;

public record PerfilResponseDTO(
        Long id,
        Long userId,
        EPerfilRisco riskProfile,
        LocalDateTime updatedAt
) {
    public static PerfilResponseDTO De(PerfilInvestidorEntity perfil) {
        return new PerfilResponseDTO(
                perfil.getId(),
                perfil.getUsuario().getId(),
                perfil.getPerfilRisco(),
                perfil.getAtualizadoEm()
        );
    }
}
