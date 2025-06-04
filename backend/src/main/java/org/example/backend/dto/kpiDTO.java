package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for KPI metrics used in dashboard analytics.
 *
 * This DTO aggregates key performance indicators across the portfolio
 * and provides data optimized for chart visualization.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class kpiDTO {

    // Portfolio Overview Metrics
    private Integer totalProperties;
    private Integer totalUnits;
    private Integer occupiedUnits;
    private BigDecimal overallOccupancyRate;
    private BigDecimal totalRentalIncome;
    private BigDecimal totalAssetValue;
    private BigDecimal averageEsgScore;

    // Financial Metrics
    private BigDecimal monthlyRevenue;
    private BigDecimal yearToDateRevenue;
    private BigDecimal averageRentPerUnit;
    private BigDecimal totalMaintenanceCosts;
    private BigDecimal netOperatingIncome;

    // Operational Metrics
    private Integer activeTenants;
    private Integer leasesExpiringThisMonth;
    private Integer leasesExpiringSoon; // Next 60 days
    private Integer pendingMaintenanceRequests;
    private Integer urgentMaintenanceRequests;

    // Performance Trends (for charts)
    private List<ChartDataPoint> occupancyTrend;
    private List<ChartDataPoint> revenueTrend;
    private List<ChartDataPoint> esgTrend;
    private List<ChartDataPoint> maintenanceCostTrend;

    // Property Performance Rankings
    private List<PropertyPerformanceDTO> topPerformingProperties;
    private List<PropertyPerformanceDTO> underperformingProperties;

    // ESG Metrics
    private BigDecimal averageEnergyRating;
    private Integer greenCertifiedProperties;
    private BigDecimal carbonFootprintReduction;

    private LocalDateTime lastUpdated;

    /**
     * Nested class for chart data points
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartDataPoint {
        private String label; // Date or category
        private BigDecimal value;
        private String category; // Optional grouping
    }

    /**
     * Nested class for property performance data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyPerformanceDTO {
        private Long propertyId;
        private String propertyName;
        private BigDecimal occupancyRate;
        private BigDecimal monthlyRevenue;
        private BigDecimal esgScore;
        private String performanceRating; // EXCELLENT, GOOD, AVERAGE, POOR
    }
}
