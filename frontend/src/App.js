import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Search, Filter, MapPin, Users, TrendingUp, Leaf, FileText, Settings, Bell, User, ChevronDown, Calendar, DollarSign, Building, Activity, Download, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// Mock Data
const mockKPIData = {
  occupancy: 87.5,
  rentalIncome: 245.7,
  assetValue: 2700,
  esgScore: 82
};

const mockForecastData = [
  { month: 'Jan 2025', rent: 245.7, predicted: 250.2 },
  { month: 'Feb 2025', rent: 248.1, predicted: 252.8 },
  { month: 'Mar 2025', rent: 251.3, predicted: 255.1 },
  { month: 'Apr 2025', rent: 254.8, predicted: 258.4 },
  { month: 'May 2025', rent: 257.2, predicted: 261.9 },
  { month: 'Jun 2025', rent: 260.1, predicted: 265.3 }
];

const mockTenantData = [
  { id: 1, name: 'Emirates NBD', sector: 'Banking', leaseEnd: '2026-12-31', churnRisk: 'Low', revenue: 45.2 },
  { id: 2, name: 'ADCB Securities', sector: 'Financial Services', leaseEnd: '2025-08-15', churnRisk: 'Medium', revenue: 32.1 },
  { id: 3, name: 'Mashreq Bank', sector: 'Banking', leaseEnd: '2027-03-20', churnRisk: 'Low', revenue: 38.7 },
  { id: 4, name: 'Accenture MENA', sector: 'Consulting', leaseEnd: '2025-11-30', churnRisk: 'High', revenue: 28.5 },
  { id: 5, name: 'PwC Middle East', sector: 'Professional Services', leaseEnd: '2026-06-15', churnRisk: 'Low', revenue: 41.3 }
];

const mockBuildingData = [
  { id: 1, name: 'Gate District', lat: 25.2285, lng: 55.2830, occupancy: 92, value: 450 },
  { id: 2, name: 'Index Tower', lat: 25.2290, lng: 55.2825, occupancy: 85, value: 380 },
  { id: 3, name: 'Liberty House', lat: 25.2275, lng: 55.2835, occupancy: 78, value: 320 },
  { id: 4, name: 'Central Park Towers', lat: 25.2295, lng: 55.2820, occupancy: 94, value: 520 }
];

const mockDocuments = [
  { id: 1, name: 'Gate District - Fire Safety Certificate', type: 'Safety', building: 'Gate District', status: 'Valid', expiryDate: '2025-12-15', daysToExpiry: 198 },
  { id: 2, name: 'Index Tower - Insurance Policy', type: 'Insurance', building: 'Index Tower', status: 'Expired', expiryDate: '2025-04-20', daysToExpiry: -41 },
  { id: 3, name: 'Emirates NBD - Lease Agreement', type: 'Lease', building: 'Gate District', status: 'Valid', expiryDate: '2026-12-31', daysToExpiry: 579 },
  { id: 4, name: 'Liberty House - ESG Certificate', type: 'ESG', building: 'Liberty House', status: 'Upcoming', expiryDate: '2025-07-10', daysToExpiry: 40 },
  { id: 5, name: 'Central Park - Building Permit', type: 'Regulatory', building: 'Central Park Towers', status: 'Valid', expiryDate: '2027-03-25', daysToExpiry: 933 }
];

