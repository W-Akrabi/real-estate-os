package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Property entity.
 *
 * This DTO decouples the API layer from the persistence layer and provides
 * validation constraints for incoming property data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class propertyDTO {

    private Long id;

    @NotBlank(message = "Property name is required")
    @Size(max = 255, message = "Property name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 100, message = "Property type must not exceed 100 characters")
    private String propertyType;

    @Min(value = 0, message = "Total units must be non-negative")
    private Integer totalUnits;

    @Min(value = 0, message = "Occupied units must be non-negative")
    private Integer occupiedUnits;

    @DecimalMin(value = "0.0", message = "Occupancy rate must be non-negative")
    @DecimalMax(value = "100.0", message = "Occupancy rate cannot exceed 100%")
    private BigDecimal occupancyRate;

    @DecimalMin(value = "0.0", message = "Rental income must be non-negative")
    private BigDecimal rentalIncome;

    @DecimalMin(value = "0.0", message = "Asset value must be non-negative")
    private BigDecimal assetValue;

    @DecimalMin(value = "0.0", message = "ESG score must be non-negative")
    @DecimalMax(value = "100.0", message = "ESG score cannot exceed 100")
    private BigDecimal esgScore;

    @Min(value = 0, message = "Square footage must be non-negative")
    private Integer squareFootage;

    @Min(value = 1800, message = "Year built must be reasonable")
    @Max(value = 2030, message = "Year built cannot be in the future")
    private Integer yearBuilt;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private BigDecimal longitude;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Summary fields for dashboard display
    private Integer tenantCount;
    private Integer activeMaintenance;
    private BigDecimal monthlyRevenue;
}