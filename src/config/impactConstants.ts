// ── Impact Conversion Constants ──
// These are placeholder estimates for the hackathon MVP.
// Replace with verified, region-specific data before production use.

export const IMPACT_CONSTANTS = {
  /** Average weight of a full pickup truck load of beach trash (tons) */
  TONS_PER_PICKUP_TRUCK_LOAD: 0.5,

  /** Average number of standard trash bags that fill 1 ton */
  TRASH_BAGS_PER_TON: 80,

  /** Average volunteer-hours to clean up 1 ton of beach trash */
  VOLUNTEER_HOURS_PER_TON_CLEANUP: 120,

  /** Estimated marine animals directly protected per ton of trash removed */
  ANIMALS_PROTECTED_PER_TON: 25,

  /** Approximate football fields of shoreline kept clean per ton removed */
  FOOTBALL_FIELDS_PER_TON: 1.5,

  /** Confidence display thresholds */
  CONFIDENCE_THRESHOLDS: {
    HIGH: 0.7,
    MEDIUM: 0.4,
  },
} as const;

export type ImpactConstants = typeof IMPACT_CONSTANTS;
