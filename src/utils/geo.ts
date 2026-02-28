// Geo utilities for beach proximity and map bounds.

import type { Beach } from '../types/domain';

/** Haversine distance in km between two lat/lon points. */
export function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Find nearest N beaches to a given beach (excluding itself). */
export function nearestBeaches(target: Beach, allBeaches: Beach[], n: number = 3): Beach[] {
  return allBeaches
    .filter(b => b.id !== target.id)
    .map(b => ({ beach: b, dist: haversineKm(target.location, b.location) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, n)
    .map(x => x.beach);
}

/** Compute bounding box for a set of beaches with padding. */
export function computeBounds(
  beaches: Beach[],
  paddingDeg: number = 0.01,
): { southWest: [number, number]; northEast: [number, number] } {
  if (beaches.length === 0) {
    return { southWest: [0, 0], northEast: [0, 0] };
  }
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  for (const b of beaches) {
    minLat = Math.min(minLat, b.location.lat);
    maxLat = Math.max(maxLat, b.location.lat);
    minLon = Math.min(minLon, b.location.lon);
    maxLon = Math.max(maxLon, b.location.lon);
  }
  return {
    southWest: [minLat - paddingDeg, minLon - paddingDeg],
    northEast: [maxLat + paddingDeg, maxLon + paddingDeg],
  };
}
