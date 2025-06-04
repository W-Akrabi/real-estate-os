package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Property entity representing real estate assets in the system.
 *
 * This entity stores core property information including financial metrics,
 * ESG scores, and operational data that drives the dashboard analytics.
 */
@Entity
@Table(name = "properties")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(name = "property_type", length = 100)
    private String propertyType; // Commercial, Residential, Mixed-use, etc.

    @Column(name = "total_units")
    private Integer totalUnits;

    @Column(name = "occupied_units")
    private Integer occupiedUnits;

    /**
     * Occupancy rate as a percentage (0-100)
     * Calculated field that can be derived from total_units and occupied_units
     */
    @Column(name = "occupancy_rate", precision = 5, scale = 2)
    private BigDecimal occupancyRate;

    /**
     * Monthly rental income in the base currency
     */
    @Column(name = "rental_income", precision = 15, scale = 2)
    private BigDecimal rentalIncome;

    /**
     * Current market value of the asset
     */
    @Column(name = "asset_value", precision = 20, scale = 2)
    private BigDecimal assetValue;

    /**
     * Environmental, Social, and Governance score (0-100)
     * Higher scores indicate better ESG performance
     */
    @Column(name = "esg_score", precision = 5, scale = 2)
    private BigDecimal esgScore;

    @Column(name = "square_footage")
    private Integer squareFootage;

    @Column(name = "year_built")
    private Integer yearBuilt;

    /**
     * Geographic coordinates for map visualization
     */
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    /**
     * One-to-many relationship with tenants
     * A property can have multiple tenants
     */
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Tenant> tenants;

    /**
     * One-to-many relationship with maintenance requests
     * A property can have multiple maintenance requests
     */
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MaintenanceRequest> maintenanceRequests;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Helper method to calculate occupancy rate based on units
     */
    public void calculateOccupancyRate() {
        if (totalUnits != null && totalUnits > 0 && occupiedUnits != null) {
            this.occupancyRate = BigDecimal.valueOf(occupiedUnits)
                    .divide(BigDecimal.valueOf(totalUnits), 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
    }
}