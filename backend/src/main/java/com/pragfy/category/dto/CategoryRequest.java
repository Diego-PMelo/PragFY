package com.pragfy.category.dto;

import com.pragfy.category.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryRequest(
        @NotNull(message = "userId é obrigatório")
        Long userId,

        @NotBlank(message = "Nome é obrigatório")
        String name,

        @NotNull(message = "Tipo é obrigatório (INCOME ou EXPENSE)")
        CategoryType type,

        String color,
        String icon
) {}
