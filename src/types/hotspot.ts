import type { Feature, FeatureCollection, Polygon } from 'geojson';

export interface HotspotProperties {
  run_id: string;
  timestamp: string;        // ISO 8601
  confidence: number;       // 0–1
  model_version: string;    // e.g. "yolov8-mseg-v0.1"
  trash_area_px: number;    // segmentation mask area in pixels
  trash_area_m2?: number;   // real-world area (requires GSD)
  image_id?: string;        // source drone image reference
}

export type HotspotFeature = Feature<Polygon, HotspotProperties>;

export type HotspotFeatureCollection = FeatureCollection<Polygon, HotspotProperties>;

export interface InferenceResult {
  model_version: string;
  detections: HotspotFeature[];
  masks: never[];            // placeholder for instance segmentation masks
}
