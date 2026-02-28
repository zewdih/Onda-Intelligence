import { describe, it, expect } from 'vitest';
import { computeResources, getHighestPlasticZone, deriveDurationDays } from '../utils/missionCalculator';
import { groupMissionsByPriority } from '../data/missions';
import type { Mission } from '../types/mission';

describe('computeResources', () => {
  it('computes basic scenario correctly', () => {
    const result = computeResources({
      totalPlasticTons: 100,
      extractionRatePerPersonPerDay: 0.05,
      peoplePerShip: 12,
      durationDays: 10,
    });
    // people = ceil(100 / (0.05 * 10)) = ceil(200) = 200
    // ships  = ceil(200 / 12) = ceil(16.67) = 17
    expect(result.valid).toBe(true);
    expect(result.peopleRequired).toBe(200);
    expect(result.shipsRequired).toBe(17);
  });

  it('returns zero for 0 tons', () => {
    const result = computeResources({
      totalPlasticTons: 0,
      extractionRatePerPersonPerDay: 0.05,
      peoplePerShip: 12,
      durationDays: 10,
    });
    expect(result.valid).toBe(true);
    expect(result.peopleRequired).toBe(0);
    expect(result.shipsRequired).toBe(0);
  });

  it('handles very small tons (rounds up)', () => {
    const result = computeResources({
      totalPlasticTons: 0.001,
      extractionRatePerPersonPerDay: 0.05,
      peoplePerShip: 12,
      durationDays: 7,
    });
    // people = ceil(0.001 / (0.05 * 7)) = ceil(0.00286) = 1
    // ships  = ceil(1 / 12) = 1
    expect(result.valid).toBe(true);
    expect(result.peopleRequired).toBe(1);
    expect(result.shipsRequired).toBe(1);
  });

  it('returns invalid for negative tons', () => {
    const result = computeResources({
      totalPlasticTons: -10,
      extractionRatePerPersonPerDay: 0.05,
      peoplePerShip: 12,
      durationDays: 7,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns invalid for negative rate', () => {
    const result = computeResources({
      totalPlasticTons: 10,
      extractionRatePerPersonPerDay: -1,
      peoplePerShip: 12,
      durationDays: 7,
    });
    expect(result.valid).toBe(false);
  });

  it('returns invalid for zero duration with non-zero tons', () => {
    const result = computeResources({
      totalPlasticTons: 50,
      extractionRatePerPersonPerDay: 0.05,
      peoplePerShip: 12,
      durationDays: 0,
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns invalid for zero extraction rate with non-zero tons', () => {
    const result = computeResources({
      totalPlasticTons: 50,
      extractionRatePerPersonPerDay: 0,
      peoplePerShip: 12,
      durationDays: 7,
    });
    expect(result.valid).toBe(false);
  });

  it('handles exact division without extra rounding', () => {
    const result = computeResources({
      totalPlasticTons: 12,
      extractionRatePerPersonPerDay: 1,
      peoplePerShip: 6,
      durationDays: 1,
    });
    // people = ceil(12 / 1) = 12, ships = ceil(12 / 6) = 2
    expect(result.peopleRequired).toBe(12);
    expect(result.shipsRequired).toBe(2);
  });
});

describe('getHighestPlasticZone', () => {
  it('returns the zone with the most tons', () => {
    const zones = [
      { id: 'a', name: 'Zone A', estimatedTons: 10 },
      { id: 'b', name: 'Zone B', estimatedTons: 50 },
      { id: 'c', name: 'Zone C', estimatedTons: 30 },
    ];
    expect(getHighestPlasticZone(zones)?.id).toBe('b');
  });

  it('returns null for empty array', () => {
    expect(getHighestPlasticZone([])).toBeNull();
  });
});

describe('deriveDurationDays', () => {
  it('computes days between two dates', () => {
    expect(deriveDurationDays('2026-02-10T00:00:00Z', '2026-03-15T00:00:00Z')).toBe(33);
  });

  it('defaults to 7 when no end date', () => {
    expect(deriveDurationDays('2026-06-01T00:00:00Z')).toBe(7);
  });

  it('defaults to 7 when end is before start', () => {
    expect(deriveDurationDays('2026-06-10T00:00:00Z', '2026-06-01T00:00:00Z')).toBe(7);
  });
});

describe('groupMissionsByPriority', () => {
  const makeMission = (id: string, priority: Mission['priority']): Mission => ({
    id, name: id, priority, status: 'ONGOING', startDate: '2026-01-01T00:00:00Z',
    location: { name: 'Test', lat: 0, lng: 0 }, estimatedPlasticTons: 10,
    estimatedItems: 12000, zones: [], heatmapPoints: [], shoreline: [],
    shorelineBandWidthMeters: 60, shipAccessPoints: [],
  });

  it('groups missions into HIGH, MEDIUM, LOW buckets', () => {
    const missions = [
      makeMission('a', 'HIGH'),
      makeMission('b', 'LOW'),
      makeMission('c', 'MEDIUM'),
      makeMission('d', 'HIGH'),
    ];
    const result = groupMissionsByPriority(missions);
    expect(result.HIGH.map(m => m.id)).toEqual(['a', 'd']);
    expect(result.MEDIUM.map(m => m.id)).toEqual(['c']);
    expect(result.LOW.map(m => m.id)).toEqual(['b']);
  });

  it('returns empty arrays when no missions', () => {
    const result = groupMissionsByPriority([]);
    expect(result.HIGH).toEqual([]);
    expect(result.MEDIUM).toEqual([]);
    expect(result.LOW).toEqual([]);
  });

  it('handles all missions in one priority', () => {
    const missions = [makeMission('x', 'MEDIUM'), makeMission('y', 'MEDIUM')];
    const result = groupMissionsByPriority(missions);
    expect(result.HIGH).toHaveLength(0);
    expect(result.MEDIUM).toHaveLength(2);
    expect(result.LOW).toHaveLength(0);
  });
});
