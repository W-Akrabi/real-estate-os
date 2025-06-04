package org.example.backend.dto;

import org.example.backend.entity.MaintenanceRequest.RequestStatus;
import org.example.backend.entity.MaintenanceRequest.Priority;
import org.example.backend.entity.MaintenanceRequest.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for MaintenanceRequest entity.
 *
 * This DTO supports maintenance management operations with validation
 * and calculated fields for dashboard analytics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class maintenanceRequestDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Status is required")
    private RequestStatus status;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private Category category;

    @Size(max = 50, message = "Unit number must not exceed 50 characters")
    private String unitNumber;

    @Size(max = 255, message = "Reported by must not exceed 255 characters")
    private String reportedBy;

    @Size(max = 255, message = "Reporter contact must not exceed 255 characters")
    private String reporterContact;

    @Size(max = 255, message = "Assigned to must not exceed 255 characters")
    private String assignedTo;

    @DecimalMin(value = "0.0", message = "Estimated cost must be non-negative")
    private BigDecimal estimatedCost;

    @DecimalMin(value = "0.0", message = "Actual cost must be non-negative")
    private BigDecimal actualCost;

    private LocalDateTime scheduledDate;
    private LocalDateTime completedDate;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    // Additional fields for display
    private String propertyName;
    private String propertyAddress;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Calculated fields for dashboard
    private Long daysOpen;
    private Long daysOverdue;
    private Boolean isOverdue;
    private Boolean isUrgent;
    private String statusColor; // For UI display
    private String priorityColor; // For UI display
}