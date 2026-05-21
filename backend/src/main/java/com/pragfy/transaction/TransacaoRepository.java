package com.pragfy.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<TransacaoEntity, Long> {

    @Query("SELECT t FROM TransacaoEntity t WHERE t.usuario.id = :idUsuario " +
           "AND t.data >= :inicio AND t.data <= :fim " +
           "ORDER BY t.data DESC")
    List<TransacaoEntity> BuscarPorUsuarioEMes(
            @Param("idUsuario") Long idUsuario,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM TransacaoEntity t " +
           "WHERE t.usuario.id = :idUsuario AND t.tipo = :tipo " +
           "AND t.data >= :inicio AND t.data <= :fim")
    BigDecimal SomarPorUsuarioTipoEMes(
            @Param("idUsuario") Long idUsuario,
            @Param("tipo") ETransacaoTipo tipo,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim);
}
