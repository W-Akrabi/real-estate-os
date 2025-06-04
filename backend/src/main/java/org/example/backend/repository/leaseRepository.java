package org.example.backend.repository;

import org.example.backend.entity.Lease;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface leaseRepository extends JpaRepository<Lease, Long> {

    /**
     * Find leases by property ID
     */
    Page<Lease> findByPropertyId(Long propertyId, Pageable pageable);

    /**
     * Find leases by tenant ID
     */
    Page<Lease> findByTenantId(Long tenantId, Pageable pageable);

    /**
     * Find active leases as of a specific date
     */
    @Query("SELECT l FROM Lease l WHERE l.startDate <= :currentDate AND l.endDate >= :currentDate")
    List<Lease> findActiveLeasesAsOf(@Param("currentDate") LocalDate currentDate);

    /**
     * Find leases expiring within a date range
     */
    @Query("SELECT l FROM Lease l WHERE l.endDate BETWEEN :startDate AND :endDate")
    List<Lease> findLeasesExpiringBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find leases by rent range
     */
    Page<Lease> findByMonthlyRentBetween(
            BigDecimal minRent,
            BigDecimal maxRent,
            Pageable pageable
    );

    /**
     * Find leases by property and active status
     */
    @Query("SELECT l FROM Lease l WHERE l.property.id = :propertyId AND " +
            "l.startDate <= CURRENT_DATE AND l.endDate >= CURRENT_DATE")
    List<Lease> findActiveLeasesByProperty(@Param("propertyId") Long propertyId);

    /**
     * Find expired leases
     */
    @Query("SELECT l FROM Lease l WHERE l.endDate < CURRENT_DATE")
    Page<Lease> findExpiredLeases(Pageable pageable);

    /**
     * Find future leases (not yet started)
     */
    @Query("SELECT l FROM Lease l WHERE l.startDate > CURRENT_DATE")
    Page<Lease> findFutureLeases(Pageable pageable);

    /**
     * Get total rental income for active leases
     */
    @Query("SELECT COALESCE(SUM(l.monthlyRent), 0) FROM Lease l WHERE " +
            "l.startDate <= CURRENT_DATE AND l.endDate >= CURRENT_DATE")
    BigDecimal getTotalActiveRentalIncome();

    /**
     * Get rental income by property
     */
    @Query("SELECT l.property.id, COALESCE(SUM(l.monthlyRent), 0) " +
            "FROM Lease l " +
            "WHERE l.startDate <= CURRENT_DATE AND l.endDate >= CURRENT_DATE " +
            "GROUP BY l.property.id")
    List<Object[]> getRentalIncomeByProperty();

    /**
     * Find leases with security deposit above threshold
     */
    List<Lease> findBySecurityDepositGreaterThan(BigDecimal threshold);

    /**
     * Get lease renewal opportunities (expiring within next 90 days)
     */
    @Query("SELECT l FROM Lease l WHERE " +
            "l.endDate BETWEEN CURRENT_DATE AND :futureDate AND " +
            "l.startDate <= CURRENT_DATE")
    List<Lease> findLeaseRenewalOpportunities(@Param("futureDate") LocalDate futureDate);

    /**
     * Find leases by multiple filters
     */
    @Query("SELECT l FROM Lease l WHERE " +
            "(:propertyId IS NULL OR l.property.id = :propertyId) AND " +
            "(:tenantId IS NULL OR l.tenant.id = :tenantId) AND " +
            "(:minRent IS NULL OR l.monthlyRent >= :minRent) AND " +
            "(:maxRent IS NULL OR l.monthlyRent <= :maxRent) AND " +
            "(:leaseStatus IS NULL OR " +
            "  CASE " +
            "    WHEN :leaseStatus = 'ACTIVE' THEN (l.startDate <= CURRENT_DATE AND l.endDate >= CURRENT_DATE) " +
            "    WHEN :leaseStatus = 'EXPIRED' THEN (l.endDate < CURRENT_DATE) " +
            "    WHEN :leaseStatus = 'FUTURE' THEN (l.startDate > CURRENT_DATE) " +
            "    ELSE true " +
            "  END = true)")
    Page<Lease> findWithFilters(
            @Param("propertyId") Long propertyId,
            @Param("tenantId") Long tenantId,
            @Param("minRent") BigDecimal minRent,
            @Param("maxRent") BigDecimal maxRent,
            @Param("leaseStatus") String leaseStatus,
            Pageable pageable
    );

    /**
     * Get lease duration statistics
     */
    @Query(
            value = "SELECT AVG(EXTRACT(YEAR FROM AGE(end_date, start_date)) * 12 + EXTRACT(MONTH FROM AGE(end_date, start_date))) AS avgDurationMonths, " +
                    "MIN(EXTRACT(YEAR FROM AGE(end_date, start_date)) * 12 + EXTRACT(MONTH FROM AGE(end_date, start_date))) AS minDurationMonths, " +
                    "MAX(EXTRACT(YEAR FROM AGE(end_date, start_date)) * 12 + EXTRACT(MONTH FROM AGE(end_date, start_date))) AS maxDurationMonths " +
                    "FROM lease",
            nativeQuery = true
    )
    Object[] getLeaseDurationStatistics();


    /**
     * Get rent trends over time for forecasting
     */
    @Query("SELECT DATE(l.startDate) as leaseDate, AVG(l.monthlyRent) as avgRent " +
            "FROM Lease l " +
            "WHERE l.startDate BETWEEN :startDate AND :endDate " +
            "GROUP BY DATE(l.startDate) " +
            "ORDER BY DATE(l.startDate)")
    List<Object[]> getRentTrendsByDate(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Count leases by status for dashboard
     */
    @Query("SELECT " +
            "SUM(CASE WHEN l.startDate <= CURRENT_DATE AND l.endDate >= CURRENT_DATE THEN 1 ELSE 0 END) as activeLeases, " +
            "SUM(CASE WHEN l.endDate < CURRENT_DATE THEN 1 ELSE 0 END) as expiredLeases, " +
            "SUM(CASE WHEN l.startDate > CURRENT_DATE THEN 1 ELSE 0 END) as futureLeases " +
            "FROM Lease l")
    Object[] getLeaseStatusCounts();
}