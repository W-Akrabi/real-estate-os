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
import java.util.List;

/**
 * Tenant entity representing individuals or companies renting properties.
 *
 * This entity supports tenant intelligence features by storing contact information,
 * lease details, and rental history.
 */
@Entity
@Table(name = "tenants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "emergency_contact", length = 255)
    private String emergencyContact;

    @Column(name = "emergency_phone", length = 20)
    private String emergencyPhone;

    /**
     * Current lease start date
     */
    @Column(name = "lease_start")
    private LocalDate leaseStart;

    /**
     * Current lease end date
     */
    @Column(name = "lease_end")
    private LocalDate leaseEnd;

    /**
     * Monthly rent amount
     */
    @Column(name = "monthly_rent", precision = 10, scale = 2)
    private BigDecimal monthlyRent;

    /**
     * Security deposit amount
     */
    @Column(name = "security_deposit", precision = 10, scale = 2)
    private BigDecimal securityDeposit;

    /**
     * Tenant status: ACTIVE, INACTIVE, PENDING, TERMINATED
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TenantStatus status;

    /**
     * Unit number or identifier within the property
     */
    @Column(name = "unit_number", length = 50)
    private String unitNumber;

    /**
     * Payment history score (0-100)
     * Higher scores indicate better payment reliability
     */
    @Column(name = "payment_score", precision = 5, scale = 2)
    private BigDecimal paymentScore;

    /**
     * Many-to-one relationship with property
     * Multiple tenants can belong to the same property
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    /**
     * One-to-many relationship with leases (historical)
     * A tenant can have multiple lease records over time
     */
    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Lease> leases;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Enum for tenant status
     */
    public enum TenantStatus {
        ACTIVE,
        INACTIVE,
        PENDING,
        TERMINATED
    }
}