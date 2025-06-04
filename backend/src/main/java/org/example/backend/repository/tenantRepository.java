package org.example.backend.repository;

import org.example.backend.entity.Tenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface tenantRepository extends JpaRepository<Tenant, Long> {

    /**
     * Find tenant by email (for unique constraint validation)
     */
    Optional<Tenant> findByEmail(String email);

    /**
     * Find tenants by property ID
     */
    Page<Tenant> findByPropertyId(Long propertyId, Pageable pageable);

    /**
     * Search tenants by name or email (case-insensitive)
     */
    @Query("SELECT t FROM Tenant t WHERE " +
            "LOWER(t.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(t.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Tenant> searchByNameOrEmail(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find tenants with lease expiring within specified days
     */
    @Query("SELECT t FROM Tenant t WHERE t.leaseEnd BETWEEN :startDate AND :endDate")
    List<Tenant> findTenantsWithExpiringLeases(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find tenants with active leases
     */
    @Query("SELECT t FROM Tenant t WHERE t.leaseStart <= :currentDate AND t.leaseEnd >= :currentDate")
    List<Tenant> findActiveTenantsAsOf(@Param("currentDate") LocalDate currentDate);

    /**
     * Find tenants by lease status
     */
    @Query("SELECT t FROM Tenant t WHERE " +
            "CASE " +
            "  WHEN :leaseStatus = 'ACTIVE' THEN (t.leaseStart <= CURRENT_DATE AND t.leaseEnd >= CURRENT_DATE) " +
            "  WHEN :leaseStatus = 'EXPIRED' THEN (t.leaseEnd < CURRENT_DATE) " +
            "  WHEN :leaseStatus = 'FUTURE' THEN (t.leaseStart > CURRENT_DATE) " +
            "  ELSE false " +
            "END = true")
    Page<Tenant> findByLeaseStatus(@Param("leaseStatus") String leaseStatus, Pageable pageable);

    /**
     * Get tenant count by property
     */
    @Query("SELECT t.property.id, COUNT(t) FROM Tenant t GROUP BY t.property.id")
    List<Object[]> getTenantCountByProperty();

    /**
     * Find tenants by property and lease date range
     */
    @Query("SELECT t FROM Tenant t WHERE t.property.id = :propertyId AND " +
            "((t.leaseStart BETWEEN :startDate AND :endDate) OR " +
            "(t.leaseEnd BETWEEN :startDate AND :endDate) OR " +
            "(t.leaseStart <= :startDate AND t.leaseEnd >= :endDate))")
    List<Tenant> findByPropertyAndDateRange(
            @Param("propertyId") Long propertyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Count active tenants by property
     */
    @Query("SELECT COUNT(t) FROM Tenant t WHERE t.property.id = :propertyId AND " +
            "t.leaseStart <= CURRENT_DATE AND t.leaseEnd >= CURRENT_DATE")
    Long countActiveTenantsForProperty(@Param("propertyId") Long propertyId);

    /**
     * Find tenants for tenant intelligence analytics
     */
    @Query("SELECT t FROM Tenant t WHERE " +
            "(:propertyId IS NULL OR t.property.id = :propertyId) AND " +
            "(:leaseStatus IS NULL OR " +
            "  CASE " +
            "    WHEN :leaseStatus = 'ACTIVE' THEN (t.leaseStart <= CURRENT_DATE AND t.leaseEnd >= CURRENT_DATE) " +
            "    WHEN :leaseStatus = 'EXPIRED' THEN (t.leaseEnd < CURRENT_DATE) " +
            "    WHEN :leaseStatus = 'FUTURE' THEN (t.leaseStart > CURRENT_DATE) " +
            "    ELSE true " +
            "  END = true)")
    Page<Tenant> findWithFilters(
            @Param("propertyId") Long propertyId,
            @Param("leaseStatus") String leaseStatus,
            Pageable pageable
    );
}