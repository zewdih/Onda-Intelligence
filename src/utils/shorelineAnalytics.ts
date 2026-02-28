// Shoreline segment analytics: corrected tons, segmentation, density, person-hours.

// ── Constants (configurable defaults) ──

export const VISIBLE_FRACTION = 0.4;  // 40% of waste is visible
export const BURIED_FRACTION = 0.6;   // 60% is buried/not visible
export const SHORE_DEPTH_METERS = 30; // assumed cleanup band depth
export const EXTRACTION_RATE_TONS_PER_PERSON_PER_DAY = 0.05;
export const HOURS_PER_DAY = 8;
export const KG_PER_TON = 1000;

// ── Types ──

export interface CorrectedTons {
  visibleTons: number;
  buriedTons: number;
  correctedTotalTons: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ShorelineSegment {
  index: number;
  start: LatLng;
  end: LatLng;
  midpoint: LatLng;
  lengthMeters: number;
}

export type DensityCategory = 'green' | 'yellow' | 'red';

export interface SegmentMetrics {
  index: number;
  start: LatLng;
  end: LatLng;
  midpoint: LatLng;
  lengthMeters: number;
  areaM2: number;
  plasticTons: number;
  weightKgPerM2: number;
  personHours: number;
  category: DensityCategory;
}

// ── Corrected Tons ──

export function computeCorrectedTons(visibleTons: number): CorrectedTons {
  if (visibleTons <= 0) {
    return { visibleTons: 0, buriedTons: 0, correctedTotalTons: 0 };
  }
  const correctedTotalTons = +(visibleTons / VISIBLE_FRACTION).toFixed(1);
  const buriedTons = +(correctedTotalTons * BURIED_FRACTION).toFixed(1);
  // Recompute visible from corrected to keep consistent rounding
  const roundedVisible = +(correctedTotalTons * VISIBLE_FRACTION).toFixed(1);
  return { visibleTons: roundedVisible, buriedTons, correctedTotalTons };
}

// ── Haversine distance ──

export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ── Shoreline segmentation ──

/** Divide a polyline into N roughly equal segments. Returns at least 1 segment. */
export function segmentShoreline(polyline: LatLng[], segmentCount: number): ShorelineSegment[] {
  if (polyline.length < 2) {
    // Fallback: single zero-length segment at the only point (or empty)
    const pt = polyline[0] ?? { lat: 0, lng: 0 };
    return [{ index: 0, start: pt, end: pt, midpoint: pt, lengthMeters: 0 }];
  }

  const n = Math.max(1, Math.round(segmentCount));

  // Compute cumulative distances along the polyline
  const cumDist: number[] = [0];
  for (let i = 1; i < polyline.length; i++) {
    cumDist.push(cumDist[i - 1] + haversineMeters(polyline[i - 1], polyline[i]));
  }
  const totalLength = cumDist[cumDist.length - 1];

  if (totalLength === 0) {
    const pt = polyline[0];
    return [{ index: 0, start: pt, end: pt, midpoint: pt, lengthMeters: 0 }];
  }

  // Interpolate a point at a given distance along the polyline
  function interpolate(dist: number): LatLng {
    const d = Math.max(0, Math.min(totalLength, dist));
    for (let i = 1; i < cumDist.length; i++) {
      if (cumDist[i] >= d) {
        const segLen = cumDist[i] - cumDist[i - 1];
        const t = segLen > 0 ? (d - cumDist[i - 1]) / segLen : 0;
        return {
          lat: polyline[i - 1].lat + t * (polyline[i].lat - polyline[i - 1].lat),
          lng: polyline[i - 1].lng + t * (polyline[i].lng - polyline[i - 1].lng),
        };
      }
    }
    return polyline[polyline.length - 1];
  }

  const segLength = totalLength / n;
  const segments: ShorelineSegment[] = [];

  for (let i = 0; i < n; i++) {
    const start = interpolate(i * segLength);
    const end = interpolate((i + 1) * segLength);
    segments.push({
      index: i,
      start,
      end,
      midpoint: { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 },
      lengthMeters: segLength,
    });
  }

  return segments;
}

// ── Distribute tons across segments using heatmap intensity ──

/** Allocate correctedTotalTons to segments proportionally based on heatmap proximity. */
export function distributeTonsToSegments(
  segments: ShorelineSegment[],
  heatmapPoints: Array<{ lat: number; lng: number; intensity: number }>,
  correctedTotalTons: number,
): number[] {
  if (segments.length === 0) return [];

  // For each segment midpoint, compute a weighted score based on nearby heatmap points
  const scores = segments.map(seg => {
    let score = 0;
    for (const pt of heatmapPoints) {
      const dist = haversineMeters(seg.midpoint, pt);
      // Inverse-distance weighting: intensity / (1 + dist/500)
      score += pt.intensity / (1 + dist / 500);
    }
    return Math.max(score, 0.01); // floor to avoid zero
  });

  const totalScore = scores.reduce((s, v) => s + v, 0);
  return scores.map(s => +((s / totalScore) * correctedTotalTons).toFixed(3));
}

// ── Compute segment metrics ──

export interface SegmentMetricsInput {
  segments: ShorelineSegment[];
  tonsPerSegment: number[];
  shoreDepthMeters?: number;
  extractionRateTonsPerPersonPerDay?: number;
  hoursPerDay?: number;
}

export function computeSegmentMetrics(input: SegmentMetricsInput): Omit<SegmentMetrics, 'category'>[] {
  const {
    segments,
    tonsPerSegment,
    shoreDepthMeters = SHORE_DEPTH_METERS,
    extractionRateTonsPerPersonPerDay = EXTRACTION_RATE_TONS_PER_PERSON_PER_DAY,
    hoursPerDay = HOURS_PER_DAY,
  } = input;

  const ratePerHour = extractionRateTonsPerPersonPerDay / hoursPerDay;

  return segments.map((seg, i) => {
    const tons = tonsPerSegment[i] ?? 0;
    const areaM2 = seg.lengthMeters * shoreDepthMeters;
    const weightKgPerM2 = areaM2 > 0 ? +((tons * KG_PER_TON) / areaM2).toFixed(2) : 0;
    const personHours = ratePerHour > 0 ? Math.ceil(tons / ratePerHour) : 0;

    return {
      index: seg.index,
      start: seg.start,
      end: seg.end,
      midpoint: seg.midpoint,
      lengthMeters: seg.lengthMeters,
      areaM2: +areaM2.toFixed(1),
      plasticTons: +tons.toFixed(2),
      weightKgPerM2,
      personHours,
    };
  });
}

// ── Categorize by density (percentile-based thresholds) ──

/**
 * Percentile-based categorization:
 * - green (low):   <= 33rd percentile weightPerM2
 * - yellow (medium): > 33rd and <= 66th percentile
 * - red (high):    > 66th percentile
 */
export function categorizeSegmentsByDensity(
  metrics: Omit<SegmentMetrics, 'category'>[],
): SegmentMetrics[] {
  if (metrics.length === 0) return [];

  const sorted = [...metrics.map(m => m.weightKgPerM2)].sort((a, b) => a - b);
  const p33 = sorted[Math.floor(sorted.length * 0.33)] ?? 0;
  const p66 = sorted[Math.floor(sorted.length * 0.66)] ?? 0;

  return metrics.map(m => {
    let category: DensityCategory;
    if (m.weightKgPerM2 <= p33) category = 'green';
    else if (m.weightKgPerM2 <= p66) category = 'yellow';
    else category = 'red';
    return { ...m, category };
  });
}

// ── Buffer polygon generation for shoreline bands ──

/**
 * Offset a point by a given distance (meters) along a bearing (radians from north).
 * Uses a flat-earth approximation suitable for small distances (<1 km).
 */
export function offsetPoint(pt: LatLng, bearingRad: number, distMeters: number): LatLng {
  const R = 6_371_000;
  const dLat = (distMeters * Math.cos(bearingRad)) / R;
  const dLng = (distMeters * Math.sin(bearingRad)) / (R * Math.cos((pt.lat * Math.PI) / 180));
  return {
    lat: pt.lat + (dLat * 180) / Math.PI,
    lng: pt.lng + (dLng * 180) / Math.PI,
  };
}

/**
 * Compute the bearing (radians, clockwise from north) from point a to point b.
 */
export function bearing(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLng);
  return Math.atan2(y, x);
}

