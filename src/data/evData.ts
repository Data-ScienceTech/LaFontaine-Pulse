
// EV Adoption Data for Montreal/Quebec/Canada
// This structure mimics what you'd get from a pandas dataframe
// Replace this with real API calls or database queries later

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
}

// Historical and projected EV adoption rates (percentages)
export const evAdoptionTimeSeries: EVAdoptionDataPoint[] = [
  { year: 2020, montreal: 3.2, quebec: 4.1, canada: 3.5, noiseReduction: 0.8 },
  { year: 2021, montreal: 4.8, quebec: 6.2, canada: 5.2, noiseReduction: 1.2 },
  { year: 2022, montreal: 6.5, quebec: 8.7, canada: 6.8, noiseReduction: 1.8 },
  { year: 2023, montreal: 7.9, quebec: 11.2, canada: 8.4, noiseReduction: 2.4 },
  { year: 2024, montreal: 8.2, quebec: 12.4, canada: 9.1, noiseReduction: 2.8 },
  { year: 2025, montreal: 12.5, quebec: 16.8, canada: 13.2, noiseReduction: 4.2 },
  { year: 2026, montreal: 17.2, quebec: 22.1, canada: 18.5, noiseReduction: 5.8 },
  { year: 2027, montreal: 22.8, quebec: 27.9, canada: 23.7, noiseReduction: 7.6 },
  { year: 2028, montreal: 28.1, quebec: 33.2, canada: 27.9, noiseReduction: 9.2 },
  { year: 2029, montreal: 32.6, quebec: 37.8, canada: 29.8, noiseReduction: 10.8 },
  { year: 2030, montreal: 35.0, quebec: 40.0, canada: 30.0, noiseReduction: 12.0 }
];

// Current data (what would come from real-time APIs)
export const currentEVData = {
  montreal: { 
    current: 8.2, 
    target2030: 35,
    monthlyGrowth: 0.3,
    noiseImpactPercentage: 8 // max dB reduction at 100% adoption
  },
  quebec: { 
    current: 12.4, 
    target2030: 40,
    monthlyGrowth: 0.4,
    noiseImpactPercentage: 8
  },
  canada: { 
    current: 9.1, 
    target2030: 30,
    monthlyGrowth: 0.25,
    noiseImpactPercentage: 8
  }
};

// Rush hour patterns with EV impact calculations
export const generateNoiseData = (evAdoptionRate: number): NoiseDataPoint[] => {
  const data: NoiseDataPoint[] = [];
  const now = new Date();
  
  // Generate last 20 data points (1 hour of 3-minute intervals)
  for (let i = 19; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * 3 * 60 * 1000));
    const hour = timestamp.getHours();
    const minute = timestamp.getMinutes();
    
    // Base noise levels by time of day
    let baseNoise = 40;
    if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
      baseNoise = 58; // Rush hour
    } else if (hour >= 6 && hour <= 22) {
      baseNoise = 47; // Regular daytime
    } else {
      baseNoise = 35; // Nighttime
    }
    
    // Calculate EV impact on noise reduction
    const maxNoiseReduction = currentEVData.montreal.noiseImpactPercentage;
    const evImpactReduction = (evAdoptionRate / 100) * maxNoiseReduction;
    
    // Add some realistic variation
    const variation = Math.sin((hour * 60 + minute) / 60) * 3 + Math.random() * 4 - 2;
    const finalNoise = Math.max(30, Math.min(75, baseNoise - evImpactReduction + variation));
    
    data.push({
      time: timestamp.toLocaleTimeString(),
      noise: Math.round(finalNoise * 10) / 10,
      evImpact: Math.round(evImpactReduction * 10) / 10,
      location: 'papineau_cartier'
    });
  }
  
  return data;
};

// Function to get current EV adoption with realistic fluctuation
export const getCurrentEVAdoption = (): number => {
  const baseRate = currentEVData.montreal.current;
  const monthlyGrowth = currentEVData.montreal.monthlyGrowth;
  const dailyVariation = Math.sin(Date.now() / (24 * 60 * 60 * 1000)) * 0.1;
  
  return baseRate + dailyVariation;
};

// Function to calculate noise reduction impact from EV adoption
export const calculateNoiseReduction = (evRate: number): number => {
  return (evRate / 100) * currentEVData.montreal.noiseImpactPercentage;
};
