// Test script to verify unified data approach
import { generateUnifiedNoiseData, getCurrentUnifiedEVAdoption, getUnifiedDataSummary } from './unifiedDataAdapter.js';

console.log('Testing Unified Data Adapter...\n');

// Test 1: Data Summary
console.log('1. Data Summary:');
const summary = getUnifiedDataSummary();
console.log(JSON.stringify(summary, null, 2));

// Test 2: Current EV Adoption
console.log('\n2. Current EV Adoption:');
const currentEV = getCurrentUnifiedEVAdoption();
console.log(`Current EV adoption: ${currentEV}%`);

// Test 3: Unified Noise Data
console.log('\n3. Unified Noise Data (last 5 points):');
const noiseData = generateUnifiedNoiseData(5);
noiseData.forEach((point, index) => {
  console.log(`${index + 1}. ${point.time}: ${point.noise} dB (${point.isReal ? 'REAL' : 'ESTIMATED'}) - EV Impact: ${point.evImpact} dB`);
});

console.log('\n✅ Unified data approach test completed!');
