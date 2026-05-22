package com.pragfy.Transacao.Dominio;

import com.pragfy.Categoria.Dominio.CategoriaEntity;
import com.pragfy.Usuario.Dominio.UsuarioEntity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "TB_TRANSACOES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TransacaoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_TRANSACAO")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_USUARIO", nullable = false)
    private UsuarioEntity usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CATEGORIA")
    private CategoriaEntity categoria;

    @Column(name = "VL_VALOR", nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;

    @Column(name = "DS_DESCRICAO", length = 255)
    private String descricao;

    @Column(name = "DT_DATA", nullable = false)
    private LocalDate data;

    @Enumerated(EnumType.STRING)
    @Column(name = "CD_TIPO", nullable = false, length = 10)
    private ETransacaoTipo tipo;
}
