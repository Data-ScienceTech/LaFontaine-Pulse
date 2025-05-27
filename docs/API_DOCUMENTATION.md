# API Documentation - Future Integration Guide

## Overview

This document outlines the planned API integration points for the Papineau Noise Pulse application when transitioning from simulated to real data.

## Current Data Sources (Simulated)

### EV Adoption Data
```typescript
// Current implementation in src/data/evData.ts
export const evAdoptionTimeSeries: EVAdoptionDataPoint[]
export const currentEVData: { montreal, quebec, canada }
```

### Noise Data Generation
```typescript
// Real-time noise simulation with continuous time series
export const generateNoiseData = (evAdoptionRate: number): NoiseDataPoint[]

// Unified data adapter with sliding window
// src/data/unifiedDataAdapter.ts
export const generateUnifiedNoiseData = (pointCount: number = 20): NoiseDataPoint[]
export const addNewDataPoint = (): NoiseDataPoint[]
export const resetTimeSeries = (): void
```

## Planned API Endpoints

### 1. Real-time Noise Data
```http
GET /api/noise/current
Authorization: Bearer {api_key}
```

**Response:**
```json
{
 "timestamp": "2025-01-20T15:30:00Z",
 "location": "papineau_cartier",
 "noise_level": 52.3,
 "sensor_id": "dauphins_28f_001",
 "quality_score": 0.95
}
```

### 2. Historical Noise Data
```http
GET /api/noise/history?start={iso_date}&end={iso_date}&interval=3min
```

**Response:**
```json
{
 "data": [
 {
 "timestamp": "2025-01-20T15:00:00Z",
 "noise_level": 48.7,
 "ev_impact_reduction": 2.1
 }
 ],
 "metadata": {
 "total_points": 20,
 "sensor_location": "Les Dauphins sur Le Parc, 28th floor"
 }
}
```

### 3. EV Adoption Statistics
```http
GET /api/ev-adoption/current?region={montreal|quebec|canada}
```

**Response:**
```json
{
 "region": "montreal",
 "current_rate": 8.2,
 "monthly_growth": 0.3,
 "target_2030": 35.0,
 "last_updated": "2025-01-20T12:00:00Z"
}
```

### 4. Privacy Consent Storage
```http
POST /api/consent
Content-Type: application/json
```

**Request:**
```json
{
 "user_id": "anonymous_hash",
 "consent_given": true,
 "timestamp": "2025-01-20T15:30:00Z",
 "ip_address_hash": "hashed_ip",
 "user_agent_hash": "hashed_ua"
}
```

## Integration Implementation

### Data Service Layer
```typescript
// src/services/api.ts (future)
export class NoiseMonitoringAPI {
 async getCurrentNoise(): Promise<NoiseDataPoint>
 async getHistoricalNoise(hours: number): Promise<NoiseDataPoint[]>
 async getCurrentEVAdoption(): Promise<EVAdoptionData>
 async storeConsent(consent: ConsentData): Promise<void>
}
```

### Error Handling
```typescript
// Graceful degradation to simulated data
try {
 const realData = await api.getCurrentNoise();
 return realData;
} catch (error) {
 console.warn('API unavailable, using simulated data');
 return generateNoiseData(getCurrentEVAdoption());
}
```

### Caching Strategy
```typescript
// Using @tanstack/react-query
const { data: noiseData } = useQuery({
 queryKey: ['noise', 'current'],
 queryFn: () => api.getCurrentNoise(),
 refetchInterval: 3000, // 3 seconds
 staleTime: 2000,
 gcTime: 60000
});
```

## Data Privacy Compliance

### Anonymization
- All user identifiers must be hashed
- IP addresses stored as hashes only
- No personally identifiable information

### Data Retention
- Real-time data: 24 hours
- Historical data: 1 year
- Consent records: As required by law

## Sensor Integration

### Hardware Specifications
- **Model**: High-sensitivity acoustic sensor
- **Location**: Les Dauphins sur Le Parc, 28th floor
- **Frequency**: 3-second measurements
- **Range**: 30-75 dB measurement range

### Data Quality Assurance
- Quality scores for each measurement
- Outlier detection and filtering
- Weather correlation for accuracy

## WebSocket Integration (Future)