// Reusable Components
const KpiCard = ({ title, value, unit, change, icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800"
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">
            {value}{unit && <span className="text-lg ml-1">{unit}</span>}
          </p>
          {change && (
            <p className={`text-sm mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% vs last month
            </p>
          )}
        </div>
        <Icon className="w-8 h-8 opacity-60" />
      </div>
    </div>
  );
};

const FilterBar = ({ filters, activeFilter, onFilterChange, additionalFilters = [] }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <select
          value={activeFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {filters.map(filter => (
            <option key={filter.value} value={filter.value}>{filter.label}</option>
          ))}
        </select>
      </div>
      {additionalFilters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2">
          <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('2025');

  const filters = [
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: 'office', label: 'Office Buildings' },
    { value: 'retail', label: 'Retail Spaces' }
  ];

  const additionalFilters = [
    {
      options: [
        { value: 'all', label: 'All Buildings' },
        { value: 'gate', label: 'Gate District' },
        { value: 'index', label: 'Index Tower' }
      ]
    }
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time insights for $2.7B real estate portfolio</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Export Data
          </button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        additionalFilters={additionalFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Portfolio Occupancy"
          value={mockKPIData.occupancy}
          unit="%"
          change={2.3}
          icon={Building}
          color="blue"
        />
        <KpiCard
          title="Monthly Rental Income"
          value={mockKPIData.rentalIncome}
          unit="M AED"
          change={5.2}
          icon={DollarSign}
          color="green"
        />
        <KpiCard
          title="Total Asset Value"
          value={mockKPIData.assetValue}
          unit="M AED"
          change={1.8}
          icon={TrendingUp}
          color="purple"
        />
        <KpiCard
          title="ESG Score"
          value={mockKPIData.esgScore}
          unit="/100"
          change={3.1}
          icon={Leaf}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockForecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rent" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Occupancy by Building</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockBuildingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="occupancy" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Forecast Module
const ForecastModule = ({ darkMode }) => {
  // Enhanced mock data with extended forecast period and additional metrics
  const extendedMockForecastData = [
    { month: 'Jan 2025', rent: 245.7, predicted: 250.2, optimistic: 255.3, pessimistic: 245.1, lowerBound: 242.5, upperBound: 258.0, marketAvg: 240.5 },
    { month: 'Feb 2025', rent: 248.1, predicted: 252.8, optimistic: 258.9, pessimistic: 246.7, lowerBound: 245.0, upperBound: 260.6, marketAvg: 242.3 },
    { month: 'Mar 2025', rent: 251.3, predicted: 255.1, optimistic: 262.4, pessimistic: 248.0, lowerBound: 247.2, upperBound: 263.0, marketAvg: 244.8 },
    { month: 'Apr 2025', rent: 254.8, predicted: 258.4, optimistic: 266.1, pessimistic: 250.9, lowerBound: 250.1, upperBound: 266.7, marketAvg: 247.2 },
    { month: 'May 2025', rent: 257.2, predicted: 261.9, optimistic: 270.5, pessimistic: 253.2, lowerBound: 253.5, upperBound: 270.3, marketAvg: 249.5 },
    { month: 'Jun 2025', rent: 260.1, predicted: 265.3, optimistic: 274.8, pessimistic: 255.8, lowerBound: 256.8, upperBound: 273.8, marketAvg: 251.9 },
    { month: 'Jul 2025', rent: null, predicted: 269.2, optimistic: 279.6, pessimistic: 258.8, lowerBound: 260.1, upperBound: 278.3, marketAvg: 254.4 },
    { month: 'Aug 2025', rent: null, predicted: 273.5, optimistic: 284.9, pessimistic: 262.1, lowerBound: 263.7, upperBound: 283.3, marketAvg: 257.0 },
    { month: 'Sep 2025', rent: null, predicted: 278.1, optimistic: 290.5, pessimistic: 265.7, lowerBound: 267.5, upperBound: 288.7, marketAvg: 259.6 },
    { month: 'Oct 2025', rent: null, predicted: 283.2, optimistic: 296.4, pessimistic: 269.8, lowerBound: 271.6, upperBound: 294.8, marketAvg: 262.2 },
    { month: 'Nov 2025', rent: null, predicted: 288.7, optimistic: 302.8, pessimistic: 274.3, lowerBound: 276.0, upperBound: 301.4, marketAvg: 264.8 },
    { month: 'Dec 2025', rent: null, predicted: 294.5, optimistic: 309.7, pessimistic: 279.2, lowerBound: 280.7, upperBound: 308.3, marketAvg: 267.5 }
  ];

  // Property-specific forecast data
  const propertyForecastData = [
    { id: 1, name: 'Gate District', currentRent: 92.3, predictedGrowth: 8.7, occupancyTrend: 'Increasing', riskScore: 'Low', recommendedAction: 'Maintain current pricing strategy' },
    { id: 2, name: 'Index Tower', currentRent: 85.1, predictedGrowth: 5.2, occupancyTrend: 'Stable', riskScore: 'Medium', recommendedAction: 'Consider minor rent adjustments in Q3' },
    { id: 3, name: 'Liberty House', currentRent: 68.3, predictedGrowth: 3.1, occupancyTrend: 'Decreasing', riskScore: 'High', recommendedAction: 'Implement tenant retention program' },
    { id: 4, name: 'Central Park Towers', currentRent: 94.0, predictedGrowth: 9.5, occupancyTrend: 'Increasing', riskScore: 'Low', recommendedAction: 'Opportunity for premium pricing' }
  ];

  // Market factors affecting forecast
  const marketFactors = [
    { factor: 'Interest Rates', impact: 'High', trend: 'Increasing', effect: 'Negative', description: 'Rising interest rates may reduce investment in commercial real estate' },
    { factor: 'Economic Growth', impact: 'High', trend: 'Stable', effect: 'Positive', description: 'Steady GDP growth supports rental price stability' },
    { factor: 'Office Demand', impact: 'Medium', trend: 'Increasing', effect: 'Positive', description: 'Post-pandemic return to office boosting demand' },
    { factor: 'New Construction', impact: 'Medium', trend: 'Stable', effect: 'Neutral', description: 'Supply remains balanced with demand in DUBAI area' },
    { factor: 'Foreign Investment', impact: 'High', trend: 'Increasing', effect: 'Positive', description: 'Growing interest from international investors in Dubai market' }
  ];

  // AI-generated insights
  const aiInsights = [
    'Premium office spaces are projected to outperform standard units by 12% in the next 12 months',
    'Properties with ESG certifications show 8.3% higher rental growth compared to non-certified buildings',
    'Tenant retention rates correlate strongly with building amenities and services quality',
    'Market volatility is expected to decrease in Q3 2025 based on economic indicators',
    'Rental growth is projected to exceed inflation by 2.7% over the forecast period'
  ];

  // State management
  const [forecastData, setForecastData] = useState(extendedMockForecastData);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('baseline');
  const [forecastPeriod, setForecastPeriod] = useState(12);
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true);
  const [showMarketComparison, setShowMarketComparison] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate key metrics
  const annualGrowthRate = 7.8;
  const forecastAccuracy = 94.2;
  const marketOutperformance = 5.3;
  const volatilityIndex = 0.42;
  const confidenceScore = 87;
  const seasonalityImpact = 'Moderate';

  // Run forecast with different scenarios
  const runForecast = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Apply random variations to the forecast data based on selected scenario
      const variationFactor = selectedScenario === 'optimistic' ? 1.5 :
                             selectedScenario === 'pessimistic' ? 0.5 : 1;

      const newData = extendedMockForecastData.map(item => {
        const randomVariation = (Math.random() * 10 - 5) * variationFactor;
        return {
          ...item,
          predicted: item.predicted + randomVariation,
          optimistic: item.optimistic + (randomVariation * 1.5),
          pessimistic: item.pessimistic + (randomVariation * 0.5),
          lowerBound: item.lowerBound + (randomVariation * 0.3),
          upperBound: item.upperBound + (randomVariation * 1.7),
        };
      });
      setForecastData(newData);
      setIsLoading(false);
    }, 2000);
  };

  // Get line data based on selected scenario
  const getLineData = () => {
    switch(selectedScenario) {
      case 'optimistic':
        return { dataKey: 'optimistic', color: '#10B981', name: 'Optimistic Forecast' };
      case 'pessimistic':
        return { dataKey: 'pessimistic', color: '#F59E0B', name: 'Pessimistic Forecast' };
      default:
        return { dataKey: 'predicted', color: '#3B82F6', name: 'Baseline Forecast' };
    }
  };

  const lineData = getLineData();

  // Get trend indicator icon and color
  const getTrendIndicator = (trend) => {
    if (trend === 'Increasing') return { icon: '↗', color: 'text-green-600' };
    if (trend === 'Decreasing') return { icon: '↘', color: 'text-red-600' };
    return { icon: '→', color: 'text-blue-600' };
  };

  // Get risk color
  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'text-green-600';
    if (risk === 'Medium') return 'text-yellow-600';
    if (risk === 'High') return 'text-red-600';
    return 'text-gray-600';
  };

  // Get impact color
  const getImpactColor = (impact) => {
    if (impact === 'High') return 'text-red-600';
    if (impact === 'Medium') return 'text-yellow-600';
    if (impact === 'Low') return 'text-green-600';
    return 'text-gray-600';
  };

  // Get effect color
  const getEffectColor = (effect) => {
    if (effect === 'Positive') return 'text-green-600';
    if (effect === 'Negative') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Advanced Revenue Forecasting</h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>AI-powered predictive analytics with multi-scenario modeling</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runForecast}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Running Forecast...' : 'Run New Forecast'}
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Forecast Controls */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
        <div className="flex flex-wrap gap-6 items-center">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Forecast Scenario</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="baseline">Baseline</option>
              <option value="optimistic">Optimistic</option>
              <option value="pessimistic">Pessimistic</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Forecast Period</label>
            <select
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
              <option value={24}>24 Months</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="confidenceInterval"
              checked={showConfidenceInterval}
              onChange={() => setShowConfidenceInterval(!showConfidenceInterval)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="confidenceInterval" className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Show Confidence Interval
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="marketComparison"
              checked={showMarketComparison}
              onChange={() => setShowMarketComparison(!showMarketComparison)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="marketComparison" className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Show Market Comparison
            </label>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'overview' 
            ? `border-b-2 border-blue-600 ${darkMode ? 'text-blue-400' : 'text-blue-600'}` 
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'properties' 
            ? `border-b-2 border-blue-600 ${darkMode ? 'text-blue-400' : 'text-blue-600'}` 
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}`}
        >
          Property Analysis
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'market' 
            ? `border-b-2 border-blue-600 ${darkMode ? 'text-blue-400' : 'text-blue-600'}` 
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}`}
        >
          Market Factors
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'insights' 
            ? `border-b-2 border-blue-600 ${darkMode ? 'text-blue-400' : 'text-blue-600'}` 
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}`}
        >
          AI Insights
        </button>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg mb-8`}>
            <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {forecastPeriod}-Month Revenue Projection ({selectedScenario.charAt(0).toUpperCase() + selectedScenario.slice(1)} Scenario)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={forecastData.slice(0, forecastPeriod)}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip contentStyle={darkMode ? { backgroundColor: '#1f2937', border: 'none', color: '#f9fafb' } : {}} />
                <Legend />
                {forecastData[0].rent !== null && (
                  <Line
                    type="monotone"
                    dataKey="rent"
                    stroke="#10B981"
                    strokeWidth={3}
                    name="Actual Revenue"
                    dot={{ r: 4 }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey={lineData.dataKey}
                  stroke={lineData.color}
                  strokeWidth={3}
                  name={lineData.name}
                  dot={{ r: 4 }}
                />
                {showConfidenceInterval && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="upperBound"
                      stroke="#93c5fd"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="Upper Bound (95% CI)"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="lowerBound"
                      stroke="#93c5fd"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="Lower Bound (95% CI)"
                      dot={false}
                    />
                  </>
                )}
                {showMarketComparison && (
                  <Line
                    type="monotone"
                    dataKey="marketAvg"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    name="Market Average"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Forecast Accuracy</h4>
              <div className="flex items-end">
                <p className="text-3xl font-bold text-green-600">{forecastAccuracy}%</p>
                <p className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>confidence level</p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${forecastAccuracy}%` }}></div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Based on 5-year historical data analysis</p>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Annual Growth Rate</h4>
              <div className="flex items-end">
                <p className="text-3xl font-bold text-blue-600">+{annualGrowthRate}%</p>
                <p className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>CAGR</p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Market: +{annualGrowthRate - marketOutperformance}%</span>
                  <span className="text-green-600">+{marketOutperformance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Outperforming market by {marketOutperformance}%</p>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Forecast Volatility</h4>
              <div className="flex items-end">
                <p className="text-3xl font-bold text-orange-600">{volatilityIndex}</p>
                <p className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>volatility index</p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                  <div className="absolute top-0 left-0 h-2.5 w-2 bg-black rounded-full" style={{ left: `${volatilityIndex * 100}%` }}></div>
                  <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2.5 rounded-full w-full"></div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Based on market volatility and economic indicators</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Scenario Comparison</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} w-28`}>Baseline:</span>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>+{annualGrowthRate}% growth</span>
                  <span className="ml-auto font-semibold">294.5M AED</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} w-28`}>Optimistic:</span>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>+{(annualGrowthRate * 1.3).toFixed(1)}% growth</span>
                  <span className="ml-auto font-semibold">309.7M AED</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} w-28`}>Pessimistic:</span>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>+{(annualGrowthRate * 0.7).toFixed(1)}% growth</span>
                  <span className="ml-auto font-semibold">279.2M AED</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Scenario Probability:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">20%</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">65%</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">15%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Forecast Metrics</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confidence Score:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{confidenceScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Seasonality Impact:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{seasonalityImpact}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Market Outperformance:</span>
                  <span className={`font-semibold text-green-600`}>+{marketOutperformance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Forecast Horizon:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{forecastPeriod} months</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Updated:</span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Today, 10:45 AM</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-medium text-blue-600">Note:</span> Forecast incorporates 27 economic variables and 5-year historical performance data
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Property Analysis Tab Content */}
      {activeTab === 'properties' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-6`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Property Performance</h4>
              <div className="space-y-4">
                {propertyForecastData.map(property => {
                  const trend = getTrendIndicator(property.occupancyTrend);
                  return (
                    <div
                      key={property.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedProperty?.id === property.id 
                          ? `${darkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border-2` 
                          : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`
                      }`}
                      onClick={() => setSelectedProperty(property)}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{property.name}</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          property.riskScore === 'Low' ? 'bg-green-100 text-green-800' :
                          property.riskScore === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>{property.riskScore} Risk</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Rent</p>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{property.currentRent}M AED</p>
                        </div>
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Predicted Growth</p>
                          <p className="font-semibold text-green-600">+{property.predictedGrowth}%</p>
                        </div>
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Occupancy Trend</p>
                          <p className={`font-semibold ${trend.color} flex items-center`}>
                            {property.occupancyTrend} <span className="ml-1">{trend.icon}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedProperty ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <div className="flex justify-between items-center mb-6">
                  <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProperty.name} Forecast</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProperty.riskScore === 'Low' ? 'bg-green-100 text-green-800' :
                    selectedProperty.riskScore === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{selectedProperty.riskScore} Risk Profile</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Monthly Revenue</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProperty.currentRent}M AED</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Projected Growth (12m)</p>
                    <p className="text-2xl font-bold text-green-600">+{selectedProperty.predictedGrowth}%</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Projected Revenue (EOY)</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {(selectedProperty.currentRent * (1 + selectedProperty.predictedGrowth / 100)).toFixed(1)}M AED
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Key Performance Indicators</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Occupancy Rate</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedProperty.name === 'Gate District' ? '92%' :
                         selectedProperty.name === 'Index Tower' ? '85%' :
                         selectedProperty.name === 'Liberty House' ? '78%' : '94%'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tenant Retention</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedProperty.name === 'Gate District' ? '87%' :
                         selectedProperty.name === 'Index Tower' ? '82%' :
                         selectedProperty.name === 'Liberty House' ? '74%' : '91%'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg. Lease Term</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedProperty.name === 'Gate District' ? '3.2 yrs' :
                         selectedProperty.name === 'Index Tower' ? '2.8 yrs' :
                         selectedProperty.name === 'Liberty House' ? '2.5 yrs' : '3.5 yrs'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Market Position</p>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedProperty.name === 'Gate District' ? 'Premium' :
                         selectedProperty.name === 'Index Tower' ? 'Premium' :
                         selectedProperty.name === 'Liberty House' ? 'Standard' : 'Premium+'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Forecast Confidence</h5>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{
                      width: `${selectedProperty.name === 'Gate District' ? '88%' : 
                              selectedProperty.name === 'Index Tower' ? '82%' : 
                              selectedProperty.name === 'Liberty House' ? '75%' : '92%'}`
                    }}></div>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                    Based on historical performance data and current market conditions
                  </p>
                </div>

                <div className="mb-6">
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>AI Recommendation</h5>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedProperty.recommendedAction}</p>
                  </div>
                </div>

                <div>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Risk Factors</h5>
                  <div className="space-y-2">
                    {selectedProperty.name === 'Gate District' ? (
                      <>
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Increasing competition from new developments</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Strong tenant mix with high credit ratings</span>
                        </div>
                      </>
                    ) : selectedProperty.name === 'Index Tower' ? (
                      <>
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Two major lease renewals in Q3 2025</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Aging HVAC system may require capital expenditure</span>
                        </div>
                      </>
                    ) : selectedProperty.name === 'Liberty House' ? (
                      <>
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Declining occupancy trend over last 3 quarters</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Major tenant considering relocation (15% of revenue)</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Premium positioning allows for above-market rent growth</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Waiting list for available space indicates strong demand</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg flex flex-col items-center justify-center h-full`}>
                <Building className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} />
                <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select a property to view detailed forecast</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Market Factors Tab Content */}
      {activeTab === 'market' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Market Factors Influencing Forecast</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Factor</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Impact</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Trend</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Effect</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Description</th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
                    {marketFactors.map((factor, index) => {
                      const trendIndicator = getTrendIndicator(factor.trend);
                      return (
                        <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{factor.factor}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${getImpactColor(factor.impact)}`}>{factor.impact}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${trendIndicator.color} flex items-center`}>
                            {factor.trend} <span className="ml-1">{trendIndicator.icon}</span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${getEffectColor(factor.effect)}`}>{factor.effect}</td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{factor.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Market Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Rental Growth vs. Market</h5>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { name: 'Group Portfolio', value: 7.8 },
                      { name: 'Dubai Average', value: 5.2 },
                      { name: 'Premium Office', value: 6.5 },
                      { name: 'Financial District', value: 6.9 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <Tooltip contentStyle={darkMode ? { backgroundColor: '#1f2937', border: 'none' } : {}} />
                      <Bar dataKey="value" fill="#3B82F6" name="Annual Growth %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h5 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Occupancy Rate Comparison</h5>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { name: 'GROUP Portfolio', value: 87.5 },
                      { name: 'Dubai Average', value: 82.1 },
                      { name: 'Premium Office', value: 85.3 },
                      { name: 'Financial District', value: 86.2 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <Tooltip contentStyle={darkMode ? { backgroundColor: '#1f2937', border: 'none' } : {}} />
                      <Bar dataKey="value" fill="#10B981" name="Occupancy %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Economic Indicators</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>GDP Growth (UAE)</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>3.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Inflation Rate</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>2.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Interest Rate</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>4.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Foreign Investment</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>+12.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Business Confidence</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>68/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Seasonal Factors</h4>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-4`}>
                <h5 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Seasonal Adjustment</h5>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Forecast includes seasonal adjustments based on 5-year historical patterns. Q1 and Q4 typically show stronger performance.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Q1 Seasonal Factor:</span>
                  <span className={`text-sm font-medium text-green-600`}>+1.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Q2 Seasonal Factor:</span>
                  <span className={`text-sm font-medium text-yellow-600`}>-0.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Q3 Seasonal Factor:</span>
                  <span className={`text-sm font-medium text-yellow-600`}>-0.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Q4 Seasonal Factor:</span>
                  <span className={`text-sm font-medium text-green-600`}>+0.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab Content */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI-Generated Insights</h4>
              </div>

              <div className="space-y-6">
                {aiInsights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Strategic Recommendations</h4>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border-l-4 border-green-500`}>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Pricing Strategy</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Implement tiered pricing increases based on property performance. Premium properties (Central Park Towers, Gate District) can sustain 5-7% increases, while Liberty House should maintain current rates to improve occupancy.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'} border-l-4 border-yellow-500`}>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Tenant Retention</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Develop targeted retention programs for Liberty House, focusing on lease renewals in Q3 2025. Consider offering flexible terms and building improvements to key tenants.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Capital Improvements</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Prioritize ESG-related improvements across the portfolio to capitalize on premium pricing opportunities. Focus on Index Tower HVAC upgrades to maintain competitive positioning.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'} border-l-4 border-purple-500`}>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Market Positioning</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Leverage strong market outperformance in marketing materials. Highlight portfolio resilience against economic factors and premium positioning in the GROUP area.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Forecast Confidence Score</h4>
              <div className="flex justify-center mb-4">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                      strokeDasharray="100, 100"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray={`${confidenceScore}, 100`}
                    />
                    <text x="18" y="20.5" textAnchor="middle" fontSize="8" fill={darkMode ? 'white' : '#374151'} fontWeight="bold">
                      {confidenceScore}%
                    </text>
                  </svg>
                </div>
              </div>
              <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Based on model accuracy, data quality, and market predictability
              </p>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Model Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Model Type:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ensemble ML</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Variables Used:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>27</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Training Data:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>5 years</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Updated:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Today, 10:45 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Validation Method:</span>
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Cross-validation</span>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Data Sources</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Historical Portfolio Performance</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>UAE Central Bank Economic Data</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dubai Land Department Market Reports</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>GROUP Economic Outlook</span>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Global Financial Markets Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ESG Simulator
const ESGSimulator = ({ darkMode }) => {
  // Mock ESG data for buildings
  const buildingsESGData = [
    { id: 1, name: 'Gate District', esgScore: 85, environmentalScore: 88, socialScore: 82, governanceScore: 84, co2Emissions: 180, energyEfficiency: 'A-', waterUsage: 'B+', wasteManagement: 'A', certifications: ['LEED Gold', 'WELL Gold'] },
    { id: 2, name: 'Index Tower', esgScore: 78, environmentalScore: 75, socialScore: 80, governanceScore: 82, co2Emissions: 210, energyEfficiency: 'B+', waterUsage: 'B', wasteManagement: 'B+', certifications: ['LEED Silver'] },
    { id: 3, name: 'Liberty House', esgScore: 72, environmentalScore: 68, socialScore: 75, governanceScore: 76, co2Emissions: 245, energyEfficiency: 'B-', waterUsage: 'C+', wasteManagement: 'B-', certifications: ['BREEAM Good'] },
    { id: 4, name: 'Central Park Towers', esgScore: 88, environmentalScore: 90, socialScore: 85, governanceScore: 87, co2Emissions: 150, energyEfficiency: 'A', waterUsage: 'A-', wasteManagement: 'A+', certifications: ['LEED Platinum', 'WELL Platinum'] }
  ];

  // Industry benchmarks
  const industryBenchmarks = {
    esgScore: { average: 74, topQuartile: 85, bottomQuartile: 65 },
    co2Emissions: { average: 220, topQuartile: 170, bottomQuartile: 280 },
    energyEfficiency: { average: 'B', topQuartile: 'A-', bottomQuartile: 'C+' },
    waterUsage: { average: 'B-', topQuartile: 'B+', bottomQuartile: 'C' },
    roi: { average: 8.5, topQuartile: 12, bottomQuartile: 5 }
  };

  // Historical ESG performance data
  const historicalESGData = [
    { year: 2020, esgScore: 68, environmentalScore: 65, socialScore: 70, governanceScore: 72, co2Emissions: 280 },
    { year: 2021, esgScore: 72, environmentalScore: 70, socialScore: 73, governanceScore: 74, co2Emissions: 260 },
    { year: 2022, esgScore: 75, environmentalScore: 74, socialScore: 76, governanceScore: 76, co2Emissions: 240 },
    { year: 2023, esgScore: 78, environmentalScore: 77, socialScore: 78, governanceScore: 79, co2Emissions: 220 },
    { year: 2024, esgScore: 81, environmentalScore: 80, socialScore: 81, governanceScore: 82, co2Emissions: 200 }
  ];

  // ESG improvement strategies
  const esgStrategies = [
    { id: 1, name: 'Energy Efficiency Upgrade', cost: 'High', impact: 'High', roi: 14.5, co2Reduction: 25, timeframe: 'Medium', description: 'Comprehensive HVAC system upgrade with smart building technology integration' },
    { id: 2, name: 'Renewable Energy Installation', cost: 'High', impact: 'High', roi: 12.8, co2Reduction: 30, timeframe: 'Long', description: 'Solar panel installation on rooftops and facades with battery storage systems' },
    { id: 3, name: 'Water Conservation Systems', cost: 'Medium', impact: 'Medium', roi: 9.5, co2Reduction: 5, timeframe: 'Short', description: 'Greywater recycling and rainwater harvesting systems with smart irrigation' },
    { id: 4, name: 'Waste Management Optimization', cost: 'Low', impact: 'Medium', roi: 11.2, co2Reduction: 8, timeframe: 'Short', description: 'Comprehensive waste sorting, recycling, and composting program' },
    { id: 5, name: 'Green Building Certification', cost: 'Medium', impact: 'High', roi: 15.3, co2Reduction: 20, timeframe: 'Medium', description: 'LEED or BREEAM certification process with building upgrades' }
  ];

  // AI-generated insights
  const aiInsights = [
    'Buildings with LEED Platinum certification command 12% higher rental premiums in the GROUP area',
    'Energy efficiency improvements show the highest ROI among all ESG initiatives for buildings over 15 years old',
    'Water conservation measures are increasingly important as UAE water costs are projected to rise 15% by 2027',
    'Tenant satisfaction increases 23% in buildings with comprehensive ESG programs',
    'Carbon neutrality targets are becoming essential for attracting international corporate tenants',
    'ESG-certified buildings show 8% lower vacancy rates compared to non-certified properties'
  ];

  // State management
  const [formData, setFormData] = useState({
    buildingType: 'office',
    age: 10,
    currentCO2: 150,
    retrofitBudget: 5000000,
    targetCertification: 'leed-gold',
    implementationTimeframe: 'medium',
    priorityArea: 'energy'
  });

  const [results, setResults] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [activeTab, setActiveTab] = useState('simulator');
  const [simulationScenario, setSimulationScenario] = useState('moderate');
  const [isLoading, setIsLoading] = useState(false);

  // Run ESG simulation with enhanced calculations
  const simulateESG = () => {
    setIsLoading(true);

    // Simulate API call with delay
    setTimeout(() => {
      // Base calculations
      const co2Reduction = (formData.currentCO2 * 0.3).toFixed(1);
      const baseRoi = 12 - (formData.age * 0.2);

      // Apply scenario adjustments
      const scenarioMultiplier =
        simulationScenario === 'conservative' ? 0.8 :
        simulationScenario === 'aggressive' ? 1.2 : 1;

      // Apply building type adjustments
      const buildingTypeMultiplier =
        formData.buildingType === 'office' ? 1 :
        formData.buildingType === 'retail' ? 0.9 : 1.1;

      // Apply priority area focus
      const priorityAreaMultiplier =
        formData.priorityArea === 'energy' ? { roi: 1.2, co2: 1.3, water: 0.9, social: 0.8 } :
        formData.priorityArea === 'water' ? { roi: 0.9, co2: 0.8, water: 1.4, social: 0.9 } :
        formData.priorityArea === 'waste' ? { roi: 1.0, co2: 1.1, water: 0.8, social: 0.9 } :
        { roi: 0.8, co2: 0.7, water: 0.8, social: 1.3 };

      // Calculate adjusted values
      const adjustedRoi = (baseRoi * scenarioMultiplier * buildingTypeMultiplier * priorityAreaMultiplier.roi).toFixed(1);
      const adjustedCo2Reduction = (co2Reduction * scenarioMultiplier * priorityAreaMultiplier.co2).toFixed(1);
      const paybackPeriod = (formData.retrofitBudget / (formData.retrofitBudget * (adjustedRoi / 100))).toFixed(1);

      // Calculate ESG score improvement
      const esgImprovement = (
        (parseFloat(adjustedRoi) / 15) * 5 +
        (parseFloat(adjustedCo2Reduction) / formData.currentCO2) * 20
      ).toFixed(1);

      // Calculate water savings based on priority area
      const waterSavings = (15 * priorityAreaMultiplier.water * scenarioMultiplier).toFixed(1);

      // Calculate social impact score based on priority area
      const socialImpactScore = (70 + (30 * priorityAreaMultiplier.social * scenarioMultiplier)).toFixed(1);

      // Determine certification level based on budget and improvements
      let certificationLevel = 'LEED Silver';
      if (formData.retrofitBudget > 8000000 && parseFloat(esgImprovement) > 15) {
        certificationLevel = 'LEED Platinum';
      } else if (formData.retrofitBudget > 5000000 && parseFloat(esgImprovement) > 10) {
        certificationLevel = 'LEED Gold';
      }

      // Calculate market value impact
      const marketValueImpact = (formData.retrofitBudget * (parseFloat(adjustedRoi) / 100) * 5).toFixed(0);

      // Calculate tenant attraction improvement
      const tenantAttractionImprovement = (parseFloat(esgImprovement) * 0.7).toFixed(1);

      // Set comprehensive results
      setResults({
        co2Saved: adjustedCo2Reduction,
        roi: adjustedRoi,
        retrofitCost: formData.retrofitBudget,
        paybackPeriod: paybackPeriod,
        energySavings: (parseFloat(adjustedCo2Reduction) * 1.2).toFixed(1),
        waterSavings: waterSavings,
        wasteReduction: (parseFloat(adjustedCo2Reduction) * 0.8).toFixed(1),
        certificationLevel: certificationLevel,
        esgScoreImprovement: esgImprovement,
        marketValueImpact: marketValueImpact,
        tenantAttractionImprovement: tenantAttractionImprovement,
        socialImpactScore: socialImpactScore,
        complianceRiskReduction: (parseFloat(esgImprovement) * 0.9).toFixed(1),
        operationalCostSavings: (formData.retrofitBudget * (parseFloat(adjustedRoi) / 100)).toFixed(0),
        implementationTimeframe: formData.implementationTimeframe === 'short' ? '6-12 months' : formData.implementationTimeframe === 'medium' ? '12-24 months' : '24-36 months',
        maintenanceCostReduction: (12 + parseFloat(adjustedRoi) * 0.3).toFixed(1),
        scenario: simulationScenario
      });

      setIsLoading(false);
    }, 1500);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get color based on score comparison to benchmark
  const getScoreColor = (score, benchmark) => {
    if (score >= benchmark.topQuartile) return 'text-green-600';
    if (score <= benchmark.bottomQuartile) return 'text-red-600';
    return 'text-yellow-600';
  };

  // Get background color based on score comparison to benchmark
  const getScoreBgColor = (score, benchmark, darkMode) => {
    if (score >= benchmark.topQuartile) return darkMode ? 'bg-green-900/30' : 'bg-green-50';
    if (score <= benchmark.bottomQuartile) return darkMode ? 'bg-red-900/30' : 'bg-red-50';
    return darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50';
  };

  // Get impact color
  const getImpactColor = (impact) => {
    if (impact === 'High') return 'text-green-600';
    if (impact === 'Medium') return 'text-yellow-600';
    if (impact === 'Low') return 'text-red-600';
    return 'text-gray-600';
  };

  // Get cost color
  const getCostColor = (cost) => {
    if (cost === 'Low') return 'text-green-600';
    if (cost === 'Medium') return 'text-yellow-600';
    if (cost === 'High') return 'text-red-600';
    return 'text-gray-600';
  };

  // Get timeframe color
  const getTimeframeColor = (timeframe) => {
    if (timeframe === 'Short') return 'text-green-600';
    if (timeframe === 'Medium') return 'text-yellow-600';
    if (timeframe === 'Long') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Advanced ESG Impact Simulator</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>Comprehensive analysis of environmental, social, and governance impacts with ROI projections</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'simulator' 
            ? `border-b-2 border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}` 
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}`}
        >
          ESG Simulator
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'portfolio' 
            ? `border-b-2 border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}` 
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}`}
        >
          Portfolio Analysis
        </button>
        <button
          onClick={() => setActiveTab('strategies')}
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'strategies' 
            ? `border-b-2 border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}` 
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}`}
        >
          ESG Strategies
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'trends' 
            ? `border-b-2 border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}` 
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}`}
        >
          Historical Trends
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'insights' 
            ? `border-b-2 border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}` 
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}`}
        >
          AI Insights
        </button>
      </div>

      {/* Simulator Tab Content */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg`}>
            <h3 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Building Parameters</h3>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Building Type</label>
                <select
                  value={formData.buildingType}
                  onChange={(e) => handleChange('buildingType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="office">Office Tower</option>
                  <option value="retail">Retail Complex</option>
                  <option value="mixed">Mixed Use</option>
                  <option value="residential">Residential</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Building Age (years)</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs mt-1">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>New (1yr)</span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>25yrs</span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Older (50yrs)</span>
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>{formData.age} years</span>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Current CO2 Emissions (tons/year)</label>
                <input
                  type="number"
                  value={formData.currentCO2}
                  onChange={(e) => handleChange('currentCO2', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Retrofit Budget (AED)</label>
                <input
                  type="number"
                  value={formData.retrofitBudget}
                  onChange={(e) => handleChange('retrofitBudget', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Target Certification</label>
                <select
                  value={formData.targetCertification}
                  onChange={(e) => handleChange('targetCertification', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="leed-silver">LEED Silver</option>
                  <option value="leed-gold">LEED Gold</option>
                  <option value="leed-platinum">LEED Platinum</option>
                  <option value="breeam-good">BREEAM Good</option>
                  <option value="breeam-excellent">BREEAM Excellent</option>
                  <option value="well-gold">WELL Gold</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Implementation Timeframe</label>
                <select
                  value={formData.implementationTimeframe}
                  onChange={(e) => handleChange('implementationTimeframe', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="short">Short-term (6-12 months)</option>
                  <option value="medium">Medium-term (12-24 months)</option>
                  <option value="long">Long-term (24-36 months)</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Priority Focus Area</label>
                <select
                  value={formData.priorityArea}
                  onChange={(e) => handleChange('priorityArea', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="energy">Energy Efficiency</option>
                  <option value="water">Water Conservation</option>
                  <option value="waste">Waste Management</option>
                  <option value="social">Social Impact</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Simulation Scenario</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSimulationScenario('conservative')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      simulationScenario === 'conservative' 
                        ? 'bg-blue-600 text-white' 
                        : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                    }`}
                  >
                    Conservative
                  </button>
                  <button
                    onClick={() => setSimulationScenario('moderate')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      simulationScenario === 'moderate' 
                        ? 'bg-blue-600 text-white' 
                        : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                    }`}
                  >
                    Moderate
                  </button>
                  <button
                    onClick={() => setSimulationScenario('aggressive')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      simulationScenario === 'aggressive' 
                        ? 'bg-blue-600 text-white' 
                        : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                    }`}
                  >
                    Aggressive
                  </button>
                </div>
              </div>

              <button
                onClick={simulateESG}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Running Simulation...' : 'Run ESG Simulation'}
              </button>
            </div>
          </div>

          {results ? (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Comprehensive ESG Impact Analysis</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  results.scenario === 'conservative' ? 'bg-blue-100 text-blue-800' :
                  results.scenario === 'aggressive' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {results.scenario.charAt(0).toUpperCase() + results.scenario.slice(1)} Scenario
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>ESG Score Improvement</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>+{results.esgScoreImprovement} pts</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>ROI</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{results.roi}%</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Payback Period</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{results.paybackPeriod} years</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Environmental Impact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>CO2 Reduction</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{results.co2Saved} tons/year</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Energy Savings</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{results.energySavings}%</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-cyan-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Water Savings</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{results.waterSavings}%</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Financial Impact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-amber-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Market Value Impact</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>+{results.marketValueImpact} AED</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-emerald-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Operational Cost Savings</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{results.operationalCostSavings} AED/yr</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Maintenance Cost Reduction</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{results.maintenanceCostReduction}%</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Social & Governance Impact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-rose-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tenant Attraction</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>+{results.tenantAttractionImprovement}%</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-violet-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Social Impact Score</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-violet-400' : 'text-violet-600'}`}>{results.socialImpactScore}/100</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Compliance Risk Reduction</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{results.complianceRiskReduction}%</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Implementation Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Certification Target</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{results.certificationLevel}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-teal-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Implementation Timeframe</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>{results.implementationTimeframe}</p>
                  </div>
                </div>
              </div>

              <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-green-50 to-blue-50'} border-l-4 border-green-500`}>
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>AI-Generated Recommendations</h4>
                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p className="mb-2">
                    <strong>Primary Recommendation:</strong> {
                      formData.priorityArea === 'energy' ? 'Implement a comprehensive energy efficiency upgrade with smart building technology integration. Focus on HVAC optimization and LED lighting retrofits.' :
                      formData.priorityArea === 'water' ? 'Install advanced water conservation systems including greywater recycling and smart irrigation controls. Consider rainwater harvesting systems for landscape irrigation.' :
                      formData.priorityArea === 'waste' ? 'Develop a comprehensive waste management program with sorting stations, composting facilities, and recycling education for tenants.' :
                      'Implement community engagement programs and wellness features to improve tenant satisfaction and social impact scores.'
                    }
                  </p>
                  <p className="mb-2">
                    <strong>Financial Strategy:</strong> {
                      parseFloat(results.roi) > 12 ? 'The high ROI justifies accelerated implementation. Consider increasing budget allocation to maximize returns.' :
                      parseFloat(results.roi) > 8 ? 'The moderate ROI suggests a phased implementation approach to manage cash flow while achieving ESG targets.' :
                      'The lower ROI indicates focusing on critical improvements first, then expanding as operational savings are realized.'
                    }
                  </p>
                  <p>
                    <strong>Certification Path:</strong> {
                      results.certificationLevel === 'LEED Platinum' ? 'Pursue LEED Platinum certification with additional focus on innovation credits and exemplary performance.' :
                      results.certificationLevel === 'LEED Gold' ? 'Target LEED Gold certification with potential to achieve Platinum in future upgrade phases.' :
                      'Begin with LEED Silver certification while building foundation for Gold certification in subsequent phases.'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg flex flex-col items-center justify-center h-full`}>
              <Leaf className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} />
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                Configure building parameters and run the simulation to see comprehensive ESG impact analysis
              </p>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Analysis Tab Content */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-6`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Portfolio ESG Performance</h4>
              <div className="space-y-4">
                {buildingsESGData.map(building => (
                  <div
                    key={building.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedBuilding?.id === building.id 
                        ? `${darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border-2` 
                        : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`
                    }`}
                    onClick={() => setSelectedBuilding(building)}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{building.name}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        building.esgScore >= 85 ? 'bg-green-100 text-green-800' :
                        building.esgScore >= 75 ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{building.esgScore}/100</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Environmental</p>
                        <p className={`font-semibold ${
                          building.environmentalScore >= 85 ? 'text-green-600' :
                          building.environmentalScore >= 75 ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>{building.environmentalScore}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Social</p>
                        <p className={`font-semibold ${
                          building.socialScore >= 85 ? 'text-green-600' :
                          building.socialScore >= 75 ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>{building.socialScore}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Governance</p>
                        <p className={`font-semibold ${
                          building.governanceScore >= 85 ? 'text-green-600' :
                          building.governanceScore >= 75 ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>{building.governanceScore}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Industry Benchmarks</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ESG Score</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{industryBenchmarks.esgScore.average}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${industryBenchmarks.esgScore.average}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bottom Quartile: {industryBenchmarks.esgScore.bottomQuartile}</span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Top Quartile: {industryBenchmarks.esgScore.topQuartile}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>CO2 Emissions (tons/year)</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{industryBenchmarks.co2Emissions.average}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(industryBenchmarks.co2Emissions.average / 300) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Best: {industryBenchmarks.co2Emissions.topQuartile}</span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Worst: {industryBenchmarks.co2Emissions.bottomQuartile}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ROI on ESG Initiatives</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{industryBenchmarks.roi.average}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${(industryBenchmarks.roi.average / 15) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Low: {industryBenchmarks.roi.bottomQuartile}%</span>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>High: {industryBenchmarks.roi.topQuartile}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedBuilding ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <div className="flex justify-between items-center mb-6">
                  <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBuilding.name} ESG Profile</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBuilding.esgScore >= 85 ? 'bg-green-100 text-green-800' :
                    selectedBuilding.esgScore >= 75 ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>ESG Score: {selectedBuilding.esgScore}/100</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Environmental Score</p>
                    <p className={`text-2xl font-bold ${
                      selectedBuilding.environmentalScore >= 85 ? 'text-green-600' :
                      selectedBuilding.environmentalScore >= 75 ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>{selectedBuilding.environmentalScore}/100</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Social Score</p>
                    <p className={`text-2xl font-bold ${
                      selectedBuilding.socialScore >= 85 ? 'text-green-600' :
                      selectedBuilding.socialScore >= 75 ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>{selectedBuilding.socialScore}/100</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Governance Score</p>
                    <p className={`text-2xl font-bold ${
                      selectedBuilding.governanceScore >= 85 ? 'text-green-600' :
                      selectedBuilding.governanceScore >= 75 ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>{selectedBuilding.governanceScore}/100</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Environmental Metrics</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CO2 Emissions</p>
                      <p className={`font-semibold ${getScoreColor(industryBenchmarks.co2Emissions.average - selectedBuilding.co2Emissions, {
                        topQuartile: 50,
                        bottomQuartile: 0
                      })}`}>{selectedBuilding.co2Emissions} tons/year</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Energy Efficiency</p>
                      <p className={`font-semibold ${
                        selectedBuilding.energyEfficiency === 'A' || selectedBuilding.energyEfficiency === 'A-' || selectedBuilding.energyEfficiency === 'A+' ? 'text-green-600' :
                        selectedBuilding.energyEfficiency === 'B+' || selectedBuilding.energyEfficiency === 'B' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>{selectedBuilding.energyEfficiency}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Water Usage</p>
                      <p className={`font-semibold ${
                        selectedBuilding.waterUsage === 'A' || selectedBuilding.waterUsage === 'A-' || selectedBuilding.waterUsage === 'A+' ? 'text-green-600' :
                        selectedBuilding.waterUsage === 'B+' || selectedBuilding.waterUsage === 'B' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>{selectedBuilding.waterUsage}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Waste Management</p>
                      <p className={`font-semibold ${
                        selectedBuilding.wasteManagement === 'A' || selectedBuilding.wasteManagement === 'A-' || selectedBuilding.wasteManagement === 'A+' ? 'text-green-600' :
                        selectedBuilding.wasteManagement === 'B+' || selectedBuilding.wasteManagement === 'B' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>{selectedBuilding.wasteManagement}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Certifications</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedBuilding.certifications.map((cert, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Benchmark Comparison</h5>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>This Building</span>
                      <div className="w-3 h-3 rounded-full bg-blue-500 ml-6 mr-2"></div>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Industry Average</span>
                      <div className="w-3 h-3 rounded-full bg-purple-500 ml-6 mr-2"></div>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Top Quartile</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ESG Score</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                          <div className="absolute top-0 left-0 h-2.5 w-2 bg-green-600 rounded-full" style={{ left: `${selectedBuilding.esgScore}%` }}></div>
                          <div className="absolute top-0 left-0 h-2.5 w-2 bg-blue-600 rounded-full" style={{ left: `${industryBenchmarks.esgScore.average}%` }}></div>
                          <div className="absolute top-0 left-0 h-2.5 w-2 bg-purple-600 rounded-full" style={{ left: `${industryBenchmarks.esgScore.topQuartile}%` }}></div>
                          <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2.5 rounded-full w-full"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>CO2 Emissions</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                          <div className="absolute top-0 left-0 h-2.5 w-2 bg-green-600 rounded-full" style={{ left: `${(selectedBuilding.co2Emissions / 300) * 100}%` }}></div>
                          <div className="absolute top-0 left-0 h-2.5 w-2 bg-blue-600 rounded-full" style={{ left: `${(industryBenchmarks.co2Emissions.average / 300) * 100}%` }}></div>
                          <div className="absolute top-0 left-0 h-2.5 w-2 bg-purple-600 rounded-full" style={{ left: `${(industryBenchmarks.co2Emissions.topQuartile / 300) * 100}%` }}></div>
                          <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2.5 rounded-full w-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-green-50 to-blue-50'} border-l-4 border-green-500`}>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Improvement Opportunities</h5>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedBuilding.name === 'Gate District' ? (
                      <>
                        <p className="mb-2">• Upgrade to smart building management system to optimize energy usage</p>
                        <p className="mb-2">• Implement rainwater harvesting to improve water efficiency rating</p>
                        <p>• Enhance tenant engagement programs to improve social score</p>
                      </>
                    ) : selectedBuilding.name === 'Index Tower' ? (
                      <>
                        <p className="mb-2">• Replace aging HVAC system with high-efficiency alternative</p>
                        <p className="mb-2">• Implement comprehensive waste sorting and recycling program</p>
                        <p>• Pursue LEED Gold certification upgrade from current Silver</p>
                      </>
                    ) : selectedBuilding.name === 'Liberty House' ? (
                      <>
                        <p className="mb-2">• Comprehensive energy efficiency retrofit needed to improve poor rating</p>
                        <p className="mb-2">• Install water-efficient fixtures throughout the building</p>
                        <p>• Develop ESG governance framework and reporting structure</p>
                      </>
                    ) : (
                      <>
                        <p className="mb-2">• Implement on-site renewable energy generation to achieve carbon neutrality</p>
                        <p className="mb-2">• Develop community engagement programs to further enhance social score</p>
                        <p>• Share best practices with other properties to improve portfolio-wide performance</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg flex flex-col items-center justify-center h-full`}>
                <Building className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} />
                <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                  Select a building to view detailed ESG profile and benchmark comparison
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ESG Strategies Tab Content */}
      {activeTab === 'strategies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-6`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>ESG Improvement Strategies</h4>
              <div className="space-y-4">
                {esgStrategies.map(strategy => (
                  <div
                    key={strategy.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedStrategy?.id === strategy.id 
                        ? `${darkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border-2` 
                        : `${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`
                    }`}
                    onClick={() => setSelectedStrategy(strategy)}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{strategy.name}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        strategy.roi >= 14 ? 'bg-green-100 text-green-800' :
                        strategy.roi >= 10 ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{strategy.roi}% ROI</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cost</p>
                        <p className={`font-semibold ${getCostColor(strategy.cost)}`}>{strategy.cost}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Impact</p>
                        <p className={`font-semibold ${getImpactColor(strategy.impact)}`}>{strategy.impact}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Timeframe</p>
                        <p className={`font-semibold ${getTimeframeColor(strategy.timeframe)}`}>{strategy.timeframe}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedStrategy ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
                <div className="flex justify-between items-center mb-6">
                  <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedStrategy.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedStrategy.roi >= 14 ? 'bg-green-100 text-green-800' :
                    selectedStrategy.roi >= 10 ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{selectedStrategy.roi}% ROI</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CO2 Reduction</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{selectedStrategy.co2Reduction}%</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Implementation Cost</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{selectedStrategy.cost}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Timeframe</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{selectedStrategy.timeframe}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Strategy Description</h5>
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedStrategy.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Impact Analysis</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                      <h6 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Environmental Impact</h6>
                      <ul className={`list-disc pl-5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                        <li>CO2 reduction: {selectedStrategy.co2Reduction}%</li>
                        <li>Energy efficiency improvement: {Math.round(selectedStrategy.co2Reduction * 1.2)}%</li>
                        <li>Resource conservation: {selectedStrategy.name.includes('Water') ? 'High' : 'Medium'}</li>
                        <li>Waste reduction: {selectedStrategy.name.includes('Waste') ? 'High' : 'Low'}</li>
                      </ul>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <h6 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Financial Impact</h6>
                      <ul className={`list-disc pl-5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                        <li>Return on investment: {selectedStrategy.roi}%</li>
                        <li>Payback period: {Math.round(100 / selectedStrategy.roi * 12)} months</li>
                        <li>Operational cost reduction: {Math.round(selectedStrategy.roi * 0.8)}%</li>
                        <li>Asset value increase: {Math.round(selectedStrategy.roi * 0.5)}%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Implementation Requirements</h5>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <ul className={`list-disc pl-5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                        <li>Capital expenditure: {selectedStrategy.cost === 'High' ? 'Significant' : selectedStrategy.cost === 'Medium' ? 'Moderate' : 'Minimal'}</li>
                        <li>Operational disruption: {selectedStrategy.timeframe === 'Long' ? 'Significant' : selectedStrategy.timeframe === 'Medium' ? 'Moderate' : 'Minimal'}</li>
                        <li>Technical expertise: {selectedStrategy.name.includes('Renewable') || selectedStrategy.name.includes('HVAC') ? 'Specialized' : 'Standard'}</li>
                        <li>Regulatory approvals: {selectedStrategy.name.includes('Certification') ? 'Extensive' : 'Limited'}</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Best Suited For</h5>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <ul className={`list-disc pl-5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                        <li>Building types: {selectedStrategy.name.includes('Energy') ? 'All commercial buildings' : selectedStrategy.name.includes('Water') ? 'Buildings with high water usage' : 'All building types'}</li>
                        <li>Building age: {selectedStrategy.name.includes('Efficiency') ? 'Older buildings (10+ years)' : 'Any age'}</li>
                        <li>Current ESG score: {selectedStrategy.impact === 'High' ? 'Low to medium' : 'Any'}</li>
                        <li>Budget level: {selectedStrategy.cost === 'High' ? 'Large capital improvement budget' : selectedStrategy.cost === 'Medium' ? 'Moderate budget' : 'Limited budget'}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-green-50 to-blue-50'} border-l-4 border-green-500`}>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Implementation Roadmap</h5>
                  <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className="mb-2">
                      <strong>Phase 1:</strong> {
                        selectedStrategy.timeframe === 'Short' ? 'Assessment and planning (1-2 months)' :
                        selectedStrategy.timeframe === 'Medium' ? 'Feasibility study and detailed planning (2-3 months)' :
                        'Comprehensive audit and strategic planning (3-6 months)'
                      }
                    </p>
                    <p className="mb-2">
                      <strong>Phase 2:</strong> {
                        selectedStrategy.timeframe === 'Short' ? 'Implementation and installation (3-6 months)' :
                        selectedStrategy.timeframe === 'Medium' ? 'Phased implementation (6-12 months)' :
                        'Multi-stage implementation (12-18 months)'
                      }
                    </p>
                    <p className="mb-2">
                      <strong>Phase 3:</strong> {
                        selectedStrategy.timeframe === 'Short' ? 'Monitoring and optimization (ongoing)' :
                        selectedStrategy.timeframe === 'Medium' ? 'Performance verification and optimization (3-6 months)' :
                        'System integration and performance verification (6-12 months)'
                      }
                    </p>
                    <p>
                      <strong>Expected Outcomes:</strong> {
                        selectedStrategy.impact === 'High' ? 'Significant improvement in ESG metrics with substantial financial returns' :
                        selectedStrategy.impact === 'Medium' ? 'Moderate improvement in targeted ESG areas with positive financial impact' :
                        'Focused improvements in specific areas with quick financial returns'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg flex flex-col items-center justify-center h-full`}>
                <Leaf className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} />
                <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                  Select an ESG strategy to view detailed implementation analysis and impact assessment
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Trends Tab Content */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>ESG Performance Trends (2020-2024)</h4>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalESGData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="year" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis yAxisId="left" orientation="left" stroke="#10B981" domain={[60, 90]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#EF4444" domain={[150, 300]} />
                  <Tooltip contentStyle={darkMode ? { backgroundColor: '#1f2937', border: 'none', color: '#f9fafb' } : {}} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="esgScore" stroke="#10B981" strokeWidth={3} name="ESG Score" dot={{ r: 4 }} />
                  <Line yAxisId="left" type="monotone" dataKey="environmentalScore" stroke="#3B82F6" strokeWidth={2} name="Environmental Score" dot={{ r: 3 }} />
                  <Line yAxisId="left" type="monotone" dataKey="socialScore" stroke="#8B5CF6" strokeWidth={2} name="Social Score" dot={{ r: 3 }} />
                  <Line yAxisId="left" type="monotone" dataKey="governanceScore" stroke="#F59E0B" strokeWidth={2} name="Governance Score" dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="co2Emissions" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="CO2 Emissions (tons)" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Key Performance Indicators</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ESG Score Improvement</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>+{historicalESGData[historicalESGData.length - 1].esgScore - historicalESGData[0].esgScore} pts</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>5-year change</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CO2 Reduction</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{Math.round((1 - historicalESGData[historicalESGData.length - 1].co2Emissions / historicalESGData[0].co2Emissions) * 100)}%</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>5-year reduction</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Annual Improvement Rate</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{((historicalESGData[historicalESGData.length - 1].esgScore / historicalESGData[0].esgScore) ** (1/5) - 1 * 100).toFixed(1)}%</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Compound annual growth</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Year-over-Year Analysis</h4>
              <div className="space-y-6">
                {historicalESGData.slice(1).map((yearData, index) => {
                  const prevYear = historicalESGData[index];
                  const esgChange = yearData.esgScore - prevYear.esgScore;
                  const co2Change = prevYear.co2Emissions - yearData.co2Emissions;

                  return (
                    <div key={yearData.year} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{yearData.year} vs {prevYear.year}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          esgChange >= 3 ? 'bg-green-100 text-green-800' :
                          esgChange >= 1 ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>+{esgChange} ESG pts</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Environmental</p>
                          <p className={`font-medium ${yearData.environmentalScore - prevYear.environmentalScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {yearData.environmentalScore - prevYear.environmentalScore > 0 ? '+' : ''}{yearData.environmentalScore - prevYear.environmentalScore} pts
                          </p>
                        </div>
                        <div>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CO2 Reduction</p>
                          <p className={`font-medium ${co2Change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {co2Change > 0 ? '-' : '+'}{Math.abs(co2Change)} tons
                          </p>
                        </div>
                        <div>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Social</p>
                          <p className={`font-medium ${yearData.socialScore - prevYear.socialScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {yearData.socialScore - prevYear.socialScore > 0 ? '+' : ''}{yearData.socialScore - prevYear.socialScore} pts
                          </p>
                        </div>
                        <div>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Governance</p>
                          <p className={`font-medium ${yearData.governanceScore - prevYear.governanceScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {yearData.governanceScore - prevYear.governanceScore > 0 ? '+' : ''}{yearData.governanceScore - prevYear.governanceScore} pts
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Trend Analysis</h4>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-green-50 to-blue-50'} border-l-4 border-green-500 mb-4`}>
                <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Key Observations</h5>
                <ul className={`list-disc pl-5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                  <li>Consistent improvement in overall ESG score year-over-year</li>
                  <li>Environmental score shows the most significant improvement</li>
                  <li>CO2 emissions reduced by {Math.round((1 - historicalESGData[historicalESGData.length - 1].co2Emissions / historicalESGData[0].co2Emissions) * 100)}% over 5 years</li>
                  <li>Governance metrics show steady but slower improvement</li>
                  <li>Acceleration in improvement rate in the last 2 years</li>
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} border-l-4 border-blue-500`}>
                <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Future Projections</h5>
                <ul className={`list-disc pl-5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                  <li>ESG score projected to reach 85+ by 2026 at current improvement rate</li>
                  <li>CO2 emissions expected to decrease by additional 15% by 2026</li>
                  <li>Social score improvement expected to accelerate with new initiatives</li>
                  <li>Potential to reach top quartile industry benchmarks within 2 years</li>
                  <li>ROI on ESG initiatives expected to increase as scale efficiencies are realized</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab Content */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI-Generated ESG Insights</h4>
              </div>

              <div className="space-y-6">
                {aiInsights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border-l-4 border-green-500`}>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Strategic Recommendations</h4>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border-l-4 border-green-500`}>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Environmental Strategy</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Prioritize energy efficiency upgrades across the portfolio, focusing first on buildings with below-average performance. Implement smart building technology to optimize resource usage and consider on-site renewable energy generation for premium properties to achieve carbon neutrality targets.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-blue-500`}>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Social Impact Enhancement</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Develop comprehensive tenant engagement programs focused on wellness and community building. Implement accessibility improvements and create shared community spaces to enhance tenant satisfaction and retention. Consider partnerships with local organizations for community outreach initiatives.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'} border-l-4 border-purple-500`}>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Governance Framework</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Establish robust ESG reporting and transparency mechanisms across the portfolio. Implement standardized data collection and verification processes, and develop clear ESG performance targets with accountability measures. Consider third-party verification of ESG metrics to enhance credibility.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-yellow-50'} border-l-4 border-yellow-500`}>
                  <h5 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Certification Strategy</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Pursue LEED or BREEAM certifications for all properties, with a tiered approach based on building characteristics and market positioning. Target LEED Gold or Platinum for premium properties and minimum LEED Silver for all others. Consider WELL certification for buildings with high-profile tenants focused on employee wellness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>ESG Market Trends</h4>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h5 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Regulatory Landscape</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    UAE sustainability regulations are becoming increasingly stringent, with new carbon reporting requirements expected by 2026. Early adoption of enhanced ESG practices provides competitive advantage and reduces compliance risk.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h5 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Tenant Preferences</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    85% of multinational corporations now include ESG criteria in their leasing decisions. Buildings with strong ESG credentials command 10-15% premium in rental rates and show 12% lower vacancy rates in the GROUP area.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h5 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Investment Impact</h5>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Properties with top-quartile ESG performance show 18% higher valuation multiples and attract investment from ESG-focused funds, which now represent over 30% of commercial real estate investment capital in the region.
                  </p>
                </div>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg mb-8`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>ESG ROI Analysis</h4>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-4`}>
                <h5 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Financial Returns</h5>
                <ul className={`list-disc pl-5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                  <li>Energy efficiency initiatives: 12-18% ROI</li>
                  <li>Water conservation measures: 8-14% ROI</li>
                  <li>Waste management programs: 6-10% ROI</li>
                  <li>Renewable energy installations: 9-15% ROI</li>
                  <li>Green building certifications: 15-20% ROI (including valuation impact)</li>
                </ul>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h5 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Non-Financial Benefits</h5>
                <ul className={`list-disc pl-5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                  <li>Enhanced brand reputation and market positioning</li>
                  <li>Improved tenant attraction and retention</li>
                  <li>Reduced regulatory compliance risk</li>
                  <li>Increased access to green financing options</li>
                  <li>Future-proofing against climate-related risks</li>
                </ul>
              </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Implementation Priorities</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold mr-3">1</div>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Energy efficiency upgrades (highest ROI)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold mr-3">2</div>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Green building certification program</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold mr-3">3</div>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Water conservation systems</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold mr-3">4</div>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tenant engagement programs</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold mr-3">5</div>
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Renewable energy installations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Map View Component
const MapView = () => {
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">GROUP Map View</h1>
        <p className="text-gray-600 mt-2">Interactive building portfolio overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-xl p-8 h-96 relative overflow-hidden">
            {/* Simulated Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 opacity-50"></div>

            {/* Building Markers */}
            {mockBuildingData.map((building, index) => (
              <div
                key={building.id}
                className={`absolute w-4 h-4 rounded-full cursor-pointer transition-all transform ${
                  selectedBuilding?.id === building.id 
                    ? 'bg-red-500 scale-150 shadow-lg' 
                    : 'bg-blue-500 hover:bg-blue-600 hover:scale-125'
                }`}
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${30 + index * 10}%`
                }}
                onClick={() => setSelectedBuilding(building)}
              >
                <div className="absolute -top-8 -left-8 whitespace-nowrap text-xs font-medium bg-white px-2 py-1 rounded shadow">
                  {building.name}
                </div>
              </div>
            ))}

            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow">
              <p className="text-xs text-gray-600">Click building markers for details</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Building Directory</h3>
            <div className="space-y-3">
              {mockBuildingData.map(building => (
                <div
                  key={building.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedBuilding?.id === building.id 
                      ? 'bg-blue-50 border-blue-200 border-2' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedBuilding(building)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{building.name}</span>
                    <span className="text-sm text-gray-600">{building.occupancy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedBuilding && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4">{selectedBuilding.name}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupancy Rate</span>
                  <span className="font-semibold">{selectedBuilding.occupancy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Asset Value</span>
                  <span className="font-semibold">{selectedBuilding.value}M AED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Floors</span>
                  <span className="font-semibold">{Math.floor(Math.random() * 30) + 20}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Major Tenants</span>
                  <span className="font-semibold">{Math.floor(Math.random() * 15) + 5}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Tenant Intelligence
const TenantIntelligence = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [tenants, setTenants] = useState(mockTenantData);

  const filteredTenants = tenants
    .filter(tenant =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.sector.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      if (sortBy === 'leaseEnd') return new Date(a.leaseEnd) - new Date(b.leaseEnd);
      return 0;
    });

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Intelligence</h1>
        <p className="text-gray-600 mt-2">Comprehensive tenant analytics and churn prediction</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="revenue">Sort by Revenue</option>
              <option value="leaseEnd">Sort by Lease End</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Churn Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map(tenant => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{tenant.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.sector}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.leaseEnd}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(tenant.churnRisk)}`}>
                      {tenant.churnRisk}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.revenue}M AED</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-green-600 hover:text-green-900">Contact</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Total Tenants</h4>
          <p className="text-3xl font-bold text-blue-600">{tenants.length}</p>
          <p className="text-sm text-gray-600 mt-2">Active leases</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-2">High Risk Tenants</h4>
          <p className="text-3xl font-bold text-red-600">{tenants.filter(t => t.churnRisk === 'High').length}</p>
          <p className="text-sm text-gray-600 mt-2">Require attention</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Total Revenue</h4>
          <p className="text-3xl font-bold text-green-600">{tenants.reduce((sum, t) => sum + t.revenue, 0).toFixed(1)}M</p>
          <p className="text-sm text-gray-600 mt-2">AED per month</p>
        </div>
      </div>
    </div>
  );
};

// Documents & Compliance Dashboard
const DocumentsCompliance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterBuilding, setFilterBuilding] = useState('all');

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status.toLowerCase() === filterStatus;
    const matchesType = filterType === 'all' || doc.type.toLowerCase() === filterType;
    const matchesBuilding = filterBuilding === 'all' || doc.building === filterBuilding;

    return matchesSearch && matchesStatus && matchesType && matchesBuilding;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Valid': return 'text-green-600 bg-green-100';
      case 'Expired': return 'text-red-600 bg-red-100';
      case 'Upcoming': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Valid': return CheckCircle;
      case 'Expired': return AlertTriangle;
      case 'Upcoming': return Clock;
      default: return FileText;
    }
  };

  const getDaysColor = (days) => {
    if (days < 0) return 'text-red-600';
    if (days < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documents & Compliance</h1>
        <p className="text-gray-600 mt-2">Track regulatory filings, certificates, and compliance deadlines</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="valid">Valid</option>
            <option value="expired">Expired</option>
            <option value="upcoming">Upcoming</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="safety">Safety</option>
            <option value="insurance">Insurance</option>
            <option value="lease">Lease</option>
            <option value="esg">ESG</option>
            <option value="regulatory">Regulatory</option>
          </select>

          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Buildings</option>
            <option value="Gate District">Gate District</option>
            <option value="Index Tower">Index Tower</option>
            <option value="Liberty House">Liberty House</option>
            <option value="Central Park Towers">Central Park Towers</option>
          </select>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900">{mockDocuments.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valid</p>
              <p className="text-3xl font-bold text-green-600">{mockDocuments.filter(d => d.status === 'Valid').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-3xl font-bold text-red-600">{mockDocuments.filter(d => d.status === 'Expired').length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-3xl font-bold text-yellow-600">{mockDocuments.filter(d => d.status === 'Upcoming').length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Document Registry</h3>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 inline mr-2" />
                Export
              </button>
              <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Add Document
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days to Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map(doc => {
                const StatusIcon = getStatusIcon(doc.status);
                return (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-3" />
                        <div className="font-medium text-gray-900">{doc.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.building}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className="w-4 h-4 mr-2" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.expiryDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getDaysColor(doc.daysToExpiry)}`}>
                        {doc.daysToExpiry < 0 ? `${Math.abs(doc.daysToExpiry)} days overdue` : `${doc.daysToExpiry} days`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Eye className="w-4 h-4 inline mr-1" />
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Download className="w-4 h-4 inline mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sidebar Navigation
const Sidebar = ({ activeTab, setActiveTab, darkMode }) => {
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'forecast', name: 'Forecast', icon: TrendingUp },
    { id: 'esg', name: 'ESG Simulator', icon: Leaf },
    { id: 'map', name: 'Map View', icon: MapPin },
    { id: 'tenants', name: 'Tenant Intelligence', icon: Users },
    { id: 'documents', name: 'Documents & Compliance', icon: FileText },
    { id: 'maintenance', name: 'Maintenance Requests', icon: Settings },
    { id: 'comparison', name: 'Portfolio Comparison', icon: TrendingUp },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className={`w-64 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white h-screen fixed left-0 top-0 overflow-y-auto transition-colors duration-200`}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-blue-400">GROUP Cognitive</h2>
        <p className="text-sm text-gray-400 mt-1">Real Estate OS</p>
      </div>

      <nav className="px-4 space-y-2">
        {navigation.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : `text-gray-300 hover:${darkMode ? 'bg-gray-800' : 'bg-gray-700'} hover:text-white`
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-600'}`}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">CRE Officer</p>
            <p className="text-xs text-gray-400">GROUP Authority</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Top Navigation Bar
const TopBar = ({ activeTab, setActiveTab, darkMode, setDarkMode }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', title: 'Insurance Policy Expired', message: 'Index Tower insurance needs renewal', time: '10 minutes ago', read: false },
    { id: 2, type: 'warning', title: 'High Churn Risk Alert', message: 'Accenture MENA lease expiring soon', time: '1 hour ago', read: false },
    { id: 3, type: 'info', title: 'Maintenance Request Updated', message: 'HVAC repair in Gate District scheduled', time: '3 hours ago', read: true },
    { id: 4, type: 'success', title: 'ESG Score Improved', message: 'Liberty House score increased by 5 points', time: '1 day ago', read: true },
    { id: 5, type: 'alert', title: 'Fire Safety Certificate Expiring', message: 'Central Park Towers certificate expires in 30 days', time: '2 days ago', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Apply dark mode to the document
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Bell className="w-5 h-5 text-blue-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className={`h-16 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b ml-64 px-8 flex items-center justify-between transition-colors duration-200`}>
      <div className="flex items-center space-x-4">
        <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Portfolio Management</h1>
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>| $2.7B AUM</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} rounded-lg transition-colors`}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} rounded-lg transition-colors relative`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-96 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border z-50`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className={`text-xs ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className={`p-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 ${notification.read ? '' : darkMode ? 'bg-gray-700' : 'bg-blue-50'} ${darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-100'} border-b flex cursor-pointer`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{notification.title}</p>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{notification.time}</span>
                        </div>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{notification.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} text-center`}>
                <button className={`text-sm ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className={`flex items-center space-x-2 p-2 ${darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded-lg transition-colors`}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showProfile && (
            <div className={`absolute right-0 mt-2 w-56 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border z-50`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ahmed Al-Mansouri</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chief Real Estate Officer</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded flex items-center`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </button>
                <button className={`w-full text-left px-3 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} rounded flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Maintenance Requests Component
const MaintenanceRequests = () => {
  const [requests, setRequests] = useState([
    { id: 1, building: 'Gate District', unit: '1204', issue: 'HVAC Malfunction', priority: 'High', status: 'Open', date: '2025-05-15', assignee: 'Technical Team' },
    { id: 2, building: 'Index Tower', unit: '3305', issue: 'Plumbing Leak', priority: 'Critical', status: 'In Progress', date: '2025-05-14', assignee: 'Plumbing Contractor' },
    { id: 3, building: 'Liberty House', unit: '905', issue: 'Electrical Outlet Failure', priority: 'Medium', status: 'Open', date: '2025-05-13', assignee: 'Electrical Team' },
    { id: 4, building: 'Central Park Towers', unit: '2210', issue: 'Elevator Maintenance', priority: 'Low', status: 'Scheduled', date: '2025-05-20', assignee: 'Elevator Services Inc.' },
    { id: 5, building: 'Gate District', unit: '1510', issue: 'Window Seal Damage', priority: 'Medium', status: 'Open', date: '2025-05-12', assignee: 'Unassigned' }
  ]);

  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.issue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || req.priority.toLowerCase() === filterPriority.toLowerCase();
    const matchesStatus = filterStatus === 'all' || req.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'text-red-600 bg-red-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Scheduled': return 'text-purple-600 bg-purple-100';
      case 'Completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
        <p className="text-gray-600 mt-2">Track and manage building maintenance issues</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <Settings className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-3xl font-bold text-red-600">{requests.filter(r => r.status === 'Open').length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{requests.filter(r => r.status === 'In Progress').length}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-3xl font-bold text-orange-600">{requests.filter(r => r.priority === 'Critical').length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Maintenance Requests</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              New Request
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building/Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{request.building}</div>
                    <div className="text-sm text-gray-500">Unit {request.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.issue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.assignee}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Update</button>
                    <button className="text-green-600 hover:text-green-900">Assign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Portfolio Comparison Component
const PortfolioComparison = () => {
  const [comparisonData, setComparisonData] = useState({
    buildings: [
      { name: 'Gate District', occupancy: 92, value: 450, roi: 8.2, esgScore: 85 },
      { name: 'Index Tower', occupancy: 85, value: 380, roi: 7.5, esgScore: 78 },
      { name: 'Liberty House', occupancy: 78, value: 320, roi: 6.8, esgScore: 72 },
      { name: 'Central Park Towers', occupancy: 94, value: 520, roi: 9.1, esgScore: 88 }
    ],
    benchmarks: {
      industry: { occupancy: 82, roi: 7.2, esgScore: 75 },
      topPerformer: { occupancy: 95, roi: 9.5, esgScore: 90 }
    }
  });

  const [comparisonMetric, setComparisonMetric] = useState('occupancy');

  const metricOptions = [
    { value: 'occupancy', label: 'Occupancy Rate (%)', unit: '%' },
    { value: 'roi', label: 'Return on Investment (%)', unit: '%' },
    { value: 'esgScore', label: 'ESG Score', unit: '/100' }
  ];

  const selectedMetric = metricOptions.find(m => m.value === comparisonMetric);

  const chartData = comparisonData.buildings.map(building => ({
    name: building.name,
    value: building[comparisonMetric],
    industryAvg: comparisonData.benchmarks.industry[comparisonMetric],
    topPerformer: comparisonData.benchmarks.topPerformer[comparisonMetric]
  }));

  const getBarColor = (value, metric) => {
    const industryAvg = comparisonData.benchmarks.industry[metric];
    if (value >= comparisonData.benchmarks.topPerformer[metric]) return '#10B981'; // green
    if (value >= industryAvg) return '#3B82F6'; // blue
    return '#F59E0B'; // yellow
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Comparison</h1>
        <p className="text-gray-600 mt-2">Compare performance metrics across your portfolio and industry benchmarks</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="font-medium text-gray-700">Compare by:</div>
          {metricOptions.map(metric => (
            <button
              key={metric.value}
              onClick={() => setComparisonMetric(metric.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                comparisonMetric === metric.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-6">{selectedMetric.label} Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="value"
                name={`${selectedMetric.label}`}
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value, comparisonMetric)} />
                ))}
              </Bar>
              <Bar
                dataKey="industryAvg"
                name="Industry Average"
                fill="#9CA3AF"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Industry Average</span>
                  <span className="font-semibold">{comparisonData.benchmarks.industry[comparisonMetric]}{selectedMetric.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-500 h-2 rounded-full"
                    style={{ width: `${(comparisonData.benchmarks.industry[comparisonMetric] / comparisonData.benchmarks.topPerformer[comparisonMetric]) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Top Performer</span>
                  <span className="font-semibold">{comparisonData.benchmarks.topPerformer[comparisonMetric]}{selectedMetric.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Your Portfolio</h4>
                {comparisonData.buildings.map(building => (
                  <div key={building.name} className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">{building.name}</span>
                      <span className="font-semibold">{building[comparisonMetric]}{selectedMetric.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(building[comparisonMetric] / comparisonData.benchmarks.topPerformer[comparisonMetric]) * 100}%`,
                          backgroundColor: getBarColor(building[comparisonMetric], comparisonMetric)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Insights</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Central Park Towers is your top performing asset across all metrics</p>
              <p>• Liberty House is below industry average in occupancy and ESG score</p>
              <p>• Portfolio average is 12.2% above industry benchmark</p>
              <p>• Recommend ESG improvements for Liberty House and Index Tower</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Component
const SettingsPage = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    emailAlerts: true,
    dataRefreshInterval: 30,
    defaultView: 'dashboard',
    currency: 'AED',
    language: 'en'
  });

  const [userProfile, setUserProfile] = useState({
    name: 'Ahmed Al-Mansouri',
    email: 'ahmed.almansouri@group.ae',
    role: 'Chief Real Estate Officer',
    department: 'Real Estate Management',
    phone: '+971 4 123 4567',
    lastLogin: '2025-05-15 09:23 AM'
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleProfileChange = (field, value) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings & Preferences</h1>
        <p className="text-gray-600 mt-2">Customize your experience and manage your account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Application Settings</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-gray-600">Enable dark theme for the application</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.darkMode}
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Notifications</h4>
                  <p className="text-sm text-gray-600">Enable in-app notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Email Alerts</h4>
                  <p className="text-sm text-gray-600">Receive important alerts via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.emailAlerts}
                    onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Data Refresh Interval</h4>
                <p className="text-sm text-gray-600 mb-3">How often to refresh dashboard data (minutes)</p>
                <select
                  value={settings.dataRefreshInterval}
                  onChange={(e) => handleSettingChange('dataRefreshInterval', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Default View</h4>
                <p className="text-sm text-gray-600 mb-3">Select your default landing page</p>
                <select
                  value={settings.defaultView}
                  onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="forecast">Forecast</option>
                  <option value="map">Map View</option>
                  <option value="tenants">Tenant Intelligence</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Currency</h4>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="AED">AED (UAE Dirham)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Language</h4>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Save Settings
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6">Security</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Enable 2FA for additional security</p>
                </div>
                <button className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Enable
                </button>
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Update Security Settings
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-6">User Profile</h3>

            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">{userProfile.name}</h4>
                <p className="text-sm text-gray-600">{userProfile.role}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={userProfile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={userProfile.department}
                  onChange={(e) => handleProfileChange('department', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Update Profile
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium">{userProfile.lastLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="text-sm font-medium">Administrator</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Account Created</span>
                <span className="text-sm font-medium">2024-01-15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode to the document when the component mounts or darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderActiveComponent = () => {
    const props = { darkMode };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard darkMode={darkMode} />;
      case 'forecast':
        return <ForecastModule darkMode={darkMode} />;
      case 'esg':
        return <ESGSimulator darkMode={darkMode} />;
      case 'map':
        return <MapView darkMode={darkMode} />;
      case 'tenants':
        return <TenantIntelligence darkMode={darkMode} />;
      case 'documents':
        return <DocumentsCompliance darkMode={darkMode} />;
      case 'maintenance':
        return <MaintenanceRequests darkMode={darkMode} />;
      case 'comparison':
        return <PortfolioComparison darkMode={darkMode} />;
      case 'settings':
        return <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return <Dashboard darkMode={darkMode} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} />
      <TopBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />
      <div className={`ml-64 pt-16 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default App;
