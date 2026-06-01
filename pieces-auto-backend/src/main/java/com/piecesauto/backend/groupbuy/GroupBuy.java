package com.piecesauto.backend.groupbuy;

import com.piecesauto.backend.product.Product;
import com.piecesauto.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "group_buys")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupBuy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String groupCode;

    private BigDecimal groupPrice;

    private Integer requiredParticipants;

    private Integer currentParticipants;

    private Integer quantityPerParticipant;

    @Enumerated(EnumType.STRING)
    private GroupBuyStatus status;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private LocalDateTime completedAt;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Builder.Default
    @OneToMany(mappedBy = "groupBuy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupBuyParticipant> participants = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.startDate = LocalDateTime.now();

        if (this.status == null) {
            this.status = GroupBuyStatus.OPEN;
        }

        if (this.currentParticipants == null) {
            this.currentParticipants = 0;
        }

        if (this.participants == null) {
            this.participants = new ArrayList<>();
        }
    }
}