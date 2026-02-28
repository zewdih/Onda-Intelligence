export interface CalculatorInput {
  totalPlasticTons: number;
  extractionRatePerPersonPerDay: number; // tons/person/day
  peoplePerShip: number;
  durationDays: number;
}

export interface CalculatorResult {
  peopleRequired: number;
  shipsRequired: number;
  valid: boolean;
  error?: string;
}

export function computeResources(input: CalculatorInput): CalculatorResult {
  const { totalPlasticTons, extractionRatePerPersonPerDay, peoplePerShip, durationDays } = input;

  if (totalPlasticTons < 0 || extractionRatePerPersonPerDay < 0 || peoplePerShip < 0 || durationDays < 0) {
    return { peopleRequired: 0, shipsRequired: 0, valid: false, error: 'Inputs must be non-negative.' };
  }

  if (totalPlasticTons === 0) {
    return { peopleRequired: 0, shipsRequired: 0, valid: true };
  }

  if (extractionRatePerPersonPerDay === 0 || durationDays === 0) {
    return { peopleRequired: 0, shipsRequired: 0, valid: false, error: 'Extraction rate and duration must be greater than zero.' };
  }

  if (peoplePerShip === 0) {
    return { peopleRequired: 0, shipsRequired: 0, valid: false, error: 'People per ship must be greater than zero.' };
  }

  const peopleRequired = Math.ceil(totalPlasticTons / (extractionRatePerPersonPerDay * durationDays));
  const shipsRequired = Math.ceil(peopleRequired / peoplePerShip);

  return { peopleRequired, shipsRequired, valid: true };
}

export function getHighestPlasticZone(zones: Array<{ id: string; name: string; estimatedTons: number }>) {
  if (zones.length === 0) return null;
  return zones.reduce((max, z) => (z.estimatedTons > max.estimatedTons ? z : max), zones[0]);
}

export function deriveDurationDays(startDate: string, endDate?: string): number {
  if (!endDate) return 7;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 7;
}
