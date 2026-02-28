import { describe, it, expect } from 'vitest';
import {
  computeCorrectedTons,
  haversineMeters,
  segmentShoreline,
  computeSegmentMetrics,
  categorizeSegmentsByDensity,
  analyzeMissionShoreline,
  extractSegmentPaths,
  bufferSegmentToPolygon,
  selectBestShipAccessPoint,
  EXTRACTION_RATE_TONS_PER_PERSON_PER_DAY,
  HOURS_PER_DAY,
} from '../utils/shorelineAnalytics';
import type { SegmentMetrics, ShipAccessPointInput } from '../utils/shorelineAnalytics';

describe('computeCorrectedTons', () => {
  it('computes corrected total from visible tons (320 => 800 total, 480 buried)', () => {
    const result = computeCorrectedTons(320);
    expect(result.correctedTotalTons).toBe(800);
    expect(result.buriedTons).toBe(480);
    expect(result.visibleTons).toBe(320);
  });

  it('returns zeros for zero input', () => {
    const result = computeCorrectedTons(0);
    expect(result.correctedTotalTons).toBe(0);
    expect(result.buriedTons).toBe(0);
    expect(result.visibleTons).toBe(0);
  });

  it('returns zeros for negative input', () => {
    const result = computeCorrectedTons(-10);
    expect(result.correctedTotalTons).toBe(0);
  });

  it('maintains visible + buried = corrected total', () => {
    const result = computeCorrectedTons(100);
    expect(result.visibleTons + result.buriedTons).toBeCloseTo(result.correctedTotalTons, 0);
  });

  it('handles fractional visible tons with rounding', () => {
    const result = computeCorrectedTons(1.3);
    // 1.3 / 0.4 = 3.25 => 3.3 (toFixed(1))
    expect(result.correctedTotalTons).toBe(3.3);
    // buried = 3.3 * 0.6 = 1.98 => 2.0
    expect(result.buriedTons).toBe(2);
    // visible = 3.3 * 0.4 = 1.32 => 1.3
    expect(result.visibleTons).toBe(1.3);
  });
});

describe('haversineMeters', () => {
  it('returns 0 for same point', () => {
    expect(haversineMeters({ lat: 14.71, lng: -17.43 }, { lat: 14.71, lng: -17.43 })).toBe(0);
  });

  it('computes a reasonable distance between two close points', () => {
    const d = haversineMeters({ lat: 14.710, lng: -17.430 }, { lat: 14.715, lng: -17.420 });
    // ~1.2 km — sanity check it's in the right ballpark
    expect(d).toBeGreaterThan(800);
    expect(d).toBeLessThan(2000);
  });
});

describe('segmentShoreline', () => {
  const polyline = [
    { lat: 0, lng: 0 },
    { lat: 0, lng: 1 },
    { lat: 0, lng: 2 },
  ];

  it('divides a polyline into requested segments', () => {
    const segs = segmentShoreline(polyline, 4);
    expect(segs).toHaveLength(4);
    // All segments should have equal length
    const len = segs[0].lengthMeters;
    for (const seg of segs) {
      expect(seg.lengthMeters).toBeCloseTo(len, 1);
    }
  });

  it('returns 1 segment for single-point polyline', () => {
    const segs = segmentShoreline([{ lat: 0, lng: 0 }], 5);
    expect(segs).toHaveLength(1);
    expect(segs[0].lengthMeters).toBe(0);
  });

  it('returns at least 1 segment for 0 requested', () => {
    const segs = segmentShoreline(polyline, 0);
    expect(segs.length).toBeGreaterThanOrEqual(1);
  });

  it('start of first segment matches first polyline point', () => {
    const segs = segmentShoreline(polyline, 3);
    expect(segs[0].start.lat).toBeCloseTo(0, 5);
    expect(segs[0].start.lng).toBeCloseTo(0, 5);
  });
});

describe('computeSegmentMetrics', () => {
  it('computes area and person-hours correctly', () => {
    const segments = [
      { index: 0, start: { lat: 0, lng: 0 }, end: { lat: 0, lng: 0.01 }, midpoint: { lat: 0, lng: 0.005 }, lengthMeters: 100 },
    ];
    const tonsPerSegment = [5];
    const result = computeSegmentMetrics({ segments, tonsPerSegment });

    // area = 100 * 30 = 3000 m²
    expect(result[0].areaM2).toBeCloseTo(3000, 0);

    // weightKgPerM2 = (5 * 1000) / 3000 = 1.67
    expect(result[0].weightKgPerM2).toBeCloseTo(1.67, 1);

    // personHours = ceil(5 / (0.05/8)) = ceil(5 / 0.00625) = ceil(800) = 800
    const ratePerHour = EXTRACTION_RATE_TONS_PER_PERSON_PER_DAY / HOURS_PER_DAY;
    const expected = Math.ceil(5 / ratePerHour);
    expect(result[0].personHours).toBe(expected);
  });

  it('returns 0 values for 0 tons', () => {
    const segments = [
      { index: 0, start: { lat: 0, lng: 0 }, end: { lat: 0, lng: 0.01 }, midpoint: { lat: 0, lng: 0.005 }, lengthMeters: 100 },
    ];
    const result = computeSegmentMetrics({ segments, tonsPerSegment: [0] });
    expect(result[0].weightKgPerM2).toBe(0);
    expect(result[0].personHours).toBe(0);
  });
});

