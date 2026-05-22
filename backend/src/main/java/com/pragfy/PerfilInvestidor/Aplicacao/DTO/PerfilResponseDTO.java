package com.pragfy.PerfilInvestidor.Aplicacao.DTO;

import com.pragfy.PerfilInvestidor.Dominio.EPerfilRisco;
import com.pragfy.PerfilInvestidor.Dominio.PerfilInvestidorEntity;
import java.time.LocalDateTime;

public record PerfilResponseDTO(
        Long id,
        Long idUsuario,
        EPerfilRisco perfilRisco,
        LocalDateTime atualizadoEm
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
