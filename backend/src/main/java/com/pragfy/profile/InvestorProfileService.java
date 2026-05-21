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

@Service
@RequiredArgsConstructor
public class InvestorProfileService {

    private final InvestorProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public ProfileResponse findByUser(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(ProfileResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de investidor não encontrado para este usuário"));
    }

    public ProfileResponse save(ProfileRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        String answersJson = serializeAnswers(request);
        RiskProfile riskProfile = request.riskProfile() != null
                ? request.riskProfile()
                : calculateRiskProfile(request);

        InvestorProfile profile = profileRepository.findByUserId(request.userId())
                .orElse(InvestorProfile.builder().user(user).build());

        profile.setAnswers(answersJson);
        profile.setRiskProfile(riskProfile);

        return ProfileResponse.from(profileRepository.save(profile));
    }

    private RiskProfile calculateRiskProfile(ProfileRequest request) {
        // Lógica simples de perfil baseada nas respostas
        // Será aprimorada com o agente IA no futuro
        String horizonte = request.answers().getOrDefault("horizonte", "curto");
        String reacaoPerdas = request.answers().getOrDefault("reacao_perdas", "preocupado");

        if (horizonte.equalsIgnoreCase("longo") && reacaoPerdas.equalsIgnoreCase("tranquilo")) {
            return RiskProfile.ARROJADO;
        } else if (horizonte.equalsIgnoreCase("medio")) {
            return RiskProfile.MODERADO;
        }
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