describe('categorizeSegmentsByDensity', () => {
  it('assigns green, yellow, and red categories for varied densities', () => {
    const metrics = [
      { index: 0, start: { lat: 0, lng: 0 }, end: { lat: 0, lng: 1 }, midpoint: { lat: 0, lng: 0.5 }, lengthMeters: 100, areaM2: 3000, plasticTons: 1, weightKgPerM2: 0.1, personHours: 10 },
      { index: 1, start: { lat: 0, lng: 1 }, end: { lat: 0, lng: 2 }, midpoint: { lat: 0, lng: 1.5 }, lengthMeters: 100, areaM2: 3000, plasticTons: 5, weightKgPerM2: 1.0, personHours: 50 },
      { index: 2, start: { lat: 0, lng: 2 }, end: { lat: 0, lng: 3 }, midpoint: { lat: 0, lng: 2.5 }, lengthMeters: 100, areaM2: 3000, plasticTons: 20, weightKgPerM2: 5.0, personHours: 200 },
      { index: 3, start: { lat: 0, lng: 3 }, end: { lat: 0, lng: 4 }, midpoint: { lat: 0, lng: 3.5 }, lengthMeters: 100, areaM2: 3000, plasticTons: 0.5, weightKgPerM2: 0.05, personHours: 5 },
      { index: 4, start: { lat: 0, lng: 4 }, end: { lat: 0, lng: 5 }, midpoint: { lat: 0, lng: 4.5 }, lengthMeters: 100, areaM2: 3000, plasticTons: 10, weightKgPerM2: 2.0, personHours: 100 },
      { index: 5, start: { lat: 0, lng: 5 }, end: { lat: 0, lng: 6 }, midpoint: { lat: 0, lng: 5.5 }, lengthMeters: 100, areaM2: 3000, plasticTons: 25, weightKgPerM2: 8.0, personHours: 250 },
    ];

    const result = categorizeSegmentsByDensity(metrics);
    const categories = new Set(result.map(r => r.category));
    expect(categories.has('green')).toBe(true);
    expect(categories.has('yellow')).toBe(true);
    expect(categories.has('red')).toBe(true);
  });

  it('returns empty array for empty input', () => {
    expect(categorizeSegmentsByDensity([])).toEqual([]);
  });
});

