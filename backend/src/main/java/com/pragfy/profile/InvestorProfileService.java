package com.pragfy.profile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pragfy.exception.BusinessException;
import com.pragfy.exception.ResourceNotFoundException;
import com.pragfy.profile.dto.ProfileRequest;
import com.pragfy.profile.dto.ProfileResponse;
import com.pragfy.user.User;
import com.pragfy.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvestorProfileService {

    private final InvestorProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ProfileResponse findByUser(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(ProfileResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Perfil de investidor não encontrado para este usuário"));
    }

    public ProfileResponse save(ProfileRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        String answersJson = serializeAnswers(request);
        RiskProfile riskProfile = request.riskProfile() != null
                ? request.riskProfile()
                : calculateRiskProfile(request.answers());

        InvestorProfile profile = profileRepository.findByUserId(request.userId())
                .orElse(InvestorProfile.builder().user(user).build());

        profile.setAnswers(answersJson);
        profile.setRiskProfile(riskProfile);

        return ProfileResponse.from(profileRepository.save(profile));
    }

    /**
     * Sistema de pontuação baseado nas 8 perguntas do questionário.
     *
     * Pontuação máxima: 16 pts
     *   >= 12 pts → ARROJADO
     *   >= 7  pts → MODERADO
     *   <  7  pts → CONSERVADOR
     */
    private RiskProfile calculateRiskProfile(Map<String, String> answers) {
        int score = 0;

        // 1. Renda mensal (capacidade de assumir riscos)
        score += switch (answers.getOrDefault("renda_mensal", "")) {
            case "acima_10k", "5k_10k" -> 2;
            case "2k_5k"               -> 1;
            default                    -> 0;  // ate_2k ou não respondido
        };

        // 2. Percentual gasto da renda (disciplina financeira)
        score += switch (answers.getOrDefault("gasto_mensal", "")) {
            case "ate_50"              -> 2;
            case "50_80"               -> 1;
            default                   -> 0;  // 80_100, acima (endividado)
        };

        // 3. Dívidas atuais
        score += switch (answers.getOrDefault("dividas", "")) {
            case "nao"                 -> 2;
            case "sim_controle"        -> 1;
            default                   -> 0;  // sim_pesadas
        };

        // 4. Objetivo financeiro
        score += switch (answers.getOrDefault("objetivo", "")) {
            case "aposentadoria"       -> 2;
            case "renda_extra",
                 "compra_bem"          -> 1;
            default                   -> 0;  // emergencia (prioridade conservadora)
        };

        // 5. Horizonte de investimento
        score += switch (answers.getOrDefault("horizonte", "")) {
            case "longo"               -> 2;
            case "medio"               -> 1;
            default                   -> 0;  // curto
        };

        // 6. Experiência prévia com investimentos
        score += switch (answers.getOrDefault("ja_investe", "")) {
            case "sim_diversificado"   -> 2;
            case "sim_basico"          -> 1;
            default                   -> 0;  // nao
        };

        // 7. Reação a perdas (tolerância ao risco)
        score += switch (answers.getOrDefault("reacao_perdas", "")) {
            case "tranquilo"           -> 2;
            case "preocupado"          -> 1;
            default                   -> 0;  // venderia
        };

        // 8. Capacidade de poupança mensal
        score += switch (answers.getOrDefault("poupanca_mensal", "")) {
            case "acima_30"            -> 2;
            case "10_30"               -> 1;
            default                   -> 0;  // ate_10, nada
        };

        if (score >= 12) return RiskProfile.ARROJADO;
        if (score >= 7)  return RiskProfile.MODERADO;
        return RiskProfile.CONSERVADOR;
    }

    private String serializeAnswers(ProfileRequest request) {
        try {
            return objectMapper.writeValueAsString(request.answers());
        } catch (JsonProcessingException e) {
            throw new BusinessException("Erro ao processar respostas do formulário");
        }
    }
}
