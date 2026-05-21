package com.pragfy.transaction.dto;

import java.math.BigDecimal;

public record ResumoMensalDTO(
        int mes,
        int ano,
        BigDecimal totalReceita,
        BigDecimal totalDespesa,
        BigDecimal saldo
) {}
