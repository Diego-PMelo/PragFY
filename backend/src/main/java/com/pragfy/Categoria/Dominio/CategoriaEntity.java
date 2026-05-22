package com.pragfy.Categoria.Dominio;

import com.pragfy.Usuario.Dominio.UsuarioEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_CATEGORIAS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CATEGORIA")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_USUARIO", nullable = false)
    private UsuarioEntity usuario;

    @Column(name = "DS_NOME", nullable = false, length = 80)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(name = "CD_TIPO", nullable = false, length = 10)
    private ECategoriaTipo tipo;

    @Column(name = "DS_COR", length = 7)
    private String cor;

    @Column(name = "DS_ICONE", length = 50)
    private String icone;
}
