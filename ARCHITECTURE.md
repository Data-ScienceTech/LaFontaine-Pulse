
# Technical Architecture - Lafontaine Park Noise Monitor

## System Overview

The Lafontaine Park Noise Monitor is a client-side React application that provides real-time visualization of noise pollution data correlated with electric vehicle adoption rates in Montreal.

## Architecture Patterns

### Component Architecture
- **Monolithic Page Component**: Currently using a single `Index.tsx` component (458 lines)
- **Shared UI Components**: Leveraging shadcn/ui component library
- **Data-Driven Rendering**: Components respond to data changes from `evData.ts`

### Data Flow
```
noise_ev_data.ts → unifiedDataAdapter.ts → evData.ts → Index.tsx → UI Components
    ↓
Persistent time series with sliding window approach
    ↓
Real-time updates every 3 seconds with continuous data
    ↓
Chart rendering with realistic variations
```

### State Management
- **Local State**: Using React `useState` for component state
- **No Global State**: Currently no Redux/Zustand implementation
- **Future**: Ready for @tanstack/react-query integration

## Key Technical Components

### 1. Data Foundation (`src/data/noise_ev_data.ts`)
```typescript
// Real DRSP/SAAQ data (June 2023 - May 2025)
noiseSeries: Historical monthly noise measurements (LAeq24)
evSeries: Historical monthly EV registrations
```

### 2. Unified Data Adapter (`src/data/unifiedDataAdapter.ts`)
```typescript
// Connects real data with UI visualization
generateRealisticNoise(): Multi-factor noise pattern generation
initializeTimeSeries(): Creates initial time series with variations
addNewDataPoint(): Sliding window approach for continuous updates
getDataStrategy(): Determines data source (REAL vs ESTIMATED)
```

### 3. Data Interface Layer (`src/data/evData.ts`)
```typescript
// Core data structures
EVAdoptionDataPoint: Historical EV adoption data
NoiseDataPoint: Real-time noise measurements
currentEVData: Live statistics and targets

// Key functions
generateNoiseData(): Creates realistic noise patterns
getCurrentEVAdoption(): Simulates real-time EV data
calculateNoiseReduction(): Correlates EV adoption to noise reduction
```

### 2. Visualization Layer
- **Charts**: Recharts library for responsive data visualization
- **Real-time Updates**: 3-second intervals for data refresh
- **Interactive Elements**: Hover states, tooltips, and responsive design

### 3. Internationalization
```typescript
const translations = {
  en: { /* English translations */ },
  fr: { /* French translations */ }
}
```

### 4. Privacy & Consent
- **GDPR Compliance**: Modal consent system
- **Data Protection**: Anonymized data collection only
- **Quebec Bill 64**: Specific privacy regulation compliance

## Performance Considerations

### Current Implementation
- **Client-Side Rendering**: No SSR/SSG
- **Data Generation**: Client-side simulation (3-second intervals)
- **Memory Management**: Limited to last 20 data points

### Optimization Opportunities
1. **Component Splitting**: Break down 458-line Index.tsx
2. **Memoization**: React.memo for expensive components
3. **Data Caching**: Implement react-query for data management
4. **Code Splitting**: Route-based code splitting

## Scalability Design

### Data Integration Ready
```typescript
// Current: Simulated data
const noiseData = generateNoiseData(evAdoption);

// Future: API integration
const noiseData = await fetchRealTimeNoiseData();
```

### Backend Integration Points
1. **Supabase Ready**: Consent storage and user tracking
2. **API Endpoints**: Prepared for real sensor data integration
3. **Database Schema**: Designed for time-series data storage

## Development Workflow

### Hot Reload Development
```bash
npm run dev  # Vite dev server with hot reload
```

### Build Process
```bash
npm run build    # Production build
npm run preview  # Preview production build
```

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting (implicit through Lovable)

## Deployment Architecture

### Lovable Platform
- **Automatic Deployment**: Git-based continuous deployment
- **Preview URLs**: Instant preview for each change
- **Custom Domains**: Production domain support

### GitHub Integration
- **Bidirectional Sync**: Lovable ↔ GitHub automatic sync
- **Version Control**: Full Git history and branching support
- **Collaboration**: Standard GitHub workflows

## Security Considerations

### Client-Side Security
- **No Sensitive Data**: All data is anonymized
- **HTTPS Only**: Secure data transmission
- **Content Security Policy**: Standard web security headers

### Privacy by Design
- **Minimal Data Collection**: Only environmental noise data
- **Explicit Consent**: Clear user consent mechanisms
- **Data Retention**: Limited client-side data retention

## Future Architecture Plans

### Microservices Potential
1. **Sensor Data Service**: Real-time noise data ingestion
2. **Analytics Service**: EV correlation and trend analysis
3. **User Management**: Consent and preference management

### Real-time Infrastructure
1. **WebSocket Integration**: Live data streaming
2. **Edge Computing**: Sensor data processing
3. **CDN Optimization**: Global data distribution

## Integration Points

### External APIs (Future)
- **Montreal Open Data**: Real EV registration data
- **Sensor Networks**: IoT noise monitoring devices
- **Weather APIs**: Environmental correlation data

### Analytics (Future)
- **Google Analytics**: User behavior tracking
- **Custom Analytics**: Environmental data insights
- **Reporting Dashboard**: Administrative data views

## Technology Decision Rationale

### React + TypeScript
- **Developer Experience**: Excellent tooling and community
- **Type Safety**: Reduces runtime errors
- **Component Reusability**: Modular architecture

### Tailwind CSS
- **Rapid Development**: Utility-first styling
- **Responsive Design**: Mobile-first approach
- **Design Consistency**: Design system integration

### Recharts
- **React Integration**: Native React chart library
- **Customization**: Flexible styling and animation
- **Performance**: Optimized for real-time data updates

This architecture provides a solid foundation for the current application while remaining flexible for future enhancements and real data integration.