export interface BandPolygon {
  index: number;
  category: DensityCategory;
  coords: [LatLng, LatLng, LatLng, LatLng]; // quad: startL, endL, endR, startR
  plasticTons: number;
  weightKgPerM2: number;
  personHours: number;
}

/**
 * Generate a buffered quad polygon for a shoreline segment.
 * Creates a narrow band of `bandWidthMeters` centered on the segment line
 * by offsetting perpendicular to the segment direction.
 */
export function bufferSegmentToPolygon(
  seg: SegmentMetrics,
  bandWidthMeters: number,
): BandPolygon {
  const halfWidth = bandWidthMeters / 2;
  const segBearing = bearing(seg.start, seg.end);
  // Perpendicular bearings (left = -90°, right = +90°)
  const leftBearing = segBearing - Math.PI / 2;
  const rightBearing = segBearing + Math.PI / 2;

  const startL = offsetPoint(seg.start, leftBearing, halfWidth);
  const startR = offsetPoint(seg.start, rightBearing, halfWidth);
  const endL = offsetPoint(seg.end, leftBearing, halfWidth);
  const endR = offsetPoint(seg.end, rightBearing, halfWidth);

  return {
    index: seg.index,
    category: seg.category,
    coords: [startL, endL, endR, startR],
    plasticTons: seg.plasticTons,
    weightKgPerM2: seg.weightKgPerM2,
    personHours: seg.personHours,
  };
}

