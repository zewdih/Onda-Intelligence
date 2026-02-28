import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getHotspots, runInference } from '../services/hotspotsService';
import { handleGetHotspots, handlePostInference } from '../api/hotspots';
import { ENABLE_TRASH_HOTSPOTS_LAYER } from '../config/featureFlags';

describe('Feature flag', () => {
  it('ENABLE_TRASH_HOTSPOTS_LAYER defaults to false', () => {
    expect(ENABLE_TRASH_HOTSPOTS_LAYER).toBe(false);
  });
});

describe('Heat map removal', () => {
  it('MapView does not import CoastalHeatLayer or coastalHeat', () => {
    const path = fileURLToPath(new URL('../components/Map/MapView.tsx', import.meta.url));
    const content = readFileSync(path, 'utf-8');
    expect(content).not.toContain('CoastalHeatLayer');
    expect(content).not.toContain('coastalHeat');
    expect(content).not.toContain('computeCoastalHeat');
  });

  it('HeatOverlay does not export CoastalHeatLayer', () => {
    const path = fileURLToPath(new URL('../components/Map/HeatOverlay.tsx', import.meta.url));
    const content = readFileSync(path, 'utf-8');
    expect(content).not.toContain('CoastalHeatLayer');
  });
});

describe('Placeholder card', () => {
  it('TrashHotspotsPlaceholder module exports a default function', async () => {
    const mod = await import('../components/Map/TrashHotspotsPlaceholder');
    expect(typeof mod.default).toBe('function');
  });
});

describe('hotspotsService', () => {
  it('getHotspots returns a valid GeoJSON FeatureCollection', async () => {
    const result = await getHotspots({ areaId: 'po-001' });
    expect(result.type).toBe('FeatureCollection');
    expect(Array.isArray(result.features)).toBe(true);
    expect(result.features).toHaveLength(0);
  });

  it('getHotspots accepts optional date range params', async () => {
    const result = await getHotspots({
      areaId: 'po-002',
      dateFrom: '2026-01-01',
      dateTo: '2026-03-01',
    });
    expect(result.type).toBe('FeatureCollection');
  });

  it('runInference returns stub result with model_version', async () => {
    const result = await runInference({});
    expect(result.model_version).toBe('yolov8-mseg-v0.1-stub');
    expect(result.detections).toHaveLength(0);
    expect(result.masks).toHaveLength(0);
  });
});

describe('API route stubs', () => {
  it('GET /api/hotspots returns valid GeoJSON FeatureCollection shape', () => {
    const result = handleGetHotspots({ areaId: 'po-001' });
    expect(result.type).toBe('FeatureCollection');
    expect(Array.isArray(result.features)).toBe(true);
    expect(result.features).toHaveLength(0);
  });

  it('GET /api/hotspots works with no params', () => {
    const result = handleGetHotspots({});
    expect(result.type).toBe('FeatureCollection');
    expect(Array.isArray(result.features)).toBe(true);
  });

  it('POST /api/inference returns stub JSON with model_version and empty detections/masks', () => {
    const result = handlePostInference({});
    expect(result.model_version).toBe('yolov8-mseg-v0.1-stub');
    expect(result.detections).toHaveLength(0);
    expect(result.masks).toHaveLength(0);
  });
});
