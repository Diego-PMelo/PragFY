package com.pragfy.profile.dto;

import com.pragfy.profile.EPerfilRisco;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record PerfilRequestDTO(
        @NotNull(message = "idUsuario é obrigatório")
        Long idUsuario,

        @NotNull(message = "Respostas são obrigatórias")
        Map<String, String> respostas,

        // Perfil pode ser calculado pelo backend ou informado manualmente
        EPerfilRisco perfilRisco
) {}
