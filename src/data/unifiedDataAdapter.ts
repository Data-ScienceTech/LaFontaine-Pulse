// Unified Data Adapter - Single curve strategy
// Uses real data when available, seamlessly transitions to estimated data
// Ensures smooth continuation without discontinuities

import { noiseSeries, evSeries, DataPoint } from './noise_ev_data';

// Import NoiseDataPoint interface
interface NoiseDataPoint {
  time: string;
  noise: number;
  evImpact: number;
  location: 'papineau_cartier';
  isReal?: boolean;
}

// Data cutoff point - last available real data
const REAL_DATA_CUTOFF = '2025-05-01';
const TOTAL_VEHICLES_ESTIMATE = 50000;

/**
 * Determines data strategy based on requested date
 */
export const getDataStrategy = (requestedDate: Date): 'REAL' | 'ESTIMATED' => {
  const cutoffDate = new Date(REAL_DATA_CUTOFF);
  return requestedDate <= cutoffDate ? 'REAL' : 'ESTIMATED';
};

/**
 * Get the latest real baseline noise level to use for transitions
 */
export const getLatestRealBaseline = (): { papineau: number; cartier: number; timestamp: string } => {
  const latest = noiseSeries[noiseSeries.length - 1];
  return {
    papineau: latest.papineau,
    cartier: latest.cartier,
    timestamp: latest.timestamp
  };
};

/**
 * Calculate realistic time-of-day variations
 */
const getTimeOfDayVariation = (hour: number): number => {
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
    return 8; // Rush hour increase
  } else if (hour >= 6 && hour <= 22) {
    return 2; // Daytime baseline
  } else if (hour >= 23 || hour <= 5) {
    return -5; // Nighttime decrease
  }
  return 0; // Early morning/evening
};

/**
 * Generate micro-variations for realism
 */
const getMicroVariations = (hour: number, minute: number): number => {
  const timeInMinutes = hour * 60 + minute;
  return Math.sin(timeInMinutes / 60) * 1.5 + (Math.random() * 2 - 1);
};

// Global state for maintaining continuous time series
let globalTimeSeriesData: NoiseDataPoint[] = [];
let lastUpdateTime: number = 0;

/**
 * Generates realistic noise variations for both historical and current data
 * @param timestamp Time to generate variations for
 * @param baseNoise Base noise level from the real data
 * @returns Realistic noise value with proper variations
 */
const generateRealisticNoise = (timestamp: Date, baseNoise: number): number => {
  const hour = timestamp.getHours();
  const minute = timestamp.getMinutes();
  const dayOfWeek = timestamp.getDay(); // 0-6, where 0 is Sunday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // 1. Apply time-of-day variations (rush hour, etc.)
  const timeVariation = getTimeOfDayVariation(hour);
  
  // 2. Add traffic light cycle variations (every ~2 minutes)
  const trafficLightCycle = Math.sin(minute / 2 * Math.PI) * 1.2;
  
  // 3. Add weekend vs weekday variation
  const weekdayFactor = isWeekend ? -4 : 0; // Quieter on weekends
  
  // 4. Add semi-random micro-patterns using multiple sine waves with different frequencies
  // This creates a more naturalistic pattern that's still deterministic based on time
  const seed = timestamp.getTime();
  const microPattern = 
    Math.sin(seed / 900000) * 1.5 + // 15-minute pattern  
    Math.sin(seed / 180000) * 0.8 + // 3-minute pattern
    Math.sin(seed / 60000) * 0.4;   // 1-minute pattern
  
  // 5. Add small amount of randomness to prevent too regular patterns
  // Using hash-like function of timestamp to make it deterministic
  const pseudoRandom = ((seed % 997) / 997 * 2 - 1) * 1.2;
  
  // Combine all factors
  const noiseWithVariations = baseNoise + 
                              timeVariation + 
                              trafficLightCycle + 
                              weekdayFactor + 
                              microPattern + 
                              pseudoRandom;
                              
  // Ensure within realistic bounds
  return Math.max(30, Math.min(85, noiseWithVariations));
};

/**
 * Initialize the time series with historical data and realistic variations
 */
export const initializeTimeSeries = (pointCount: number = 20): NoiseDataPoint[] => {
  if (globalTimeSeriesData.length > 0) {
    return globalTimeSeriesData;
  }

  const data: NoiseDataPoint[] = [];
  const now = new Date();
  const latestReal = getLatestRealBaseline();
  const intervalMinutes = 3;
  
  for (let i = pointCount - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000));
    const strategy = getDataStrategy(timestamp);
    
    let baseNoiseLevel: number;
    
    // Get the base noise level for this timestamp
    if (strategy === 'REAL') {
      const monthKey = timestamp.toISOString().slice(0, 7) + '-01';
      const realPoint = noiseSeries.find(point => point.timestamp.startsWith(monthKey));
      
      if (realPoint) {
        baseNoiseLevel = realPoint.papineau;
      } else {
        baseNoiseLevel = latestReal.papineau;
      }
    } else {
      const daysSinceLastReal = Math.floor((timestamp.getTime() - new Date(latestReal.timestamp).getTime()) / (24 * 60 * 60 * 1000));
      const ongoingTrend = daysSinceLastReal * -0.002;
      baseNoiseLevel = latestReal.papineau + ongoingTrend;
    }
    
    // Apply realistic variations to both historical and current data
    const noiseLevel = generateRealisticNoise(timestamp, baseNoiseLevel);
    
    // Calculate impact from EV adoption
    const totalReduction = Math.max(0, noiseSeries[0].papineau - noiseLevel);
    
    data.push({
      time: timestamp.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }),
      noise: Math.round(noiseLevel * 10) / 10,
      evImpact: Math.round(totalReduction * 10) / 10,
      location: 'papineau_cartier',
      isReal: strategy === 'REAL'
    });
  }
  
  globalTimeSeriesData = data;
  lastUpdateTime = now.getTime();
  return data;
};

