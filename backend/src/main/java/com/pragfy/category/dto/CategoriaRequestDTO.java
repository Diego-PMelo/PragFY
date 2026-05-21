package com.pragfy.category.dto;

import com.pragfy.category.ECategoriaTipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoriaRequestDTO(
        @NotNull(message = "idUsuario é obrigatório")
        Long idUsuario,

        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotNull(message = "Tipo é obrigatório (INCOME ou EXPENSE)")
        ECategoriaTipo tipo,

        String cor,
        String icone
) {}
