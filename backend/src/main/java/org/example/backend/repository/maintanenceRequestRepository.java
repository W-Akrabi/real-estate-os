package org.example.backend.repository;

import org.example.backend.entity.MaintenanceRequest;
import org.example.backend.entity.MaintenanceRequest.RequestStatus;
import org.example.backend.entity.MaintenanceRequest.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface maintanenceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {

    /**
     * Find maintenance requests by property ID
     */
    Page<MaintenanceRequest> findByPropertyId(Long propertyId, Pageable pageable);

    /**
     * Find maintenance requests by status
     */
    Page<MaintenanceRequest> findByStatus(RequestStatus status, Pageable pageable);

    /**
     * Find maintenance requests by priority
     */
    Page<MaintenanceRequest> findByPriority(Priority priority, Pageable pageable);

    /**
     * Find maintenance requests by assigned technician
     */
    Page<MaintenanceRequest> findByAssignedTechnicianIgnoreCase(String assignedTechnician, Pageable pageable);

    /**
     * Search maintenance requests by title or description
     */
    @Query("SELECT m FROM MaintenanceRequest m WHERE " +
            "LOWER(m.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(m.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<MaintenanceRequest> searchByTitleOrDescription(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find overdue maintenance requests (created more than X days ago and still open)
     */
    @Query("SELECT m FROM MaintenanceRequest m WHERE " +
            "m.status IN ('OPEN', 'IN_PROGRESS') AND " +
            "m.createdAt < :cutoffDate")
    List<MaintenanceRequest> findOverdueRequests(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * Find urgent maintenance requests (high priority and open)
     */
    @Query("SELECT m FROM MaintenanceRequest m WHERE " +
            "m.priority = 'HIGH' AND m.status IN ('OPEN', 'IN_PROGRESS')")
    List<MaintenanceRequest> findUrgentRequests();

    /**
     * Get maintenance request statistics by property
     */
    @Query("SELECT m.property.id, " +
            "COUNT(m) as totalRequests, " +
            "SUM(CASE WHEN m.status = 'OPEN' THEN 1 ELSE 0 END) as openRequests, " +
            "SUM(CASE WHEN m.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressRequests, " +
            "SUM(CASE WHEN m.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedRequests " +
            "FROM MaintenanceRequest m " +
            "GROUP BY m.property.id")
    List<Object[]> getMaintenanceStatsByProperty();

    /**
     * Find maintenance requests by date range
     */
    @Query("SELECT m FROM MaintenanceRequest m WHERE " +
            "m.createdAt BETWEEN :startDate AND :endDate")
    List<MaintenanceRequest> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find maintenance requests with multiple filters
     */
    @Query("SELECT m FROM MaintenanceRequest m WHERE " +
            "(:propertyId IS NULL OR m.property.id = :propertyId) AND " +
            "(:status IS NULL OR m.status = :status) AND " +
            "(:priority IS NULL OR m.priority = :priority)")
    Page<MaintenanceRequest> findWithFilters(
            @Param("propertyId") Long propertyId,
            @Param("status") RequestStatus status,
            @Param("priority") Priority priority,
            @Param("assignedTechnician") String assignedTechnician,
            Pageable pageable
    );

    /**
     * Count maintenance requests by status for dashboard KPIs
     */
    @Query("SELECT m.status, COUNT(m) FROM MaintenanceRequest m GROUP BY m.status")
    List<Object[]> countByStatus();

    /**
     * Find recent maintenance requests for dashboard
     */
    @Query("SELECT m FROM MaintenanceRequest m ORDER BY m.createdAt DESC")
    List<MaintenanceRequest> findRecentRequests(Pageable pageable);

    /**
     * Get maintenance cost trends (if cost field exists)
     */
    @Query("SELECT DATE(m.createdAt) as date, COUNT(m) as requestCount, COALESCE(SUM(m.estimatedCost), 0) as totalCost " +
            "FROM MaintenanceRequest m " +
            "WHERE m.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY DATE(m.createdAt) " +
            "ORDER BY DATE(m.createdAt)")
    List<Object[]> getMaintenanceTrendsByDate(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}