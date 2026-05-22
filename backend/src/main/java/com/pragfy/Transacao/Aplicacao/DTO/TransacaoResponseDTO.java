package com.pragfy.Transacao.Aplicacao.DTO;

import com.pragfy.Transacao.Dominio.ETransacaoTipo;
import com.pragfy.Transacao.Dominio.TransacaoEntity;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransacaoResponseDTO(
        Long id,
        Long idUsuario,
        Long idCategoria,
        String nomeCategoria,
        BigDecimal valor,
        String descricao,
        LocalDate data,
        ETransacaoTipo tipo
) {
    public static TransacaoResponseDTO De(TransacaoEntity transacao) {
        return new TransacaoResponseDTO(
                transacao.getId(),
                transacao.getUsuario().getId(),
                transacao.getCategoria() != null ? transacao.getCategoria().getId()   : null,
                transacao.getCategoria() != null ? transacao.getCategoria().getNome() : null,
                transacao.getValor(),
                transacao.getDescricao(),
                transacao.getData(),
                transacao.getTipo()
        );
    }
}
