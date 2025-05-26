// noise_ev_data.ts
// Estimated datasets for Avenue Papineau and Rue Cartier (Montreal)
// Noise levels represent monthly LAeq24 (dBA) averages.
// EV data represent cumulative registered electric vehicles within ~500 m radius.
// Sources:
// - Direction régionale de santé publique de Montréal (DRSP) 2017 noise mapping. (See PDF)
// - SAAQ–AVÉQ electric vehicle registration statistics (updated April 4 2025).
// - City of Montréal open data: Bornes de recharge publiques (updated April 2025).
// Methodology:
// • Baseline LAeq24 values set at 73 dB (Papineau, major artery) and 65 dB (Cartier, residential) for Jun 2023.
//   Gradual monthly reduction models traffic-calming & EV penetration (–0.05 dB & –0.03 dB per month).
// • EV counts seeded at 2 200 (Papineau) & 1 800 (Cartier) in Jun 2023, grown 3 % per month reflecting
//   observed 49 % annual provincial growth (AVEQ/SAAQ 2024).
// Adjust coefficients in your pipeline if higher‑resolution data become available.

export interface DataPoint {
  timestamp: string;  // YYYY-MM-DD (first of month)
  papineau: number;   // value for Papineau
  cartier: number;    // value for Cartier
}

export const noiseSeries: DataPoint[] = [
  { timestamp: '2023-06-01', papineau: 73.0, cartier: 65.0 },
  { timestamp: '2023-07-01', papineau: 72.95, cartier: 64.97 },
  { timestamp: '2023-08-01', papineau: 72.9, cartier: 64.94 },
  { timestamp: '2023-09-01', papineau: 72.85, cartier: 64.91 },
  { timestamp: '2023-10-01', papineau: 72.8, cartier: 64.88 },
  { timestamp: '2023-11-01', papineau: 72.75, cartier: 64.85 },
  { timestamp: '2023-12-01', papineau: 72.7, cartier: 64.82 },
  { timestamp: '2024-01-01', papineau: 72.65, cartier: 64.79 },
  { timestamp: '2024-02-01', papineau: 72.6, cartier: 64.76 },
  { timestamp: '2024-03-01', papineau: 72.55, cartier: 64.73 },
  { timestamp: '2024-04-01', papineau: 72.5, cartier: 64.7 },
  { timestamp: '2024-05-01', papineau: 72.45, cartier: 64.67 },
  { timestamp: '2024-06-01', papineau: 72.4, cartier: 64.64 },
  { timestamp: '2024-07-01', papineau: 72.35, cartier: 64.61 },
  { timestamp: '2024-08-01', papineau: 72.3, cartier: 64.58 },
  { timestamp: '2024-09-01', papineau: 72.25, cartier: 64.55 },
  { timestamp: '2024-10-01', papineau: 72.2, cartier: 64.52 },
  { timestamp: '2024-11-01', papineau: 72.15, cartier: 64.49 },
  { timestamp: '2024-12-01', papineau: 72.1, cartier: 64.46 },
  { timestamp: '2025-01-01', papineau: 72.05, cartier: 64.43 },
  { timestamp: '2025-02-01', papineau: 72.0, cartier: 64.4 },
  { timestamp: '2025-03-01', papineau: 71.95, cartier: 64.37 },
  { timestamp: '2025-04-01', papineau: 71.9, cartier: 64.34 },
  { timestamp: '2025-05-01', papineau: 71.85, cartier: 64.31 }
];

export const evSeries: DataPoint[] = [
  { timestamp: '2023-06-01', papineau: 2200, cartier: 1800 },
  { timestamp: '2023-07-01', papineau: 2266, cartier: 1854 },
  { timestamp: '2023-08-01', papineau: 2334, cartier: 1910 },
  { timestamp: '2023-09-01', papineau: 2404, cartier: 1967 },
  { timestamp: '2023-10-01', papineau: 2476, cartier: 2026 },
  { timestamp: '2023-11-01', papineau: 2550, cartier: 2087 },
  { timestamp: '2023-12-01', papineau: 2627, cartier: 2149 },
  { timestamp: '2024-01-01', papineau: 2706, cartier: 2214 },
  { timestamp: '2024-02-01', papineau: 2787, cartier: 2280 },
  { timestamp: '2024-03-01', papineau: 2871, cartier: 2348 },
  { timestamp: '2024-04-01', papineau: 2957, cartier: 2418 },
  { timestamp: '2024-05-01', papineau: 3046, cartier: 2490 },
  { timestamp: '2024-06-01', papineau: 3137, cartier: 2564 },
  { timestamp: '2024-07-01', papineau: 3231, cartier: 2640 },
  { timestamp: '2024-08-01', papineau: 3328, cartier: 2718 },
  { timestamp: '2024-09-01', papineau: 3428, cartier: 2798 },
  { timestamp: '2024-10-01', papineau: 3530, cartier: 2881 },
  { timestamp: '2024-11-01', papineau: 3636, cartier: 2965 },
  { timestamp: '2024-12-01', papineau: 3745, cartier: 3051 },
  { timestamp: '2025-01-01', papineau: 3857, cartier: 3139 },
  { timestamp: '2025-02-01', papineau: 3972, cartier: 3230 },
  { timestamp: '2025-03-01', papineau: 4091, cartier: 3322 },
  { timestamp: '2025-04-01', papineau: 4214, cartier: 3417 },
  { timestamp: '2025-05-01', papineau: 4340, cartier: 3514 }
];
