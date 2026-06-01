package com.piecesauto.backend.groupbuy;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.piecesauto.backend.groupbuy.dto.CreateGroupBuyRequest;
import com.piecesauto.backend.groupbuy.dto.GroupBuyParticipantResponse;
import com.piecesauto.backend.groupbuy.dto.GroupBuyResponse;
import com.piecesauto.backend.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/group-buys")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GroupBuyController {

    private final GroupBuyService groupBuyService;

    @PostMapping("/create/product/{productId}")
public GroupBuyResponse createGroupBuy(
        Authentication authentication,
        @PathVariable Long productId,
        @Valid @RequestBody CreateGroupBuyRequest request
) {
    User user = (User) authentication.getPrincipal();

    return GroupBuyResponse.fromEntity(
            groupBuyService.createGroupBuy(
                    user.getId(),
                    productId,
                    request.getRequiredParticipants(),
                    request.getQuantityPerParticipant(),
                    request.getDurationHours()
            )
    );
}

    @PostMapping("/{groupBuyId}/join")
public GroupBuyResponse joinGroupBuy(
        Authentication authentication,
        @PathVariable Long groupBuyId
) {
    User user = (User) authentication.getPrincipal();

    return GroupBuyResponse.fromEntity(
            groupBuyService.joinGroupBuy(user.getId(), groupBuyId)
    );
}

    @GetMapping("/open")
public List<GroupBuyResponse> getOpenGroupBuys() {
    return groupBuyService.getOpenGroupBuys()
            .stream()
            .map(GroupBuyResponse::fromEntity)
            .collect(Collectors.toList());
}

    @GetMapping("/completed")
public List<GroupBuyResponse> getCompletedGroupBuys() {
    return groupBuyService.getCompletedGroupBuys()
            .stream()
            .map(GroupBuyResponse::fromEntity)
            .collect(Collectors.toList());
}

    @GetMapping("/{groupBuyId}")
public GroupBuyResponse getGroupBuyDetails(@PathVariable Long groupBuyId) {
    return GroupBuyResponse.fromEntity(
            groupBuyService.getGroupBuyDetails(groupBuyId)
    );
}

    @GetMapping("/product/{productId}/open")
public List<GroupBuyResponse> getOpenGroupBuysByProduct(@PathVariable Long productId) {
    return groupBuyService.getOpenGroupBuysByProduct(productId)
            .stream()
            .map(GroupBuyResponse::fromEntity)
            .collect(Collectors.toList());
}

    @GetMapping("/my")
public List<GroupBuyParticipantResponse> getMyGroupBuyParticipations(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    return groupBuyService.getMyGroupBuyParticipations(user.getId())
            .stream()
            .map(GroupBuyParticipantResponse::fromEntity)
            .collect(Collectors.toList());
}

   @PutMapping("/{groupBuyId}/cancel")
public GroupBuyResponse cancelGroupBuy(
        Authentication authentication,
        @PathVariable Long groupBuyId
) {
    User user = (User) authentication.getPrincipal();

    return GroupBuyResponse.fromEntity(
            groupBuyService.cancelGroupBuy(user.getId(), groupBuyId)
    );
}

    @PostMapping("/expire-old")
    public String expireOldGroupBuys() {
        groupBuyService.expireOldGroupBuys();
        return "Achats groupés expirés vérifiés";
    }

}