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
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Lease entity representing rental agreements between tenants and properties.
 *
 * This entity maintains historical lease records and supports lease management
 * functionality including renewals, terminations, and rent adjustments.
 */
@Entity
@Table(name = "leases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Lease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lease_number", unique = true, length = 100)
    private String leaseNumber;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    /**
     * Monthly rent amount for this lease period
     */
    @Column(name = "monthly_rent", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyRent;

    /**
     * Security deposit amount
     */
    @Column(name = "security_deposit", precision = 10, scale = 2)
    private BigDecimal securityDeposit;

    /**
     * Lease status: ACTIVE, EXPIRED, TERMINATED, RENEWED
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LeaseStatus status;

    /**
     * Lease type: FIXED_TERM, MONTH_TO_MONTH, PERIODIC
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "lease_type", length = 20)
    private LeaseType leaseType;

    /**
     * Unit or space identifier within the property
     */
    @Column(name = "unit_number", length = 50)
    private String unitNumber;

    /**
     * Square footage of the leased space
     */
    @Column(name = "square_footage")
    private Integer squareFootage;

    /**
     * Special terms or notes about the lease
     */
    @Column(length = 1000)
    private String notes;

    /**
     * Automatic renewal clause
     */
    @Column(name = "auto_renewal")
    private Boolean autoRenewal;

    /**
     * Many-to-one relationship with tenant
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

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
     * Enum for lease status
     */
    public enum LeaseStatus {
        ACTIVE,
        EXPIRED,
        TERMINATED,
        RENEWED,
        PENDING
    }

    /**
     * Enum for lease type
     */
    public enum LeaseType {
        FIXED_TERM,
        MONTH_TO_MONTH,
        PERIODIC
    }

    /**
     * Helper method to check if lease is currently active
     */
    public boolean isActive() {
        LocalDate now = LocalDate.now();
        return status == LeaseStatus.ACTIVE &&
                (startDate.isBefore(now) || startDate.isEqual(now)) &&
                (endDate.isAfter(now) || endDate.isEqual(now));
    }
}