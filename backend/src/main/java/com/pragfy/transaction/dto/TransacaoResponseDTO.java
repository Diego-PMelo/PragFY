package com.pragfy.transaction.dto;

import com.pragfy.transaction.ETransacaoTipo;
import com.pragfy.transaction.TransacaoEntity;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransacaoResponseDTO(
        Long id,
        Long userId,
        Long categoryId,
        String categoryName,
        BigDecimal amount,
        String description,
        LocalDate date,
        ETransacaoTipo type
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
