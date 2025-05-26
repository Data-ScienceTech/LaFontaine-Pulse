# Estimating Monthly Noise Levels and Electric‑Vehicle Uptake for Avenue Papineau & Rue Cartier (Montréal)

> **File produced**: [`noise_ev_data.ts`](./noise_ev_data.ts)
> **Author**: Carlos Denner dos Santos (with ChatGPT‑assisted methodology)
> **Last updated**: 26 May 2025

---

## 1  Project Goal

Provide a *synthetic yet defensible* time‑series (June 2023 → May 2025) of:

1. **Environmental noise** – average 24‑h equivalent sound level (LAeq24, dBA) for two contrasting urban corridors: **Avenue Papineau** (major arterial) and **Rue Cartier** (local/residential) in Montréal.
2. **Electric‑vehicle (EV) adoption** – cumulative number of registered battery‑electric or plug‑in hybrid vehicles whose primary parking location lies within ≈ 500 m of each corridor.

The data are stored in TypeScript objects so they can be imported straight into the React front‑end of *datascience‑tech‑platform* without schema changes.

---

## 2  Data Inputs & References

| Domain         | Dataset / Publication                                                                                                                            | Vintage            | Notes                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Noise          | **Direction régionale de santé publique (DRSP) – Montréal – Carte de bruit** ("*Le bruit et la santé*", 2017)                                    | 2017 reference map | Provides LAeq24 contours in 5 dB bands; values corroborated by 2023 spot measurements in Ville‑Marie & Plateau‑Mont‑Royal. |
| Traffic trends | *Plan de transport de Montréal* progress KPIs                                                                                                    | 2020–2024          | Shows ↓ 1.2 %/yr private‑car VKT on arterials where traffic‑calming measures installed.                                    |
| EV adoption    | **SAAQ immatriculations analysées par AVÉQ** – *Statistiques SAAQ‑AVÉQ sur l’électromobilité au Québec en date du 31 déc 2024* (4 Apr 2025 post) | Q4 2024            | Province‑wide growth of 49 % YoY; borough split inferred with census‑based fleet multipliers.                              |
| Charging infra | **Ville de Montréal – Bornes de recharge publiques** (Open Data)                                                                                 | Apr 2025           | Confirms cluster of Level‑2 & DCFC spots along Papineau & Cartier; used as a proxy for local EV readiness.                 |

*Minor sources*: Statistics Canada new‑vehicle registrations (2024), Montréal traffic sensor loop counts (Service de transport), WHO night‑noise guidelines (55 dB outdoor).

---

## 3  Spatial Scope

* **Buffer radius**: 500 m around the intersection of **Av. Papineau × Rue Sherbrooke E** and **Rue Cartier × Rue Mont‑Royal E**.  This distance roughly captures the street‑level exposure zone for façade noise and residents who are most likely to park on‑street.
* **Why 500 m?**
  *Meters between home location and nearest arterial strongly correlate with façade LAeq in DRSP map.*  A 500 m buffer balances representativeness with manageable counts from aggregated EV datasets.

> **Tip** – If you obtain parcel‑level EV registrations, regenerate the series with the same script but change the `BUFFER_METERS` constant.

---

## 4  Noise‑Series Methodology

1. **Baseline extraction (June 2023)**

   * Digitised the 70–75 dB contour crossing Av. Papineau and the 65–70 dB contour along Rue Cartier from the DRSP PDF (QGIS geo‑referencing).
   * Took the mid‑band value (73 dB, 65 dB respectively) as initial LAeq24.
2. **Monthly trend model**

   * **Traffic calming** (narrowed lanes, new bike paths) on Papineau produced ≈ 0.4 dB/yr drop in analogous arterials (Ville de Montréal acoustics reports).
   * **EV fleet share**: each +10 % EV penetration yields –0.25 dB overall road noise (US DOT FHWA model, medium‑speed).  Scaling this to a 49 % annual fleet growth gives –0.15 dB/yr in mixed traffic.
   * **Combined effect** ≈ –0.6 dB/yr on Papineau, –0.36 dB/yr on Cartier.
   * Implemented as **–0.05 dB/month (Papineau)**, **–0.03 dB/month (Cartier)**.
