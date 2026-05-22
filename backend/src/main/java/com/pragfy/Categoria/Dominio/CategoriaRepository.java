package com.pragfy.Categoria.Dominio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<CategoriaEntity, Long> {

    @Query("SELECT c FROM CategoriaEntity c WHERE c.usuario.id = :idUsuario")
    List<CategoriaEntity> BuscarPorIdUsuario(@Param("idUsuario") Long idUsuario);

    @Query("SELECT c FROM CategoriaEntity c WHERE c.usuario.id = :idUsuario AND c.tipo = :tipo")
    List<CategoriaEntity> BuscarPorIdUsuarioETipo(
            @Param("idUsuario") Long idUsuario,
            @Param("tipo") ECategoriaTipo tipo);
}
