package com.pragfy.Categoria.Aplicacao.DTO;

import com.pragfy.Categoria.Dominio.ECategoriaTipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoriaRequestDTO(
        @NotNull(message = "idUsuario é obrigatório")
        Long idUsuario,

        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotNull(message = "Tipo é obrigatório (RECEITA ou DESPESA)")
        ECategoriaTipo tipo,

        String cor,
        String icone
) {}
