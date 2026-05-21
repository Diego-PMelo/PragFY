package com.pragfy.transaction.dto;

import java.math.BigDecimal;

public record ResumoMensalDTO(
        int month,
        int year,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance
) {}
