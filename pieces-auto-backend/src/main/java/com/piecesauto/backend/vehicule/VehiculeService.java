package com.piecesauto.backend.vehicule;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VehiculeService {

    private final VehiculeBrandRepository brandRepository;
    private final VehiculeModelRepository modelRepository;
    private final VehiculeVersionRepository versionRepository;

    public VehiculeBrand createBrand(VehiculeBrand brand) {
        if (brandRepository.existsByName(brand.getName())) {
            throw new RuntimeException("Cette marque existe déjà");
        }

        brand.setActive(true);
        return brandRepository.save(brand);
    }

    public List<VehiculeBrand> getAllBrands() {
        return brandRepository.findAll();
    }

    public VehiculeModel createModel(Long brandId, VehiculeModel model) {
        VehiculeBrand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Marque introuvable"));

        if (modelRepository.existsByNameAndBrandId(model.getName(), brandId)) {
            throw new RuntimeException("Ce modèle existe déjà pour cette marque");
        }

        model.setBrand(brand);
        model.setActive(true);

        return modelRepository.save(model);
    }

    public List<VehiculeModel> getModelsByBrand(Long brandId) {
        return modelRepository.findByBrandId(brandId);
    }

    public VehiculeVersion createVersion(Long modelId, VehiculeVersion version) {
        VehiculeModel model = modelRepository.findById(modelId)
                .orElseThrow(() -> new RuntimeException("Modèle introuvable"));

        version.setModel(model);
        version.setActive(true);

        return versionRepository.save(version);
    }

    public List<VehiculeVersion> getVersionsByModel(Long modelId) {
        return versionRepository.findByModelId(modelId);
    }
}