package org.example.backend.dto;

import org.example.backend.entity.Lease.LeaseStatus;
import org.example.backend.entity.Lease.LeaseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Lease entity.
 *
 * This DTO handles lease management operations and provides validation
 * for lease agreement data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class leaseDTO {

    private Long id;

    @Size(max = 100, message = "Lease number must not exceed 100 characters")
    private String leaseNumber;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date cannot be in the past")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDate endDate;

    @NotNull(message = "Monthly rent is required")
    @DecimalMin(value = "0.01", message = "Monthly rent must be greater than 0")
    private BigDecimal monthlyRent;

    @DecimalMin(value = "0.0", message = "Security deposit must be non-negative")
    private BigDecimal securityDeposit;

    @NotNull(message = "Status is required")
    private LeaseStatus status;

    private LeaseType leaseType;

    @Size(max = 50, message = "Unit number must not exceed 50 characters")
    private String unitNumber;

    @Min(value = 0, message = "Square footage must be non-negative")
    private Integer squareFootage;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    private Boolean autoRenewal;

    @NotNull(message = "Tenant ID is required")
    private Long tenantId;

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    // Additional fields for display
    private String tenantName;
    private String tenantEmail;
    private String propertyName;
    private String propertyAddress;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Calculated fields
    private Long daysRemaining;
    private BigDecimal totalValue; // monthlyRent * lease duration in months
    private Boolean isActive;

    @AssertTrue(message = "End date must be after start date")
    private boolean isEndDateAfterStartDate() {
        return endDate == null || startDate == null || endDate.isAfter(startDate);
    }
}