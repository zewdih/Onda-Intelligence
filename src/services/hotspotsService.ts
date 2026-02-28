import type { HotspotFeatureCollection, InferenceResult } from '../types/hotspot';

export interface GetHotspotsParams {
  areaId: string;
  dateFrom?: string;
  dateTo?: string;
}

const EMPTY_COLLECTION: HotspotFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

/**
 * Fetch hotspot detections for a given area and date range.
 * Currently returns an empty FeatureCollection — will call
 * GET /api/hotspots once the YOLOv8-mseg model is deployed.
 */
export async function getHotspots(_params: GetHotspotsParams): Promise<HotspotFeatureCollection> {
  // TODO: Replace with real API call once model is deployed
  // const url = `/api/hotspots?areaId=${params.areaId}&from=${params.dateFrom}&to=${params.dateTo}`;
  // const res = await fetch(url);
  // return res.json();
  return EMPTY_COLLECTION;
}

/**
 * Submit an image for inference.
 * Currently returns a stub response — will call POST /api/inference
 * once the YOLOv8-mseg model is deployed.
 */
export async function runInference(_imageData: unknown): Promise<InferenceResult> {
  // TODO: Replace with real API call
  // const res = await fetch('/api/inference', { method: 'POST', body: ... });
  // return res.json();
  return {
    model_version: 'yolov8-mseg-v0.1-stub',
    detections: [],
    masks: [],
  };
}
