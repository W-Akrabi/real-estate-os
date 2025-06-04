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

/**
 * MaintenanceRequest entity representing maintenance and repair requests for properties.
 *
 * This entity supports the maintenance management system, tracking requests from
 * submission through completion with status updates and cost tracking.
 */
@Entity
@Table(name = "maintenance_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 2000)
    private String description;

    /**
     * Request status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status;

    /**
     * Priority level: LOW, MEDIUM, HIGH, URGENT
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Priority priority;

    /**
     * Category of maintenance: PLUMBING, ELECTRICAL, HVAC, GENERAL, etc.
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Category category;

    /**
     * Unit number where the maintenance is needed
     */
    @Column(name = "unit_number", length = 50)
    private String unitNumber;

    /**
     * Name of the person who reported the issue
     */
    @Column(name = "reported_by", length = 255)
    private String reportedBy;

    /**
     * Contact information for the reporter
     */
    @Column(name = "reporter_contact", length = 255)
    private String reporterContact;

    /**
     * Assigned contractor or maintenance person
     */
    @Column(name = "assigned_to", length = 255)
    private String assignedTo;

    /**
     * Estimated cost for the maintenance work
     */
    @Column(name = "estimated_cost", precision = 10, scale = 2)
    private BigDecimal estimatedCost;

    /**
     * Actual cost after completion
     */
    @Column(name = "actual_cost", precision = 10, scale = 2)
    private BigDecimal actualCost;

    /**
     * Date when work was scheduled
     */
    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate;

    /**
     * Date when work was completed
     */
    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    /**
     * Additional notes or comments
     */
    @Column(length = 1000)
    private String notes;

    /**
     * Many-to-one relationship with property
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Enum for request status
     */
    public enum RequestStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        ON_HOLD
    }

    /**
     * Enum for priority levels
     */
    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }

    /**
     * Enum for maintenance categories
     */
    public enum Category {
        PLUMBING,
        ELECTRICAL,
        HVAC,
        GENERAL,
        APPLIANCE,
        STRUCTURAL,
        LANDSCAPING,
        SECURITY,
        CLEANING,
        OTHER
    }

    /**
     * Helper method to check if request is overdue
     */
    public boolean isOverdue() {
        return scheduledDate != null &&
                scheduledDate.isBefore(LocalDateTime.now()) &&
                status != RequestStatus.COMPLETED &&
                status != RequestStatus.CANCELLED;
    }
}