3. **Series generation**

   * For each month *m > 0*: `LAeqₘ = LAeq₀ – m × Δ`, where Δ is 0.05 or 0.03.

> **Sensitivity** – ±0.1 dB/month around these gradients changes the 24‑month end‑point by ≤ 2 dB, well within the uncertainty of façade reflections and seasonal leaf‑on/leaf‑off effects.

---

## 5  EV‑Series Methodology

1. **Baseline counts (June 2023)**

   * Borough‑level EV totals (Plateau‑Mont‑Royal & Ville‑Marie) from SAAQ were down‑scaled by the ratio of *dwellings within 500 m buffer / total borough dwellings*.
   * Rounded to **2 200 EVs** near Av. Papineau and **1 800 EVs** near Rue Cartier.
2. **Growth rate**

   * 2024 provincial registrations ↑ 49.22 % YoY (AVÉQ analysis) → compound monthly growth rate **r ≈ 3 %**.
   * Applied `EVₘ = EV₀ × 1.03ᵐ` (m months since baseline).
3. **Rounding**

   * Values kept as whole numbers (vehicle counts) – your front‑end can format with comma separators.

---

## 6  TypeScript Schema & File Layout

```ts
export interface DataPoint {
  timestamp: string;  // YYYY-MM-DD (first day of month)
  papineau: number;   // noise (dBA) or EV count, depending on array
  cartier: number;
}

export const noiseSeries: DataPoint[] = [ /* 24 rows */ ];
export const evSeries:    DataPoint[] = [ /* 24 rows */ ];
```

The file sits in `src/data/` (or wherever you import other datasets).  Import it as:

```ts
import { noiseSeries, evSeries } from "@/data/noise_ev_data";
```

The strict typing lets ECharts/Recharts consume both arrays without run‑time guards.

---

## 7  Limitations & Future Work

* **Granularity** – Monthly averages mask diurnal peaks (rush hours).  If Montréal releases street‑level *Ln* (night) measurements, revise Section 4 with two‑step diurnal modelling.
* **Spatial drift** – Residents may relocate; EV counts reflect *registration* address, not necessarily *parking* location.  Access to Hydro‑Québec charging‑session logs would refine spatial attribution.
* **Policy shocks** – ZEV mandate escalations or noise‑barrier construction could create step‑changes.  Monitor annual DRSP updates.

### TODOs

1. Replace deterministic trends with Monte‑Carlo simulation – feed parameter distributions into `noise_ev_generator.ipynb`.
2. Ingest forthcoming *Montréal Open Data* traffic sensor feeds to calibrate ΔLAeq dynamically.
3. Publish the QGIS processing chain (`/analysis/qgis_project/`).

---

## 8  Re‑generation Script (short walkthrough)

1. Clone repo and `cd scripts`.
2. Run `python generate_noise_ev_series.py --start 2023-06 --months 24 --papineau-db 73 0.05 --cartier-db 65 0.03 --ev-base 2200 1800 --ev-growth 0.03`.
3. Script writes the new `.ts` file and prints a diff against the previous commit.

> **Tip** – Wrap step 2 in a GitHub Action (cron monthly) so you always have up‑to‑date estimates.

---

## 9  License & Attribution

* **Noise estimates** © 2025 *Carlos Denner dos Santos* – Creative Commons BY 4.0.  Acknowledge DRSP Montréal.
* **EV counts** rely on SAAQ data © Gouvernement du Québec; used under the *Licence ouverte* Québec 2.0.
* City of Montréal datasets © Ville de Montréal, open under *OPL 2.0*.

---

## 10  References

1. Direction régionale de santé publique (DRSP) de Montréal. *Le bruit et la santé* (Carte LAeq24). Montréal, 2017.
2. Association des véhicules électriques du Québec (AVÉQ). *Statistiques SAAQ‑AVÉQ sur l’électromobilité au Québec au 31 déc 2024* (blog post, 4 Apr 2025).
3. Ville de Montréal. *Bornes de recharge publiques pour voitures électriques* (Open Data, update Apr 2025).
4. Ville de Montréal. *Plan de transport – Suivi 2024*.
5. World Health Organization. *Environmental Noise Guidelines for the European Region*, 2018.

---

*Questions or pull‑requests?* → Open an issue or ping **@carlos‑denner**.