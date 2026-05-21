package com.pragfy.transaction.dto;

import com.pragfy.transaction.TransactionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotNull(message = "userId é obrigatório")
        Long userId,

        Long categoryId,

        @NotNull(message = "Valor é obrigatório")
        @Positive(message = "Valor deve ser positivo")
        BigDecimal amount,

        String description,

        @NotNull(message = "Data é obrigatória")
        LocalDate date,

        @NotNull(message = "Tipo é obrigatório (INCOME ou EXPENSE)")
        TransactionType type
) {}
