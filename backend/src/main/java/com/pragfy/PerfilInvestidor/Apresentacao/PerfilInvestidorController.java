package com.pragfy.PerfilInvestidor.Apresentacao;

import com.pragfy.PerfilInvestidor.Aplicacao.DTO.PerfilRequestDTO;
import com.pragfy.PerfilInvestidor.Aplicacao.DTO.PerfilResponseDTO;
import com.pragfy.PerfilInvestidor.Aplicacao.PerfilInvestidorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @PutMapping("/{idUsuario}")
    public PerfilResponseDTO Atualizar(@PathVariable Long idUsuario,
                                       @Valid @RequestBody PerfilRequestDTO requisicao) {
        return perfilService.Atualizar(idUsuario, requisicao);
    }

    @DeleteMapping("/{idUsuario}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void Excluir(@PathVariable Long idUsuario) {
        perfilService.Excluir(idUsuario);
    }
}
