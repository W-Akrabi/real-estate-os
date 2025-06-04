package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Data Transfer Object for forecast data used in predictive analytics.
 *
 * This DTO provides historical and predicted values for various metrics
 * optimized for time-series chart visualization.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class forecastDTO {

    private String metric; // RENT, VALUE, OCCUPANCY, ESG
    private String timeframe; // MONTHLY, QUARTERLY, YEARLY
    private LocalDate startDate;
    private LocalDate endDate;

    // Historical data points
    private List<ForecastDataPoint> historicalData;

    // Predicted/forecasted data points
    private List<ForecastDataPoint> forecastedData;

    // Confidence intervals for predictions
    private List<ConfidenceInterval> confidenceIntervals;

    // Forecast metadata
    private String forecastModel; // LINEAR_REGRESSION, ARIMA, etc.
    private BigDecimal accuracy; // Model accuracy percentage
    private String lastTrainingDate;

    // Trend analysis
    private String trendDirection; // INCREASING, DECREASING, STABLE
    private BigDecimal trendStrength; // 0-100 percentage
    private String seasonality; // NONE, MONTHLY, QUARTERLY, YEARLY

    /**
     * Individual forecast data point
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastDataPoint {
        private LocalDate date;
        private BigDecimal value;
        private Boolean isActual; // true for historical, false for predicted
        private String label; // Human-readable date label
        private Long propertyId; // Optional: for property-specific forecasts
        private String propertyName; // Optional: for property-specific forecasts
    }

    /**
     * Confidence interval for forecast uncertainty
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfidenceInterval {
        private LocalDate date;
        private BigDecimal lowerBound;
        private BigDecimal upperBound;
        private BigDecimal confidenceLevel; // e.g., 95.0 for 95% confidence
    }

    /**
     * Portfolio-level forecast summary
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PortfolioForecastSummary {
        private BigDecimal expectedRevenue12Months;
        private BigDecimal expectedValueAppreciation;
        private BigDecimal expectedOccupancyRate;
        private BigDecimal expectedEsgImprovement;
        private List<String> keyRisks;
        private List<String> opportunities;
    }
}