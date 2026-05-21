package com.pragfy.category;

import com.pragfy.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TB_CATEGORIES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CategoryType type;

    @Column(length = 7)
    private String color;

    @Column(length = 50)
    private String icon;
}
