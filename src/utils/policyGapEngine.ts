// Policy Gap Engine: analyzes beach compliance vs policy requirements.
// Tomorrow: replace mock compliance scores with real audit/sensor data.

import type { BeachComplianceSnapshot, PolicySet, PolicyItem, Signals, BeachType } from '../types/domain';

export interface PolicyGapResult {
  missingPolicyItemIds: string[];
  highestPriorityItemIds: string[];
  notes: string[];
}

const COMPLIANCE_THRESHOLD = 0.6;

// Beach type → which policy categories matter most
const TYPE_PRIORITY_BOOST: Record<BeachType, string[]> = {
  urban: ['Waste Infrastructure', 'Enforcement'],
  tourist: ['Vendor Compliance', 'Community Programs'],
  remote: ['Monitoring', 'Community Programs'],
  harbor: ['Waste Infrastructure', 'Enforcement'],
  river_mouth: ['Waste Infrastructure', 'Monitoring'],
};

function priorityScore(
  item: PolicyItem,
  score: number,
  beachType: BeachType,
  signals: Signals,
): number {
  let priority = 0;

  // Lower compliance = higher priority
  priority += (1 - score) * 40;

  // Severity weight
  if (item.severityIfMissing === 'high') priority += 30;
  else if (item.severityIfMissing === 'medium') priority += 15;
  else priority += 5;

  // Beach type category boost
  if (TYPE_PRIORITY_BOOST[beachType]?.includes(item.category)) {
    priority += 15;
  }

  // Signal-based boosts
  if (item.category === 'Vendor Compliance' && signals.proximityToVendorsIndex > 0.6) {
    priority += 10;
  }
  if (item.category === 'Waste Infrastructure' && signals.riverProximityIndex > 0.5) {
    priority += 10;
  }
  if (item.category === 'Community Programs' && signals.footTrafficIndex > 0.7) {
    priority += 8;
  }

  return priority;
}

export function computePolicyGaps(
  compliance: BeachComplianceSnapshot,
  policySet: PolicySet,
  signals: Signals,
  beachType: BeachType,
): PolicyGapResult {
  const missing: { item: PolicyItem; score: number; priority: number }[] = [];

  for (const item of policySet.items) {
    const score = compliance.itemScores[item.id] ?? 0;
    if (score < COMPLIANCE_THRESHOLD) {
      missing.push({
        item,
        score,
        priority: priorityScore(item, score, beachType, signals),
      });
    }
  }

  // Sort by priority descending
  missing.sort((a, b) => b.priority - a.priority);

  const missingIds = missing.map(m => m.item.id);
  const topIds = missing.slice(0, 5).map(m => m.item.id);

  // Generate supportive notes
  const notes: string[] = [];
  if (missing.length === 0) {
    notes.push('Great news — this beach meets all policy requirements! Keep up the excellent work.');
  } else {
    const highCount = missing.filter(m => m.item.severityIfMissing === 'high').length;
    if (highCount > 0) {
      notes.push(`${highCount} high-priority policy ${highCount === 1 ? 'item needs' : 'items need'} attention — addressing ${highCount === 1 ? 'it' : 'these'} first will have the biggest impact.`);
    }

    const categories = [...new Set(missing.slice(0, 3).map(m => m.item.category))];
    if (categories.length > 0) {
      notes.push(`Focus areas: ${categories.join(', ')}.`);
    }

    if (missing.length <= 3) {
      notes.push('Almost there — just a few items to address for full compliance.');
    }
  }

  return {
    missingPolicyItemIds: missingIds,
    highestPriorityItemIds: topIds,
    notes,
  };
}

/** Count of missing policy items for a beach (convenience helper) */
export function countPolicyGaps(
  compliance: BeachComplianceSnapshot,
  policySet: PolicySet,
): number {
  return policySet.items.filter(item => {
    const score = compliance.itemScores[item.id] ?? 0;
    return score < COMPLIANCE_THRESHOLD;
  }).length;
}
