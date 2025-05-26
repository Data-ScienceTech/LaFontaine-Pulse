
// EV Adoption Data Integration Layer
// Now using unified data strategy that seamlessly combines real and estimated data
// Single continuous curve without discontinuities

export interface EVAdoptionDataPoint {
  year: number;
  montreal: number;
  quebec: number;
  canada: number;
  noiseReduction: number; // dB reduction from EV adoption
}

export interface NoiseDataPoint {
  time: string;
  noise: number;
  evImpact: number;
  location: 'papineau_cartier';
  isReal?: boolean; // For debugging/transparency
}

// Import unified data adapter for seamless real/estimated data
import { 
  generateUnifiedNoiseData,
  getCurrentUnifiedEVAdoption,
  calculateUnifiedNoiseReduction,
  getUnifiedDataSummary,
  getLatestRealBaseline
} from './unifiedDataAdapter';

// Keep legacy imports for backwards compatibility
import { 
  convertToEVAdoptionData, 
  currentRealEVData,
  getRealCorrelationData
} from './realDataAdapter';

// Historical and projected EV adoption rates (using real data)
export const evAdoptionTimeSeries: EVAdoptionDataPoint[] = convertToEVAdoptionData();

// Current data using unified approach
const latestBaseline = getLatestRealBaseline();
export const currentEVData = {
  montreal: { 
    current: getCurrentUnifiedEVAdoption(), 
    target2030: 35,
    monthlyGrowth: 3, // Based on real data trend
    noiseImpactPercentage: currentRealEVData.montreal.noiseImpactPercentage
  },
  quebec: { 
    current: getCurrentUnifiedEVAdoption() * 1.2, 
    target2030: 40,
    monthlyGrowth: 3,
    noiseImpactPercentage: currentRealEVData.quebec.noiseImpactPercentage
  },
  canada: { 
    current: getCurrentUnifiedEVAdoption() * 0.8, 
    target2030: 30,
    monthlyGrowth: 2.4,
    noiseImpactPercentage: currentRealEVData.canada.noiseImpactPercentage
  }
};

// Export unified data utilities
export const dataSummary = getUnifiedDataSummary();
export const correlationData = getRealCorrelationData();

// Generate unified noise data - single continuous curve from real data to estimated
export const generateNoiseData = (evAdoptionRate?: number): NoiseDataPoint[] => {
  // Use unified data generator that smoothly transitions from real to estimated
  return generateUnifiedNoiseData(20); // Last 20 data points (1 hour)
};

// Function to get current EV adoption with unified approach
export const getCurrentEVAdoption = (): number => {
  return getCurrentUnifiedEVAdoption();
};

// Function to calculate noise reduction impact using unified approach
export const calculateNoiseReduction = (evRate: number): number => {
  return calculateUnifiedNoiseReduction(evRate);
};
