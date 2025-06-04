package org.example.backend.dto;

import org.example.backend.entity.Tenant.TenantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Tenant entity.
 *
 * This DTO provides validation and decouples the API from entity structure,
 * supporting tenant intelligence features.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class tenantDTO {

    private Long id;

    @NotBlank(message = "Tenant name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 255, message = "Emergency contact must not exceed 255 characters")
    private String emergencyContact;

    @Size(max = 20, message = "Emergency phone must not exceed 20 characters")
    private String emergencyPhone;

    private LocalDate leaseStart;
    private LocalDate leaseEnd;

    @DecimalMin(value = "0.0", message = "Monthly rent must be non-negative")
    private BigDecimal monthlyRent;

    @DecimalMin(value = "0.0", message = "Security deposit must be non-negative")
    private BigDecimal securityDeposit;

    private TenantStatus status;

    @Size(max = 50, message = "Unit number must not exceed 50 characters")
    private String unitNumber;

    @DecimalMin(value = "0.0", message = "Payment score must be non-negative")
    @DecimalMax(value = "100.0", message = "Payment score cannot exceed 100")
    private BigDecimal paymentScore;

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    // Additional fields for display
    private String propertyName;
    private String propertyAddress;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Helper fields for tenant intelligence
    private Long daysUntilLeaseExpiry;
    private Boolean leaseExpiringSoon; // Within 60 days
    private String tenantRiskLevel; // LOW, MEDIUM, HIGH
}