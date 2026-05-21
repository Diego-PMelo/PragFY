package com.pragfy.profile.dto;

import com.pragfy.profile.EPerfilRisco;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record PerfilRequestDTO(
        @NotNull(message = "userId é obrigatório")
        Long userId,

        @NotNull(message = "Respostas são obrigatórias")
        Map<String, String> answers,

        // Perfil pode ser calculado pelo backend ou informado manualmente
        EPerfilRisco riskProfile
) {}
