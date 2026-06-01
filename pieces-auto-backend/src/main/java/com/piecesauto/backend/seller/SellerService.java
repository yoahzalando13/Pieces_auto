package com.piecesauto.backend.seller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.piecesauto.backend.order.OrderItemRepository;
import com.piecesauto.backend.product.ProductRepository;
import com.piecesauto.backend.seller.dto.CreateShopRequest;
import com.piecesauto.backend.seller.dto.SellerDashboardResponse;
import com.piecesauto.backend.user.Role;
import com.piecesauto.backend.user.User;
import com.piecesauto.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    private final ProductRepository productRepository;
private final OrderItemRepository orderItemRepository;

    public Shop createMyShop(Long userId, CreateShopRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (user.getRole() != Role.VENDEUR) {
            throw new RuntimeException("Seul un utilisateur VENDEUR peut créer une boutique");
        }

        if (sellerRepository.existsByUserId(userId)) {
            throw new RuntimeException("Cet utilisateur possède déjà un profil vendeur");
        }

        if (shopRepository.existsByShopName(request.getShopName())) {
            throw new RuntimeException("Ce nom de boutique existe déjà");
        }

        Seller seller = Seller.builder()
                .user(user)
                .status(SellerStatus.PENDING)
                .build();

        Seller savedSeller = sellerRepository.save(seller);

        Shop shop = Shop.builder()
                .seller(savedSeller)
                .shopName(request.getShopName())
                .description(request.getDescription())
                .phone(request.getPhone())
                .address(request.getAddress())
                .logoUrl(request.getLogoUrl())
                .active(true)
                .build();

        return shopRepository.save(shop);
    }

    public Shop getMyShop(Long userId) {
        return shopRepository.findBySellerUserId(userId)
                .orElseThrow(() -> new RuntimeException("Boutique introuvable"));
    }

    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    public Shop getShopById(Long shopId) {
        return shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Boutique introuvable"));
    }

    public Seller approveSeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Vendeur introuvable"));

        seller.setStatus(SellerStatus.APPROVED);
        seller.setApprovedAt(LocalDateTime.now());

        return sellerRepository.save(seller);
    }

    public Seller suspendSeller(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Vendeur introuvable"));

        seller.setStatus(SellerStatus.SUSPENDED);

        return sellerRepository.save(seller);
    }

    public SellerDashboardResponse getMyDashboard(Long userId) {
    Shop shop = shopRepository.findBySellerUserId(userId)
            .orElseThrow(() -> new RuntimeException("Boutique introuvable"));

    long totalProducts = productRepository.countByShopId(shop.getId());
    long activeProducts = productRepository.countByShopIdAndActiveTrue(shop.getId());
    long totalOrders = orderItemRepository.countOrdersByShopId(shop.getId());
    BigDecimal totalSales = orderItemRepository.calculateTotalSalesByShopId(shop.getId());

    return SellerDashboardResponse.builder()
            .sellerId(shop.getSeller().getId())
            .shopId(shop.getId())
            .shopName(shop.getShopName())
            .totalProducts(totalProducts)
            .activeProducts(activeProducts)
            .totalOrders(totalOrders)
            .totalSales(totalSales)
            .build();
}
}