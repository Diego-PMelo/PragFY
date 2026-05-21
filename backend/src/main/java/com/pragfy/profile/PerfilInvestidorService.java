package com.pragfy.profile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pragfy.exception.RegraDeNegocioException;
import com.pragfy.exception.RecursoNaoEncontradoException;
import com.pragfy.profile.dto.PerfilRequestDTO;
import com.pragfy.profile.dto.PerfilResponseDTO;
import com.pragfy.user.UsuarioEntity;
import com.pragfy.user.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PerfilInvestidorService {

    private final PerfilInvestidorRepository perfilRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    public PerfilResponseDTO BuscarPorUsuario(Long idUsuario) {
        return perfilRepository.BuscarPorIdUsuario(idUsuario)
                .map(PerfilResponseDTO::De)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Perfil de investidor não encontrado para este usuário"));
    }

    public PerfilResponseDTO Salvar(PerfilRequestDTO requisicao) {
        UsuarioEntity usuario = usuarioRepository.findById(requisicao.userId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        String respostasJson = SerializarRespostas(requisicao);
        EPerfilRisco perfilRisco = requisicao.riskProfile() != null
                ? requisicao.riskProfile()
                : CalcularPerfilRisco(requisicao.answers());

        PerfilInvestidorEntity perfil = perfilRepository.BuscarPorIdUsuario(requisicao.userId())
                .orElse(PerfilInvestidorEntity.builder().usuario(usuario).build());

        perfil.setRespostas(respostasJson);
        perfil.setPerfilRisco(perfilRisco);

        return PerfilResponseDTO.De(perfilRepository.save(perfil));
    }

    /**
     * Sistema de pontuação baseado nas 8 perguntas do questionário.
     *
     * Pontuação máxima: 16 pts
     *   >= 12 pts → ARROJADO
     *   >= 7  pts → MODERADO
     *   <  7  pts → CONSERVADOR
     */
    private EPerfilRisco CalcularPerfilRisco(Map<String, String> respostas) {
        int pontuacao = 0;

        // 1. Renda mensal (capacidade de assumir riscos)
        pontuacao += switch (respostas.getOrDefault("renda_mensal", "")) {
            case "acima_10k", "5k_10k" -> 2;
            case "2k_5k"               -> 1;
            default                    -> 0;
        };

        // 2. Percentual gasto da renda (disciplina financeira)
        pontuacao += switch (respostas.getOrDefault("gasto_mensal", "")) {
            case "ate_50" -> 2;
            case "50_80"  -> 1;
            default       -> 0;
        };

        // 3. Dívidas atuais
        pontuacao += switch (respostas.getOrDefault("dividas", "")) {
            case "nao"          -> 2;
            case "sim_controle" -> 1;
            default             -> 0;
        };

        // 4. Objetivo financeiro
        pontuacao += switch (respostas.getOrDefault("objetivo", "")) {
            case "aposentadoria"            -> 2;
            case "renda_extra", "compra_bem" -> 1;
            default                         -> 0;
        };

        // 5. Horizonte de investimento
        pontuacao += switch (respostas.getOrDefault("horizonte", "")) {
            case "longo" -> 2;
            case "medio" -> 1;
            default      -> 0;
        };

        // 6. Experiência prévia com investimentos
        pontuacao += switch (respostas.getOrDefault("ja_investe", "")) {
            case "sim_diversificado" -> 2;
            case "sim_basico"        -> 1;
            default                  -> 0;
        };

        // 7. Reação a perdas (tolerância ao risco)
        pontuacao += switch (respostas.getOrDefault("reacao_perdas", "")) {
            case "tranquilo"  -> 2;
            case "preocupado" -> 1;
            default           -> 0;
        };

        // 8. Capacidade de poupança mensal
        pontuacao += switch (respostas.getOrDefault("poupanca_mensal", "")) {
            case "acima_30" -> 2;
            case "10_30"    -> 1;
            default         -> 0;
        };

        if (pontuacao >= 12) return EPerfilRisco.ARROJADO;
        if (pontuacao >= 7)  return EPerfilRisco.MODERADO;
        return EPerfilRisco.CONSERVADOR;
    }

    private String SerializarRespostas(PerfilRequestDTO requisicao) {
        try {
            return objectMapper.writeValueAsString(requisicao.answers());
        } catch (JsonProcessingException e) {
            throw new RegraDeNegocioException("Erro ao processar respostas do formulário");
        }
    }
}
