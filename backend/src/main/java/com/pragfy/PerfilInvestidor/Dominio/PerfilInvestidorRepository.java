package com.pragfy.PerfilInvestidor.Dominio;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PerfilInvestidorRepository extends JpaRepository<PerfilInvestidorEntity, Long> {

    @Query("SELECT p FROM PerfilInvestidorEntity p WHERE p.usuario.id = :idUsuario")
    Optional<PerfilInvestidorEntity> BuscarPorIdUsuario(@Param("idUsuario") Long idUsuario);
}
