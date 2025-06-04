package org.example.backend.service;

org.example

import org.example.backend.dto.propertyDTO;
import org.example.backend.dto.
import org.example.dto.PropertyUpdateDTO;
import org.example.dto.PortfolioSummaryDTO;
import org.example.entity.Property;
import org.example.exception.ResourceNotFoundException;
import org.example.mapper.PropertyMapper;
import org.example.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyMapper propertyMapper;

    /**
     * Get all properties with pagination
     */
    public Page<PropertyDTO> getAllProperties(Pageable pageable) {
        log.debug("Fetching all properties with pagination: {}", pageable);
        Page<Property> properties = propertyRepository.findAll(pageable);
        return properties.map(propertyMapper::toDto);
    }

    /**
     * Get property by ID
     */
    public PropertyDTO getPropertyById(Long id) {
        log.debug("Fetching property with id: {}", id);
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
        return propertyMapper.toDto(property);
    }

    /**
     * Create new property
     */
    @Transactional
    public PropertyDTO createProperty(PropertyCreateDTO createDTO) {
        log.debug("Creating new property: {}", createDTO.getName());
        Property property = propertyMapper.toEntity(createDTO);
        Property savedProperty = propertyRepository.save(property);
        log.info("Created property with id: {}", savedProperty.getId());
        return propertyMapper.toDto(savedProperty);
    }

    /**
     * Update existing property
     */
    @Transactional
    public PropertyDTO updateProperty(Long id, PropertyUpdateDTO updateDTO) {
        log.debug("Updating property with id: {}", id);
        Property existingProperty = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));

        propertyMapper.updateEntityFromDto(updateDTO, existingProperty);
        Property savedProperty = propertyRepository.save(existingProperty);
        log.info("Updated property with id: {}", savedProperty.getId());
        return propertyMapper.toDto(savedProperty);
    }

    /**
     * Delete property
     */
    @Transactional
    public void deleteProperty(Long id) {
        log.debug("Deleting property with id: {}", id);
        if (!propertyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Property not found with id: " + id);
        }
        propertyRepository.deleteById(id);
        log.info("Deleted property with id: {}", id);
    }

    /**
     * Search properties by name or address
     */
    public Page<PropertyDTO> searchProperties(String searchTerm, Pageable pageable) {
        log.debug("Searching properties with term: {}", searchTerm);
        Page<Property> properties = propertyRepository.searchByNameOrAddress(searchTerm, pageable);
        return properties.map(propertyMapper::toDto);
    }

    /**
     * Filter properties by multiple criteria
     */
    public Page<PropertyDTO> filterProperties(String propertyType, BigDecimal minOccupancy,
                                              BigDecimal maxOccupancy, BigDecimal minEsgScore,
                                              BigDecimal maxEsgScore, Pageable pageable) {
        log.debug("Filtering properties with criteria - type: {}, occupancy: {}-{}, esg: {}-{}",
                propertyType, minOccupancy, maxOccupancy, minEsgScore, maxEsgScore);

        Page<Property> properties = propertyRepository.findWithFilters(
                propertyType, minOccupancy, maxOccupancy, minEsgScore, maxEsgScore, pageable);
        return properties.map(propertyMapper::toDto);
    }

    /**
     * Get portfolio summary for dashboard KPIs
     */
    public PortfolioSummaryDTO getPortfolioSummary() {
        log.debug("Fetching portfolio summary");
        PropertyRepository.PortfolioSummary summary = propertyRepository.getPortfolioSummary();
        return PortfolioSummaryDTO.builder()
                .totalProperties(summary.getTotalProperties())
                .totalUnits(summary.getTotalUnits())
                .occupiedUnits(summary.getOccupiedUnits())
                .avgOccupancyRate(summary.getAvgOccupancyRate())
                .totalRentalIncome(summary.getTotalRentalIncome())
                .totalAssetValue(summary.getTotalAssetValue())
                .avgEsgScore(summary.getAvgEsgScore())
                .build();
    }

    /**
     * Get top performing properties by rental income per unit
     */
    public List<PropertyDTO> getTopPerformingProperties(int limit) {
        log.debug("Fetching top {} performing properties", limit);
        List<Property> properties = propertyRepository.findTopPerformingProperties(
                Pageable.ofSize(limit));
        return properties.stream()
                .map(propertyMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get properties with low occupancy for alerts
     */
    public List<PropertyDTO> getLowOccupancyProperties(BigDecimal threshold) {
        log.debug("Fetching properties with occupancy below: {}", threshold);
        List<Property> properties = propertyRepository.findLowOccupancyProperties(threshold);
        return properties.stream()
                .map(propertyMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get properties needing ESG improvement
     */
    public List<PropertyDTO> getPropertiesNeedingEsgImprovement(BigDecimal threshold) {
        log.debug("Fetching properties needing ESG improvement below: {}", threshold);
        List<Property> properties = propertyRepository.findPropertiesNeedingEsgImprovement(threshold);
        return properties.stream()
                .map(propertyMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get properties within geographic bounds for map view
     */
    public List<PropertyDTO> getPropertiesInBounds(BigDecimal minLat, BigDecimal maxLat,
                                                   BigDecimal minLng, BigDecimal maxLng) {
        log.debug("Fetching properties in bounds: lat({}-{}), lng({}-{})",
                minLat, maxLat, minLng, maxLng);
        List<Property> properties = propertyRepository.findPropertiesInBounds(
                minLat, maxLat, minLng, maxLng);
        return properties.stream()
                .map(propertyMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get properties by occupancy rate range
     */
    public Page<PropertyDTO> getPropertiesByOccupancyRange(BigDecimal minOccupancy,
                                                           BigDecimal maxOccupancy, Pageable pageable) {
        log.debug("Fetching properties with occupancy rate between {} and {}", minOccupancy, maxOccupancy);
        Page<Property> properties = propertyRepository.findByOccupancyRateBetween(
                minOccupancy, maxOccupancy, pageable);
        return properties.map(propertyMapper::toDto);
    }

    /**
     * Get properties by ESG score range
     */
    public Page<PropertyDTO> getPropertiesByEsgRange(BigDecimal minEsgScore,
                                                     BigDecimal maxEsgScore, Pageable pageable) {
        log.debug("Fetching properties with ESG score between {} and {}", minEsgScore, maxEsgScore);
        Page<Property> properties = propertyRepository.findByEsgScoreBetween(
                minEsgScore, maxEsgScore, pageable);
        return properties.map(propertyMapper::toDto);
    }

    /**
     * Get properties by type
     */
    public Page<PropertyDTO> getPropertiesByType(String propertyType, Pageable pageable) {
        log.debug("Fetching properties of type: {}", propertyType);
        Page<Property> properties = propertyRepository.findByPropertyTypeIgnoreCase(propertyType, pageable);
        return properties.map(propertyMapper::toDto);
    }

    /**
     * Get high-income properties for analysis
     */
    public List<PropertyDTO> getHighIncomeProperties(BigDecimal threshold) {
        log.debug("Fetching properties with rental income above: {}", threshold);
        List<Property> properties = propertyRepository.findByRentalIncomeGreaterThan(threshold);
        return properties.stream()
                .map(propertyMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get historical data for forecasting
     */
    public List<PropertyDTO> getHistoricalData() {
        log.debug("Fetching historical property data for forecasting");
        List<Property> properties = propertyRepository.findAllOrderByCreatedAt();
        return properties.stream()
                .map(propertyMapper::toDto)
                .collect(Collectors.toList());
    }
}