/**
 * Add a new data point and maintain sliding window
 */
export const addNewDataPoint = (): NoiseDataPoint[] => {
  const now = new Date();
  const currentTime = now.getTime();
  
  // Only add new point if enough time has passed (3 minutes = 180000ms, but for demo we use 3 seconds = 3000ms)
  if (currentTime - lastUpdateTime < 3000) {
    return globalTimeSeriesData;
  }
  
  const latestReal = getLatestRealBaseline();
  const strategy = getDataStrategy(now);
  
  // Get base noise level
  let baseNoiseLevel: number;
  
  if (strategy === 'REAL') {
    const monthKey = now.toISOString().slice(0, 7) + '-01';
    const realPoint = noiseSeries.find(point => point.timestamp.startsWith(monthKey));
    baseNoiseLevel = realPoint ? realPoint.papineau : latestReal.papineau;
  } else {
    const daysSinceLastReal = Math.floor((currentTime - new Date(latestReal.timestamp).getTime()) / (24 * 60 * 60 * 1000));
    const ongoingTrend = daysSinceLastReal * -0.002;
    baseNoiseLevel = latestReal.papineau + ongoingTrend;
  }
  
  // Apply consistent realistic variations
  const noiseLevel = generateRealisticNoise(now, baseNoiseLevel);
  const totalReduction = Math.max(0, noiseSeries[0].papineau - noiseLevel);
  
  const newPoint: NoiseDataPoint = {
    time: now.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' }),
    noise: Math.round(noiseLevel * 10) / 10,
    evImpact: Math.round(totalReduction * 10) / 10,
    location: 'papineau_cartier',
    isReal: strategy === 'REAL'
  };
  
  // Add new point and remove oldest to maintain sliding window
  globalTimeSeriesData.push(newPoint);
  if (globalTimeSeriesData.length > 20) {
    globalTimeSeriesData.shift();
  }
  
  lastUpdateTime = currentTime;
  return [...globalTimeSeriesData]; // Return copy to avoid reference issues
};

/**
 * Get unified noise data - maintains continuity
 */
export const generateUnifiedNoiseData = (pointCount: number = 20): NoiseDataPoint[] => {
  if (globalTimeSeriesData.length === 0) {
    return initializeTimeSeries(pointCount);
  } else {
    return addNewDataPoint();
  }
};

/**
 * Get current EV adoption rate with smooth progression
 */
export const getCurrentUnifiedEVAdoption = (): number => {
  const now = new Date();
  const latestEVData = evSeries[evSeries.length - 1];
  const strategy = getDataStrategy(now);
  
  if (strategy === 'REAL') {
    // Use real data if available
    const adoptionRate = (latestEVData.papineau / TOTAL_VEHICLES_ESTIMATE) * 100;
    return Math.round(adoptionRate * 100) / 100;
  } else {
    // Extend trend from latest real data
    const daysSinceLastReal = Math.floor((now.getTime() - new Date(latestEVData.timestamp).getTime()) / (24 * 60 * 60 * 1000));
    const monthlyGrowthRate = 3; // 3% monthly growth from real data trend
    const dailyGrowthRate = Math.pow(1 + monthlyGrowthRate / 100, 1 / 30) - 1;
    
    const projectedEVs = latestEVData.papineau * Math.pow(1 + dailyGrowthRate, daysSinceLastReal);
    const adoptionRate = (projectedEVs / TOTAL_VEHICLES_ESTIMATE) * 100;
    
    // Add small daily variation for realism
    const dailyVariation = Math.sin(Date.now() / (24 * 60 * 60 * 1000)) * 0.05;
    
    return Math.round((adoptionRate + dailyVariation) * 100) / 100;
  }
};

/**
 * Calculate noise reduction based on unified data approach
 */
export const calculateUnifiedNoiseReduction = (evRate: number): number => {
  const totalObservedReduction = noiseSeries[0].papineau - noiseSeries[noiseSeries.length - 1].papineau;
  const currentAdoption = getCurrentUnifiedEVAdoption();
  
  if (currentAdoption === 0) return 0;
  
  // Calculate proportional reduction
  const proportionalReduction = (evRate / currentAdoption) * totalObservedReduction;
  return Math.round(proportionalReduction * 100) / 100;
};

/**
 * Get data summary with unified approach
 */
export const getUnifiedDataSummary = () => {
  const firstReal = noiseSeries[0];
  const lastReal = noiseSeries[noiseSeries.length - 1];
  const firstEV = evSeries[0];
  const lastEV = evSeries[evSeries.length - 1];
  
  return {
    realDataPeriod: {
      start: firstReal.timestamp,
      end: lastReal.timestamp,
      monthsTracked: noiseSeries.length
    },
    noiseReduction: {
      papineau: Math.round((firstReal.papineau - lastReal.papineau) * 100) / 100,
      cartier: Math.round((firstReal.cartier - lastReal.cartier) * 100) / 100
    },
    evGrowth: {
      papineau: {
        start: firstEV.papineau,
        end: lastEV.papineau,
        totalGrowth: Math.round(((lastEV.papineau / firstEV.papineau) - 1) * 10000) / 100
      }
    },
    currentStrategy: getDataStrategy(new Date()),
    transitionPoint: REAL_DATA_CUTOFF
  };
};

/**
 * Reset the time series state (useful for fresh starts)
 */
export const resetTimeSeries = (): void => {
  globalTimeSeriesData = [];
  lastUpdateTime = 0;
};
