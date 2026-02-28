import { IMPACT_CONSTANTS } from '../config/impactConstants';

export interface ImpactEquivalents {
  trashTonsReduced: number;
  trashReductionPct: number;
  scorePtsImproved: number;
  beachCount: number;
  confidence: 'low' | 'medium' | 'high';
  pickupTruckLoads: number;
  trashBags: number;
  volunteerHoursSaved: number;
  animalsProtected: number;
  footballFields: number;
  plainEnglishSummary: string;
  wildlifeBlurb: string;
  methodologyNote: string;
}

export function computeDistrictImpactEquivalents(
  trashTonsReduced: number,
  trashReductionPct: number,
  scorePtsImproved: number,
  beachCount: number,
  confidence: 'low' | 'medium' | 'high',
): ImpactEquivalents {
  const c = IMPACT_CONSTANTS;

  const pickupTruckLoads = Math.round(trashTonsReduced / c.TONS_PER_PICKUP_TRUCK_LOAD);
  const trashBags = Math.round(trashTonsReduced * c.TRASH_BAGS_PER_TON);
  const volunteerHoursSaved = Math.round(trashTonsReduced * c.VOLUNTEER_HOURS_PER_TON_CLEANUP);
  const animalsProtected = Math.round(trashTonsReduced * c.ANIMALS_PROTECTED_PER_TON);
  const footballFields = +(trashTonsReduced * c.FOOTBALL_FIELDS_PER_TON).toFixed(1);

  const plainEnglishSummary =
    beachCount === 0
      ? 'All beaches are in good shape — no immediate action needed.'
      : `By supporting ${beachCount} priority beach${beachCount !== 1 ? 'es' : ''} over the next 30 days, ` +
        `your district could prevent roughly ${trashTonsReduced.toFixed(1)} tons of ocean trash — ` +
        `that's about ${pickupTruckLoads} pickup truck${pickupTruckLoads !== 1 ? 's' : ''} worth of waste ` +
        `kept out of the water.`;

  const wildlifeBlurb =
    animalsProtected > 0
      ? `This reduction could directly protect an estimated ${animalsProtected} marine animal${animalsProtected !== 1 ? 's' : ''} ` +
        `from ingestion, entanglement, or habitat disruption.`
      : 'Every bit of trash removed helps protect marine life.';

  const methodologyNote =
    'Projections use beach pollution scores, plan coverage, policy gap analysis, and ' +
    'configurable conversion constants (e.g. volunteer-hours per ton, animals protected per ton). ' +
    'These are placeholder estimates for demonstration — replace with verified regional data before production use.';

  return {
    trashTonsReduced,
    trashReductionPct,
    scorePtsImproved,
    beachCount,
    confidence,
    pickupTruckLoads,
    trashBags,
    volunteerHoursSaved,
    animalsProtected,
    footballFields,
    plainEnglishSummary,
    wildlifeBlurb,
    methodologyNote,
  };
}
