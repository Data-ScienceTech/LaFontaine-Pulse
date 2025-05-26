// Test the unified data adapter to ensure smooth time series
const { generateUnifiedNoiseData, resetTimeSeries } = require('./unifiedDataAdapter.ts');

console.log('Testing Unified Data Adapter...');

// Reset and generate initial data
resetTimeSeries();
const initialData = generateUnifiedNoiseData(5);
console.log('Initial data:', initialData.map(d => ({ time: d.time, noise: d.noise })));

// Wait and add new point
setTimeout(() => {
  const updatedData = generateUnifiedNoiseData(5);
  console.log('After 3 seconds:', updatedData.map(d => ({ time: d.time, noise: d.noise })));
  
  // Check if we have proper sliding window behavior
  console.log('Length should be 5:', updatedData.length);
  console.log('Should have continuous data without jumps');
}, 3100);
