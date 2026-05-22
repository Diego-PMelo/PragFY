package com.pragfy.Usuario.Dominio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long> {

    @Query("SELECT u FROM UsuarioEntity u WHERE u.email = :email")
    Optional<UsuarioEntity> BuscarPorEmail(@Param("email") String email);

    @Query("SELECT COUNT(u) > 0 FROM UsuarioEntity u WHERE u.email = :email")
    boolean ExistePorEmail(@Param("email") String email);
}
