/**
 * API route stubs for trash hotspot endpoints.
 * These define the contract for when a real backend is deployed.
 * Currently they return placeholder responses.
 */

import type { HotspotFeatureCollection, InferenceResult } from '../types/hotspot';

/** GET /api/hotspots — returns GeoJSON FeatureCollection of detected trash hotspots. */
export function handleGetHotspots(
  _query: { areaId?: string; from?: string; to?: string },
): HotspotFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [],
  };
}

/** POST /api/inference — accepts an image and returns model detections/masks. */
export function handlePostInference(
  _body: unknown,
): InferenceResult {
  return {
    model_version: 'yolov8-mseg-v0.1-stub',
    detections: [],
    masks: [],
  };
}
