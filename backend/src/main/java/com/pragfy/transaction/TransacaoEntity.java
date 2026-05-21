package com.pragfy.transaction;

import com.pragfy.category.CategoriaEntity;
import com.pragfy.user.UsuarioEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "TB_TRANSACTIONS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransacaoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UsuarioEntity usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoriaEntity categoria;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;

    @Column(length = 255)
    private String descricao;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate data;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ETransacaoTipo tipo;
}
