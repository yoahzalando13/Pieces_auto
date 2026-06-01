package com.piecesauto.backend.seller;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.piecesauto.backend.seller.dto.CreateShopRequest;
import com.piecesauto.backend.seller.dto.SellerDashboardResponse;
import com.piecesauto.backend.seller.dto.ShopResponse;
import com.piecesauto.backend.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sellers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SellerController {

    private final SellerService sellerService;

    @PostMapping("/shop")
    public ShopResponse createMyShop(
            Authentication authentication,
            @Valid @RequestBody CreateShopRequest request
    ) {
        User user = (User) authentication.getPrincipal();

        return ShopResponse.fromEntity(
                sellerService.createMyShop(user.getId(), request)
        );
    }

    @PutMapping("/shop")
    public ShopResponse updateMyShop(
            Authentication authentication,
            @Valid @RequestBody CreateShopRequest request
    ) {
        User user = (User) authentication.getPrincipal();

        return ShopResponse.fromEntity(
                sellerService.updateMyShop(user.getId(), request)
        );
    }

    @PostMapping("/shop/upload-logo")
    public ShopResponse uploadShopLogo(
            Authentication authentication,
            @RequestParam("image") MultipartFile image
    ) {
        User user = (User) authentication.getPrincipal();

        return ShopResponse.fromEntity(
                sellerService.uploadShopLogo(user.getId(), image)
        );
    }

    @GetMapping("/shop/my")
    public ShopResponse getMyShop(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        return ShopResponse.fromEntity(
                sellerService.getMyShop(user.getId())
        );
    }

    @GetMapping("/dashboard")
    public SellerDashboardResponse getMyDashboard(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        return sellerService.getMyDashboard(user.getId());
    }

    @GetMapping("/shops")
    public List<ShopResponse> getAllShops() {
        return sellerService.getAllShops()
                .stream()
                .map(ShopResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/shops/{shopId}")
    public ShopResponse getShopById(@PathVariable Long shopId) {
        return ShopResponse.fromEntity(
                sellerService.getShopById(shopId)
        );
    }

    @PutMapping("/admin/{sellerId}/approve")
    public Seller approveSeller(@PathVariable Long sellerId) {
        return sellerService.approveSeller(sellerId);
    }

    @PutMapping("/admin/{sellerId}/suspend")
    public Seller suspendSeller(@PathVariable Long sellerId) {
        return sellerService.suspendSeller(sellerId);
    }
}