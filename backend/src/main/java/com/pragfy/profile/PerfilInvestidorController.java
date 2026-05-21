package com.pragfy.profile;

import com.pragfy.profile.dto.PerfilRequestDTO;
import com.pragfy.profile.dto.PerfilResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class PerfilInvestidorController {

    private final PerfilInvestidorService perfilService;

    @GetMapping
    public PerfilResponseDTO BuscarPorUsuario(@RequestParam("userId") Long idUsuario) {
        return perfilService.BuscarPorUsuario(idUsuario);
    }

    @PostMapping
    public PerfilResponseDTO Salvar(@Valid @RequestBody PerfilRequestDTO requisicao) {
        return perfilService.Salvar(requisicao);
    }
}
