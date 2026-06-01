package com.piecesauto.backend.vehicule;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vehicules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehiculeController {

    private final VehiculeService vehiculeService;

    @PostMapping("/brands")
    public VehiculeBrand createBrand(@RequestBody VehiculeBrand brand) {
        return vehiculeService.createBrand(brand);
    }

    @GetMapping("/brands")
    public List<VehiculeBrand> getAllBrands() {
        return vehiculeService.getAllBrands();
    }

    @PostMapping("/brands/{brandId}/models")
    public VehiculeModel createModel(
            @PathVariable Long brandId,
            @RequestBody VehiculeModel model
    ) {
        return vehiculeService.createModel(brandId, model);
    }

    @GetMapping("/brands/{brandId}/models")
    public List<VehiculeModel> getModelsByBrand(@PathVariable Long brandId) {
        return vehiculeService.getModelsByBrand(brandId);
    }

    @PostMapping("/models/{modelId}/versions")
    public VehiculeVersion createVersion(
            @PathVariable Long modelId,
            @RequestBody VehiculeVersion version
    ) {
        return vehiculeService.createVersion(modelId, version);
    }

    @GetMapping("/models/{modelId}/versions")
    public List<VehiculeVersion> getVersionsByModel(@PathVariable Long modelId) {
        return vehiculeService.getVersionsByModel(modelId);
    }
}