// Impact Model: projects 30-day outcomes if plan is executed.
// Mock but deterministic — uses beach metrics + plan coverage.
// Tomorrow: replace with trained model or statistical regression.

import type { Beach, ProjectedImpact } from '../types/domain';

export function computeProjectedImpact(
  beach: Beach,
  plan: { steps: { expectedImpact: string; linkedPolicyItemIds: string[] }[] },
  completionRate: number = 1, // 0-1, assume full completion for projection
): ProjectedImpact {
  const { pollutionScore, estimatedTrashTonsMonthly } = beach;

  // Count high/medium/low impact steps
  const highSteps = plan.steps.filter(s => s.expectedImpact === 'high').length;
  const medSteps = plan.steps.filter(s => s.expectedImpact === 'medium').length;
  const lowSteps = plan.steps.filter(s => s.expectedImpact === 'low').length;

  // Weighted step impact score (0-1 range roughly)
  const stepImpactScore = Math.min(1, (highSteps * 0.15 + medSteps * 0.08 + lowSteps * 0.03) * completionRate);

  // Policy coverage factor: how many unique policy items are addressed
  const uniquePolicyItems = new Set(plan.steps.flatMap(s => s.linkedPolicyItemIds));
  const policyCoverage = Math.min(1, uniquePolicyItems.size * 0.08);

  // Base reduction potential scales with how bad things are
  const severityMultiplier = pollutionScore / 100; // worse beaches have more room to improve

  // Trash reduction: 8-35% range
  const rawTrashReduction = (stepImpactScore * 0.25 + policyCoverage * 0.1) * severityMultiplier * completionRate;
  const trashReductionPct30d = Math.round(Math.max(8, Math.min(35, rawTrashReduction * 100 + 8)));

  // Score improvement: 5-25 points
  const rawScoreImprovement = stepImpactScore * 18 * severityMultiplier + policyCoverage * 7;
  const scoreImprovement30d = Math.round(Math.max(5, Math.min(25, rawScoreImprovement * completionRate)));

  // Confidence based on data completeness + plan coverage
  const dataPoints = beach.history.length;
  const confidenceScore = (dataPoints >= 5 ? 0.3 : 0.1) + stepImpactScore * 0.4 + policyCoverage * 0.3;
  const confidence: ProjectedImpact['confidence'] =
    confidenceScore >= 0.7 ? 'high' : confidenceScore >= 0.4 ? 'medium' : 'low';

  // Rationale bullets
  const rationaleBullets: string[] = [];

  if (highSteps > 0) {
    rationaleBullets.push(`${highSteps} high-impact ${highSteps === 1 ? 'action targets' : 'actions target'} the biggest pollution sources.`);
  }
  if (policyCoverage > 0.3) {
    rationaleBullets.push(`Plan addresses ${uniquePolicyItems.size} policy gap${uniquePolicyItems.size === 1 ? '' : 's'}, improving overall compliance.`);
  }

  const trashTonsReduced = +(estimatedTrashTonsMonthly * trashReductionPct30d / 100).toFixed(1);
  rationaleBullets.push(`Estimated ${trashTonsReduced} tons/month reduction based on similar beach patterns.`);

  if (beach.signals.footTrafficIndex > 0.7) {
    rationaleBullets.push('High foot traffic means community-facing actions will have outsized impact.');
  }
  if (beach.signals.riverProximityIndex > 0.5) {
    rationaleBullets.push('River proximity contributes significantly — upstream barriers will help.');
  }

  if (completionRate < 1) {
    rationaleBullets.push(`Projection assumes ${Math.round(completionRate * 100)}% completion rate based on current progress.`);
  }

  return {
    trashReductionPct30d,
    scoreImprovement30d,
    confidence,
    rationaleBullets,
  };
}
