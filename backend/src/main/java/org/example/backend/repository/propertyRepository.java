package org.example.backend.repository;

import org.example.backend.entity.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Property entity operations.
 *
 * This repository provides data access methods including custom queries
 * for dashboard analytics and filtering capabilities.
 */
@Repository
public interface propertyRepository extends JpaRepository<Property, Long> {

    /**
     * Find properties by occupancy rate range
     */
    Page<Property> findByOccupancyRateBetween(
            BigDecimal minOccupancy,
            BigDecimal maxOccupancy,
            Pageable pageable
    );

    /**
     * Find properties by ESG score range
     */
    Page<Property> findByEsgScoreBetween(
            BigDecimal minEsgScore,
            BigDecimal maxEsgScore,
            Pageable pageable
    );

    /**
     * Find properties by property type
     */
    Page<Property> findByPropertyTypeIgnoreCase(String propertyType, Pageable pageable);

    /**
     * Find properties with rental income above threshold
     */
    List<Property> findByRentalIncomeGreaterThan(BigDecimal threshold);

    /**
     * Search properties by name or address (case-insensitive)
     */
    @Query("SELECT p FROM Property p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(p.address) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Property> searchByNameOrAddress(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Get portfolio summary statistics
     */
    @Query("SELECT " +
            "COUNT(p) as totalProperties, " +
            "COALESCE(SUM(p.totalUnits), 0) as totalUnits, " +
            "COALESCE(SUM(p.occupiedUnits), 0) as occupiedUnits, " +
            "COALESCE(AVG(p.occupancyRate), 0) as avgOccupancyRate, " +
            "COALESCE(SUM(p.rentalIncome), 0) as totalRentalIncome, " +
            "COALESCE(SUM(p.assetValue), 0) as totalAssetValue, " +
            "COALESCE(AVG(p.esgScore), 0) as avgEsgScore " +
            "FROM Property p")
    PortfolioSummary getPortfolioSummary();

    /**
     * Get top performing properties by rental income per unit
     */
    @Query("SELECT p FROM Property p WHERE p.totalUnits > 0 " +
            "ORDER BY (p.rentalIncome / p.totalUnits) DESC")
    List<Property> findTopPerformingProperties(Pageable pageable);

    /**
     * Get properties with low occupancy (below threshold)
     */
    @Query("SELECT p FROM Property p WHERE p.occupancyRate < :threshold")
    List<Property> findLowOccupancyProperties(@Param("threshold") BigDecimal threshold);

    /**
     * Get properties requiring ESG improvement (below threshold)
     */
    @Query("SELECT p FROM Property p WHERE p.esgScore < :threshold OR p.esgScore IS NULL")
    List<Property> findPropertiesNeedingEsgImprovement(@Param("threshold") BigDecimal threshold);

    /**
     * Get properties within geographic bounds (for map view)
     */
    @Query("SELECT p FROM Property p WHERE " +
            "p.latitude BETWEEN :minLat AND :maxLat AND " +
            "p.longitude BETWEEN :minLng AND :maxLng")
    List<Property> findPropertiesInBounds(
            @Param("minLat") BigDecimal minLatitude,
            @Param("maxLat") BigDecimal maxLatitude,
            @Param("minLng") BigDecimal minLongitude,
            @Param("maxLng") BigDecimal maxLongitude
    );

    /**
     * Custom projection interface for portfolio summary
     */
    interface PortfolioSummary {
        Long getTotalProperties();
        Long getTotalUnits();
        Long getOccupiedUnits();
        BigDecimal getAvgOccupancyRate();
        BigDecimal getTotalRentalIncome();
        BigDecimal getTotalAssetValue();
        BigDecimal getAvgEsgScore();
    }

    /**
     * Find properties by multiple filter criteria
     */
    @Query("SELECT p FROM Property p WHERE " +
            "(:propertyType IS NULL OR LOWER(p.propertyType) = LOWER(:propertyType)) AND " +
            "(:minOccupancy IS NULL OR p.occupancyRate >= :minOccupancy) AND " +
            "(:maxOccupancy IS NULL OR p.occupancyRate <= :maxOccupancy) AND " +
            "(:minEsgScore IS NULL OR p.esgScore >= :minEsgScore) AND " +
            "(:maxEsgScore IS NULL OR p.esgScore <= :maxEsgScore)")
    Page<Property> findWithFilters(
            @Param("propertyType") String propertyType,
            @Param("minOccupancy") BigDecimal minOccupancy,
            @Param("maxOccupancy") BigDecimal maxOccupancy,
            @Param("minEsgScore") BigDecimal minEsgScore,
            @Param("maxEsgScore") BigDecimal maxEsgScore,
            Pageable pageable
    );
}