describe('extractSegmentPaths', () => {
  it('preserves all intermediate shoreline vertices within each segment path', () => {
    // A curved polyline with 5 points — split into 2 segments
    const polyline = [
      { lat: 0, lng: 0 },
      { lat: 0.001, lng: 0.002 },
      { lat: 0.003, lng: 0.003 },
      { lat: 0.004, lng: 0.001 },
      { lat: 0.005, lng: 0 },
    ];
    const paths = extractSegmentPaths(polyline, 2);
    expect(paths).toHaveLength(2);

    // Each path should have MORE than 2 points (includes intermediate vertices)
    const totalPoints = paths[0].length + paths[1].length;
    // With 5 original vertices split into 2 segments, we expect intermediate
    // vertices to be included (not just interpolated start/end)
    expect(totalPoints).toBeGreaterThan(4);
  });

  it('first path starts at first polyline point', () => {
    const polyline = [
      { lat: 10, lng: 20 },
      { lat: 10.01, lng: 20.01 },
      { lat: 10.02, lng: 20.02 },
    ];
    const paths = extractSegmentPaths(polyline, 2);
    expect(paths[0][0].lat).toBeCloseTo(10, 4);
    expect(paths[0][0].lng).toBeCloseTo(20, 4);
  });

  it('last path ends at last polyline point', () => {
    const polyline = [
      { lat: 10, lng: 20 },
      { lat: 10.01, lng: 20.01 },
      { lat: 10.02, lng: 20.02 },
    ];
    const paths = extractSegmentPaths(polyline, 2);
    const lastPath = paths[paths.length - 1];
    const lastPt = lastPath[lastPath.length - 1];
    expect(lastPt.lat).toBeCloseTo(10.02, 4);
    expect(lastPt.lng).toBeCloseTo(20.02, 4);
  });

  it('returns single-point array for single-point polyline', () => {
    const paths = extractSegmentPaths([{ lat: 5, lng: 10 }], 3);
    expect(paths).toHaveLength(1);
    expect(paths[0]).toHaveLength(1);
  });

  it('number of paths equals segment count', () => {
    const polyline = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 0, lng: 2 },
      { lat: 0, lng: 3 },
    ];
    const paths = extractSegmentPaths(polyline, 6);
    expect(paths).toHaveLength(6);
    // Every path should have at least 2 points (start, end)
    for (const path of paths) {
      expect(path.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('bufferSegmentToPolygon', () => {
  it('produces a 4-point polygon centered on the segment', () => {
    const seg: SegmentMetrics = {
      index: 0,
      start: { lat: 0, lng: 0 },
      end: { lat: 0, lng: 0.001 },
      midpoint: { lat: 0, lng: 0.0005 },
      lengthMeters: 111,
      areaM2: 3330,
      plasticTons: 5,
      weightKgPerM2: 1.5,
      personHours: 100,
      category: 'red',
    };
    const band = bufferSegmentToPolygon(seg, 60);
    expect(band.coords).toHaveLength(4);
    expect(band.category).toBe('red');
    // The polygon should have points offset north and south of the equator
    // (since segment runs east-west, perpendicular is north-south)
    const lats = band.coords.map(c => c.lat);
    expect(Math.max(...lats)).toBeGreaterThan(0);
    expect(Math.min(...lats)).toBeLessThan(0);
  });

  it('preserves segment metrics in the band', () => {
    const seg: SegmentMetrics = {
      index: 3,
      start: { lat: 14.71, lng: -17.43 },
      end: { lat: 14.715, lng: -17.425 },
      midpoint: { lat: 14.7125, lng: -17.4275 },
      lengthMeters: 700,
      areaM2: 21000,
      plasticTons: 12.5,
      weightKgPerM2: 0.6,
      personHours: 50,
      category: 'green',
    };
    const band = bufferSegmentToPolygon(seg, 60);
    expect(band.index).toBe(3);
    expect(band.plasticTons).toBe(12.5);
    expect(band.weightKgPerM2).toBe(0.6);
    expect(band.personHours).toBe(50);
    expect(band.category).toBe('green');
  });
});

describe('selectBestShipAccessPoint', () => {
  const makeSegment = (index: number, lat: number, lng: number, density: number): SegmentMetrics => ({
    index,
    start: { lat, lng },
    end: { lat: lat + 0.001, lng: lng + 0.001 },
    midpoint: { lat: lat + 0.0005, lng: lng + 0.0005 },
    lengthMeters: 150,
    areaM2: 4500,
    plasticTons: 10,
    weightKgPerM2: density,
    personHours: 100,
    category: density > 3 ? 'red' : density > 1 ? 'yellow' : 'green',
  });

  it('selects the access point closest to the highest-density segment', () => {
    const segments = [
      makeSegment(0, 0, 0, 1.0),      // green, at (0,0)
      makeSegment(1, 1, 1, 5.0),      // red, at (1,1) — highest density
      makeSegment(2, 2, 2, 2.0),      // yellow, at (2,2)
    ];
    const accessPoints: ShipAccessPointInput[] = [
      { id: 'a', name: 'Far Dock', lat: 0, lng: 0, type: 'DOCK' },
      { id: 'b', name: 'Near Dock', lat: 1.001, lng: 1.001, type: 'DOCK' },
    ];
    const best = selectBestShipAccessPoint(accessPoints, segments);
    expect(best?.id).toBe('b'); // closest to segment 1 midpoint (~1.0005, 1.0005)
  });

  it('returns first access point when no segments', () => {
    const accessPoints: ShipAccessPointInput[] = [
      { id: 'a', name: 'Dock A', lat: 0, lng: 0, type: 'DOCK' },
      { id: 'b', name: 'Dock B', lat: 1, lng: 1, type: 'DOCK' },
    ];
    const best = selectBestShipAccessPoint(accessPoints, []);
    expect(best?.id).toBe('a');
  });

  it('returns null when no access points', () => {
    const segments = [makeSegment(0, 0, 0, 5.0)];
    expect(selectBestShipAccessPoint([], segments)).toBeNull();
  });

  it('picks the single access point when only one exists', () => {
    const segments = [makeSegment(0, 10, 20, 8.0)];
    const accessPoints: ShipAccessPointInput[] = [{ id: 'only', name: 'Only Dock', lat: 50, lng: 50, type: 'DOCK' }];
    const best = selectBestShipAccessPoint(accessPoints, segments);
    expect(best?.id).toBe('only');
  });
});

describe('analyzeMissionShoreline (integration)', () => {
  it('returns corrected tons and categorized segments', () => {
    const shoreline = [
      { lat: 14.700, lng: -17.435 },
      { lat: 14.710, lng: -17.422 },
      { lat: 14.725, lng: -17.425 },
      { lat: 14.738, lng: -17.440 },
      { lat: 14.765, lng: -17.468 },
    ];
    const heatmap = [
      { lat: 14.710, lng: -17.425, intensity: 0.95 },
      { lat: 14.735, lng: -17.450, intensity: 0.35 },
    ];

    const result = analyzeMissionShoreline(shoreline, heatmap, 320, 5);
    expect(result.corrected.correctedTotalTons).toBe(800);
    expect(result.segments).toHaveLength(5);
    // Every segment should have a valid category
    for (const seg of result.segments) {
      expect(['green', 'yellow', 'red']).toContain(seg.category);
    }
    // Total allocated tons should sum close to corrected total
    const totalAllocated = result.segments.reduce((s, seg) => s + seg.plasticTons, 0);
    expect(totalAllocated).toBeCloseTo(800, 0);
  });
});
