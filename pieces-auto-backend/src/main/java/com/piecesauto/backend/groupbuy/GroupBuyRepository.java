package com.piecesauto.backend.groupbuy;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupBuyRepository extends JpaRepository<GroupBuy, Long> {

    List<GroupBuy> findByStatusOrderByStartDateDesc(GroupBuyStatus status);

    List<GroupBuy> findByProductIdAndStatus(Long productId, GroupBuyStatus status);

    Optional<GroupBuy> findByGroupCode(String groupCode);

    boolean existsByGroupCode(String groupCode);
}