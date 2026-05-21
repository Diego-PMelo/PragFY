package com.pragfy.category;

import com.pragfy.category.dto.CategoriaRequestDTO;
import com.pragfy.category.dto.CategoriaResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public List<CategoriaResponseDTO> ListarPorUsuario(@RequestParam("idUsuario") Long idUsuario) {
        return categoriaService.ListarPorUsuario(idUsuario);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponseDTO Criar(@Valid @RequestBody CategoriaRequestDTO requisicao) {
        return categoriaService.Criar(requisicao);
    }

    @PutMapping("/{id}")
    public CategoriaResponseDTO Atualizar(@PathVariable Long id,
                                          @Valid @RequestBody CategoriaRequestDTO requisicao) {
        return categoriaService.Atualizar(id, requisicao);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void Excluir(@PathVariable Long id) {
        categoriaService.Excluir(id);
    }
}
