package com.pragfy.category;

import com.pragfy.user.UsuarioEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_CATEGORIES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UsuarioEntity usuario;

    @Column(nullable = false, length = 80)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ECategoriaTipo tipo;

    @Column(length = 7)
    private String cor;

    @Column(length = 50)
    private String icone;
}
