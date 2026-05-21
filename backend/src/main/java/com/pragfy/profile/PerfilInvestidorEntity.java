package com.pragfy.profile;

import com.pragfy.user.UsuarioEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_INVESTOR_PROFILES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PerfilInvestidorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UsuarioEntity usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_profile", length = 20)
    private EPerfilRisco perfilRisco;

    @Lob
    @Column(name = "answers", columnDefinition = "CLOB")
    private String respostas;

    @Column(name = "updated_at")
    private LocalDateTime atualizadoEm;

    @PrePersist
    @PreUpdate
    void PreAtualizar() {
        atualizadoEm = LocalDateTime.now();
    }
}
