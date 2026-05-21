package com.pragfy.transaction.dto;

import com.pragfy.transaction.ETransacaoTipo;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransacaoRequestDTO(
        @NotNull(message = "idUsuario é obrigatório")
        Long idUsuario,

        Long idCategoria,

        @NotNull(message = "Valor é obrigatório")
        @Positive(message = "Valor deve ser positivo")
        BigDecimal valor,

        String descricao,

        @NotNull(message = "Data é obrigatória")
        LocalDate data,

        @NotNull(message = "Tipo é obrigatório (INCOME ou EXPENSE)")
        ETransacaoTipo tipo
) {}
