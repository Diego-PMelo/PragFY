package com.pragfy.category.dto;

import com.pragfy.category.ECategoriaTipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoriaRequestDTO(
        @NotNull(message = "userId é obrigatório")
        Long userId,

        @NotBlank(message = "Nome é obrigatório")
        String name,

        @NotNull(message = "Tipo é obrigatório (INCOME ou EXPENSE)")
        ECategoriaTipo type,

        String color,
        String icon
) {}
