package com.pragfy.transaction.dto;

import com.pragfy.transaction.Transaction;
import com.pragfy.transaction.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        Long userId,
        Long categoryId,
        String categoryName,
        BigDecimal amount,
        String description,
        LocalDate date,
        TransactionType type
) {
    public static TransactionResponse from(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getUser().getId(),
                t.getCategory() != null ? t.getCategory().getId() : null,
                t.getCategory() != null ? t.getCategory().getName() : null,
                t.getAmount(),
                t.getDescription(),
                t.getDate(),
                t.getType()
        );
    }
}
