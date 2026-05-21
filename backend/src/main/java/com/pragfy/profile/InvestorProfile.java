package com.pragfy.profile;

import com.pragfy.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_INVESTOR_PROFILES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvestorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_profile", length = 20)
    private RiskProfile riskProfile;

    // Respostas do formulário serializadas como JSON
    @Lob
    @Column(name = "answers", columnDefinition = "CLOB")
    private String answers;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
