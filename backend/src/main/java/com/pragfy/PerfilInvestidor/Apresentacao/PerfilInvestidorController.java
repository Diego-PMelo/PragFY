package com.pragfy.PerfilInvestidor.Apresentacao;

import com.pragfy.PerfilInvestidor.Aplicacao.DTO.PerfilRequestDTO;
import com.pragfy.PerfilInvestidor.Aplicacao.DTO.PerfilResponseDTO;
import com.pragfy.PerfilInvestidor.Aplicacao.PerfilInvestidorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class PerfilInvestidorController {

    private final PerfilInvestidorService perfilService;

    @GetMapping
    public PerfilResponseDTO BuscarPorUsuario(@RequestParam("idUsuario") Long idUsuario) {
        return perfilService.BuscarPorUsuario(idUsuario);
    }

    @PostMapping
    public PerfilResponseDTO Salvar(@Valid @RequestBody PerfilRequestDTO requisicao) {
        return perfilService.Salvar(requisicao);
    }
}
