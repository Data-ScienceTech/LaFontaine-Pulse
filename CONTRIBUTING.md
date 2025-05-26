
# Contributing to Lafontaine Park Noise Monitor

## Project Overview

This project is owned and maintained by **DataScienceTech.ca** (info@datasciencetech.ca).

The Lafontaine Park Noise Monitor is a real-time environmental monitoring application that tracks noise pollution at the Papineau & Cartier intersection in Montreal's Plateau neighborhood, correlating it with electric vehicle (EV) adoption data.

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Management**: @tanstack/react-query
- **Routing**: React Router DOM
- **Deployment**: Lovable Platform

## Project Structure

```
src/
├── components/
│   └── ui/                 # shadcn/ui components (accordion, button, etc.)
├── data/
│   └── evData.ts          # EV adoption data and noise generation logic
├── hooks/
│   └── use-toast.ts       # Toast notification hook
├── lib/
│   └── utils.ts           # Utility functions (Tailwind merge, etc.)
├── pages/
│   ├── Index.tsx          # Main application page
│   └── NotFound.tsx       # 404 page
├── App.tsx                # Main application component with routing
├── main.tsx               # Application entry point
└── index.css              # Global styles and Tailwind imports
```

## Key Features

1. **Real-time Noise Monitoring**: Simulated noise data with realistic patterns
2. **EV Adoption Correlation**: Shows how electric vehicle adoption affects noise levels
3. **Bilingual Support**: Full French and English localization
4. **Privacy Compliance**: GDPR/Quebec Bill 64 compliant consent system
5. **Responsive Design**: Works on desktop and mobile devices
6. **Data Visualization**: Interactive charts showing noise trends over time

## Data Structure

The application uses a structured data approach in `src/data/evData.ts`:

- **EVAdoptionDataPoint**: Historical and projected EV adoption rates
- **NoiseDataPoint**: Real-time noise measurements with EV impact correlation
- **currentEVData**: Current statistics for Montreal, Quebec, and Canada

## Development Setup

1. **Prerequisites**:
   - Node.js 18+ with npm
   - Git

2. **Installation**:
   ```bash
   git clone <repository-url>
   cd lafontaine-noise-monitor
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Build**:
   ```bash
   npm run build
   ```

## Code Style Guidelines

- Use TypeScript for all new code
- Follow the existing component structure
- Use Tailwind CSS for styling
- Implement responsive design by default
- Add proper type definitions for all data structures
- Use meaningful variable and function names
- Add comments for complex logic

## Data Integration

The application is designed for easy data replacement:

1. **Mock Data**: Currently uses simulated data in `evData.ts`
2. **Real Data Integration**: Replace functions in `evData.ts` with API calls
3. **Database Integration**: Ready for Supabase integration for consent storage

## Sensor Information

- **Location**: Les Dauphins sur Le Parc (28th floor)
- **Intersection**: Papineau & Cartier, Montreal
- **Technology**: High-sensitivity audio sensor with AI processing
- **Coverage**: Rush hour traffic patterns from South Shore commuters

## Internationalization

The application supports English and French through the `translations` object in `Index.tsx`. All user-facing text should be added to both language objects.

## Privacy & Compliance

- Implements Quebec Bill 64 compliance
- Collects only anonymized environmental data
- No personal information storage
- Clear consent mechanisms

## Future Enhancements

1. Real-time API integration
2. Supabase backend for data persistence
3. Advanced analytics dashboard
4. Mobile app development
5. Additional sensor locations

## Contact & Support

- **Website**: https://datasciencetech.ca
- **Email**: info@datasciencetech.ca
- **License**: GPL v3

## Deployment

The application is deployed on the Lovable platform with automatic GitHub integration for continuous deployment.
