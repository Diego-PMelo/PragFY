package com.pragfy.PerfilInvestidor.Dominio;

import com.pragfy.Usuario.Dominio.UsuarioEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_PERFIS_INVESTIDOR")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PerfilInvestidorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_PERFIL")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ID_USUARIO", nullable = false, unique = true)
    private UsuarioEntity usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "CD_PERFIL_RISCO", length = 20)
    private EPerfilRisco perfilRisco;

    @Lob
    @Column(name = "DS_RESPOSTAS", columnDefinition = "CLOB")
    private String respostas;

    @Column(name = "DT_REGISTRO_ALT")
    private LocalDateTime atualizadoEm;

    @PrePersist
    @PreUpdate
    void PreAtualizar() {
        atualizadoEm = LocalDateTime.now();
    }
}
