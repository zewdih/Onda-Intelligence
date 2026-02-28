# Onda Intelligence

Mission-first coastal cleanup optimization platform.

Onda Intelligence uses drone shoreline mapping and AI analysis to identify high-density plastic zones, estimate waste volume, and optimize expedition logistics before deployment.
It estimates visible vs buried waste, calculates person-hours required, and optimizes ship deployment for Plastic Odyssey expeditions using geospatial analysis.

## What It Does

- **7 active missions** across Dakar, Santo Domingo, Recife, Manila, Thessaloniki, Abidjan, and Bali
- **Shoreline segmentation** — divides coastlines into density-categorized segments (green / yellow / red)
- **Waste estimation** — corrects visible tonnage for buried waste (40/60 split), computes kg/m² density
- **Resource planning** — person-hours, crew size, and ship count calculator per mission
- **Interactive map** — Leaflet-based with mission markers, zone polygons, and ship parking markers
- **Priority dashboard** — missions grouped by HIGH / MEDIUM / LOW with expedition KPIs

## Trash Hotspots (Coming Soon)

The heat map layer has been temporarily removed while we train a **YOLOv8-mseg** drone-image segmentation model. Once trained, it will render precise trash detection polygons on the map.

The integration is fully scaffolded:
- Feature flag: `VITE_ENABLE_TRASH_HOTSPOTS_LAYER` (set to `true` in `.env` to enable)
- Stub component: `TrashHotspotsLayer` — calls `hotspotsService.getHotspots()`, ready for GeoJSON rendering
- API contract: `POST /api/inference` and `GET /api/hotspots` stubs defined
- Types: `HotspotFeature` with properties for `run_id`, `confidence`, `model_version`, `trash_area_px`, `trash_area_m2`

## Tech Stack

- React 19 + TypeScript + Vite
- Leaflet + React-Leaflet (maps)
- Framer Motion (animations)
- Tailwind CSS v4 (styling)
- Vitest (testing — 53 tests)

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm test` | Run all tests |
| `npm run preview` | Preview production build |

## Why It Matters

Cleanup missions often underestimate waste volume and logistics needs.
Onda Intelligence enables data-driven expedition planning to reduce risk and maximize impact.

Built for the Ocean Tech Hackathon.
