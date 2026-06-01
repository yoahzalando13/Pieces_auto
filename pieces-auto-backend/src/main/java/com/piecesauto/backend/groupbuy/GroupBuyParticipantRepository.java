package com.piecesauto.backend.groupbuy;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupBuyParticipantRepository extends JpaRepository<GroupBuyParticipant, Long> {

    boolean existsByGroupBuyIdAndUserId(Long groupBuyId, Long userId);

    Optional<GroupBuyParticipant> findByGroupBuyIdAndUserId(Long groupBuyId, Long userId);

    List<GroupBuyParticipant> findByGroupBuyId(Long groupBuyId);

    List<GroupBuyParticipant> findByUserIdOrderByJoinedAtDesc(Long userId);
}