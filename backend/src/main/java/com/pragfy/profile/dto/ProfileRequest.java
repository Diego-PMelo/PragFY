package com.pragfy.profile.dto;

import com.pragfy.profile.RiskProfile;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record ProfileRequest(
        @NotNull(message = "userId é obrigatório")
        Long userId,

        // Mapa de respostas: chave = id da pergunta, valor = resposta
        @NotNull(message = "Respostas são obrigatórias")
        Map<String, String> answers,

        // Perfil pode ser calculado pelo backend ou informado manualmente
        RiskProfile riskProfile
) {}
