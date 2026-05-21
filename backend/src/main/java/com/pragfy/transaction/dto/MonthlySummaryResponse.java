package com.pragfy.transaction.dto;

import java.math.BigDecimal;

public record MonthlySummaryResponse(
        int month,
        int year,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance
) {}