// ── Ship access point selection ──

export interface ShipAccessPointInput {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'DOCK' | 'BEACH_ACCESS';
}

/**
 * Select the best ship access point: the one closest to the highest-density
 * segment midpoint. If no segments, returns the first access point.
 */
export function selectBestShipAccessPoint(
  accessPoints: ShipAccessPointInput[],
  segments: SegmentMetrics[],
): ShipAccessPointInput | null {
  if (accessPoints.length === 0) return null;
  if (segments.length === 0) return accessPoints[0];

  // Find the segment with the highest density
  let maxSeg = segments[0];
  for (const seg of segments) {
    if (seg.weightKgPerM2 > maxSeg.weightKgPerM2) maxSeg = seg;
  }

  // Find the access point closest to that segment's midpoint
  let best = accessPoints[0];
  let bestDist = haversineMeters(best, maxSeg.midpoint);
  for (let i = 1; i < accessPoints.length; i++) {
    const d = haversineMeters(accessPoints[i], maxSeg.midpoint);
    if (d < bestDist) {
      best = accessPoints[i];
      bestDist = d;
    }
  }
  return best;
}

// ── Extract sub-polylines that follow actual shoreline vertices ──

/**
 * For each of N segments, extract the sub-polyline from the original shoreline
 * that includes all intermediate original vertices (not just interpolated endpoints).
 * This guarantees the rendered path follows the actual coastline curve.
 */
export function extractSegmentPaths(polyline: LatLng[], segmentCount: number): LatLng[][] {
  if (polyline.length < 2) {
    return [[polyline[0] ?? { lat: 0, lng: 0 }]];
  }

  const n = Math.max(1, Math.round(segmentCount));

  // Compute cumulative distances along the polyline
  const cumDist: number[] = [0];
  for (let i = 1; i < polyline.length; i++) {
    cumDist.push(cumDist[i - 1] + haversineMeters(polyline[i - 1], polyline[i]));
  }
  const totalLength = cumDist[cumDist.length - 1];
  if (totalLength === 0) return [[polyline[0]]];

  function interpolate(dist: number): LatLng {
    const d = Math.max(0, Math.min(totalLength, dist));
    for (let i = 1; i < cumDist.length; i++) {
      if (cumDist[i] >= d) {
        const segLen = cumDist[i] - cumDist[i - 1];
        const t = segLen > 0 ? (d - cumDist[i - 1]) / segLen : 0;
        return {
          lat: polyline[i - 1].lat + t * (polyline[i].lat - polyline[i - 1].lat),
          lng: polyline[i - 1].lng + t * (polyline[i].lng - polyline[i - 1].lng),
        };
      }
    }
    return polyline[polyline.length - 1];
  }

  const segLength = totalLength / n;
  const paths: LatLng[][] = [];

  for (let s = 0; s < n; s++) {
    const startDist = s * segLength;
    const endDist = (s + 1) * segLength;

    const path: LatLng[] = [interpolate(startDist)];

    // Include all original polyline vertices that fall strictly between startDist and endDist
    for (let i = 1; i < polyline.length; i++) {
      if (cumDist[i] > startDist && cumDist[i] < endDist) {
        path.push(polyline[i]);
      }
    }

    path.push(interpolate(endDist));
    paths.push(path);
  }

  return paths;
}

// ── High-level convenience: full pipeline for a mission ──

export function analyzeMissionShoreline(
  shoreline: LatLng[],
  heatmapPoints: Array<{ lat: number; lng: number; intensity: number }>,
  visibleTons: number,
  segmentCount = 10,
): { corrected: CorrectedTons; segments: SegmentMetrics[] } {
  const corrected = computeCorrectedTons(visibleTons);
  const rawSegments = segmentShoreline(shoreline, segmentCount);
  const tonsPerSegment = distributeTonsToSegments(rawSegments, heatmapPoints, corrected.correctedTotalTons);
  const rawMetrics = computeSegmentMetrics({ segments: rawSegments, tonsPerSegment });
  const segments = categorizeSegmentsByDensity(rawMetrics);
  return { corrected, segments };
}