### Real-time Updates
```typescript
// WebSocket connection for live data
const ws = new WebSocket('wss://api.datasciencetech.ca/noise/live');
ws.onmessage = (event) => {
 const noiseData = JSON.parse(event.data);
 updateNoiseDisplay(noiseData);
};
```

### Connection Management
- Automatic reconnection on failure
- Heartbeat monitoring
- Graceful fallback to polling

## Rate Limiting

### API Limits
- Real-time data: 20 requests/minute
- Historical data: 5 requests/minute
- Bulk exports: 1 request/hour

### Client-side Optimization
- Efficient data caching
- Batch requests when possible
- Respect API rate limits

## Authentication

### API Key Management
```typescript
// Environment variables
const API_KEY = process.env.VITE_NOISE_API_KEY;
const API_BASE_URL = process.env.VITE_API_BASE_URL;
```

### Security Headers
```http
Authorization: Bearer {api_key}
X-Client-Version: 1.0.0
X-Request-ID: {unique_request_id}
```

## Real-Time Sensor Integration

The application has been designed for seamless transition from simulated to real sensor data with the unified data adapter.

### Integration Points

1. **Real-Time Noise Sensor API** - Replace `generateRealisticNoise` with actual sensor readings:

```typescript
// Current implementation (simulated)
const generateRealisticNoise = (timestamp: Date, baseNoise: number): number => {
 // Multi-factor noise generation logic
};

// Future implementation with real sensors
const generateRealisticNoise = async (timestamp: Date): Promise<number> => {
 try {
 // Get real-time reading from sensor API
 const sensorResponse = await fetch(SENSOR_API_URL);
 const sensorData = await sensorResponse.json();
 return sensorData.papineau.currentNoise;
 } catch (error) {
 // Fallback to simulation on API failure
 console.error('Sensor API error:', error);
 return generateSimulatedNoise(timestamp);
 }
};
```

2. **Sliding Window Persistence** - Keep the sliding window approach for UI consistency:

```typescript
export const addNewDataPoint = async (): Promise<NoiseDataPoint[]> => {
 const now = new Date();
 
 // Only add new point every 3 seconds
 if (now.getTime() - lastUpdateTime < 3000) {
 return globalTimeSeriesData;
 }
 
 // Get real noise reading from sensor
 const noiseLevel = await getSensorReading('papineau');
 
 // Create new data point
 const newPoint = {
 time: now.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }),
 noise: Math.round(noiseLevel * 10) / 10,
 evImpact: calculateEVImpact(noiseLevel),
 location: 'papineau_cartier',
 isReal: true
 };
 
 // Add to sliding window
 globalTimeSeriesData.push(newPoint);
 if (globalTimeSeriesData.length > 20) {
 globalTimeSeriesData.shift();
 }
 
 lastUpdateTime = now.getTime();
 return [...globalTimeSeriesData];
};
```

### Data Resilience Strategy

The unified data adapter ensures resilience through:

1. **Data Source Independence** - The UI components are agnostic to the data source
2. **Graceful Degradation** - Fall back to simulation if sensor API fails
3. **Consistent Visualization** - Maintain the same chart rendering approach
4. **Persistent Time Series** - Continue using the sliding window mechanism

This approach ensures a smooth transition from simulated to real sensor data without UI disruptions.

This API documentation provides a roadmap for transitioning from the current simulated data to real sensor data while maintaining the existing user experience.

## Production Deployment Notes

### Pre-Deployment Checklist
- ✅ Remove any development tool branding or attribution
- ✅ Verify all API endpoints are production-ready
- ✅ Confirm data privacy compliance
- ✅ Test fallback mechanisms for data source failures

### Automated Cleanup Process
Run the following command before deployment to automatically remove any development tool references:

```bash
npm run cleanup-branding
```

This script will:
- Search all TypeScript, JavaScript, HTML, CSS, and Markdown files
- Remove common development tool attribution patterns
- Clean up formatting and extra whitespace
- Provide a summary of cleaned files

### Manual Verification
After running the cleanup script, verify no references remain:

```bash
# Search for any remaining references
grep -ri "" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist

# Check for attribution patterns
grep -ri "made with\|powered by\|built with" . --exclude-dir=node_modules --exclude-dir=.git
```

### Production Build Process
```bash
# Clean branding and build for production
npm run cleanup-branding
npm run build
npm run preview # Test production build locally
```