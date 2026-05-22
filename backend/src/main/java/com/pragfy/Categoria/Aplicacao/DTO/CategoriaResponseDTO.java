package com.pragfy.Categoria.Aplicacao.DTO;

import com.pragfy.Categoria.Dominio.CategoriaEntity;
import com.pragfy.Categoria.Dominio.ECategoriaTipo;

public record CategoriaResponseDTO(
        Long id,
        Long idUsuario,
        String nome,
        ECategoriaTipo tipo,
        String cor,
        String icone
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
