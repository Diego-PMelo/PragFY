package com.pragfy.category.dto;

import com.pragfy.category.CategoriaEntity;
import com.pragfy.category.ECategoriaTipo;

public record CategoriaResponseDTO(
        Long id,
        Long userId,
        String name,
        ECategoriaTipo type,
        String color,
        String icon
) {
    public static CategoriaResponseDTO De(CategoriaEntity categoria) {
        return new CategoriaResponseDTO(
                categoria.getId(),
                categoria.getUsuario().getId(),
                categoria.getNome(),
                categoria.getTipo(),
                categoria.getCor(),
                categoria.getIcone()
        );
    }
}
