// Plan Engine: generates intervention plans with policy gap analysis + projected impact.

import type {
  Beach, InterventionPlan, InterventionStep, SupportStatus,
  StepCategory, OwnerRole, ExpectedImpact, PolicySet, Citation,
} from '../types/domain';
import { computePolicyGaps } from './policyGapEngine';
import { computeProjectedImpact } from './impactModel';

// ── Supportive labels ──

export const STATUS_LABEL: Record<SupportStatus, string> = {
  needs_assistance: 'Needs Assistance',
  making_progress: 'Making Progress',
  steady: 'Steady',
};

export const STATUS_COLOR_LIGHT: Record<SupportStatus, string> = {
  needs_assistance: 'bg-rose-100 text-rose-700 border-rose-200',
  making_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  steady: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const STATUS_COLOR_DARK: Record<SupportStatus, string> = {
  needs_assistance: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
  making_progress: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  steady: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
};

// ── Step templates linked to policy categories ──

interface StepTemplate {
  title: string;
  category: StepCategory;
  owner: OwnerRole;
  impact: ExpectedImpact;
  policyCategories: string[]; // which policy categories this addresses
}

const TEMPLATES: StepTemplate[] = [
  { title: 'Install waste bins at all beach entry points', category: 'Infrastructure', owner: 'City Ops', impact: 'high', policyCategories: ['Waste Infrastructure'] },
  { title: 'Deploy barrier nets at storm drain outlets', category: 'Infrastructure', owner: 'Sanitation', impact: 'high', policyCategories: ['Waste Infrastructure'] },
  { title: 'Set up recycling sorting stations', category: 'Infrastructure', owner: 'City Ops', impact: 'high', policyCategories: ['Waste Infrastructure'] },
  { title: 'Enforce vendor packaging compliance', category: 'Policy', owner: 'Vendors', impact: 'medium', policyCategories: ['Vendor Compliance'] },
  { title: 'Distribute reusable bags to beachfront vendors', category: 'Community', owner: 'Vendors', impact: 'low', policyCategories: ['Vendor Compliance'] },
  { title: 'Organize bi-weekly community cleanup events', category: 'Community', owner: 'Volunteers', impact: 'medium', policyCategories: ['Community Programs'] },
  { title: 'Launch beach stewardship education workshops', category: 'Community', owner: 'Parks', impact: 'medium', policyCategories: ['Community Programs'] },
  { title: 'Propose single-use plastic restrictions near coast', category: 'Policy', owner: 'City Ops', impact: 'high', policyCategories: ['Enforcement'] },
  { title: 'Schedule weekly enforcement patrols', category: 'Policy', owner: 'City Ops', impact: 'medium', policyCategories: ['Enforcement'] },
  { title: 'Install water quality monitoring sensors', category: 'Monitoring', owner: 'Sanitation', impact: 'medium', policyCategories: ['Monitoring'] },
  { title: 'Schedule weekly tide line debris audits', category: 'Monitoring', owner: 'Parks', impact: 'low', policyCategories: ['Monitoring'] },
  { title: 'Document and map pollution hotspots', category: 'Monitoring', owner: 'Volunteers', impact: 'low', policyCategories: ['Monitoring'] },
  { title: 'Petition for increased coastal maintenance budget', category: 'Policy', owner: 'City Ops', impact: 'medium', policyCategories: ['Waste Infrastructure', 'Enforcement'] },
  { title: 'Deploy floating debris booms in harbor areas', category: 'Infrastructure', owner: 'Sanitation', impact: 'high', policyCategories: ['Waste Infrastructure'] },
  { title: 'Establish beach ambassador volunteer program', category: 'Community', owner: 'Volunteers', impact: 'low', policyCategories: ['Community Programs'] },
];

function findLinkedPolicyItems(template: StepTemplate, policySet: PolicySet): string[] {
  return policySet.items
    .filter(pi => template.policyCategories.includes(pi.category))
    .map(pi => pi.id);
}

// ── Plan generation ──

export function generateSupportPlan(beach: Beach, policySet: PolicySet): InterventionPlan {
  const count = beach.pollutionScore >= 60 ? 8 : beach.pollutionScore >= 35 ? 6 : 4;
  const now = Date.now();

  // Compute policy gaps to prioritize templates
  const gaps = computePolicyGaps(beach.compliance, policySet, beach.signals, beach.beachType);
  const missingCategories = new Set(
    gaps.highestPriorityItemIds
      .map(id => policySet.items.find(pi => pi.id === id)?.category)
      .filter(Boolean),
  );

  // Sort templates: prioritize those that address missing policy categories
  const sorted = [...TEMPLATES].sort((a, b) => {
    const aMatch = a.policyCategories.some(c => missingCategories.has(c as any)) ? 1 : 0;
    const bMatch = b.policyCategories.some(c => missingCategories.has(c as any)) ? 1 : 0;
    if (bMatch !== aMatch) return bMatch - aMatch;
    const impactOrder = { high: 3, medium: 2, low: 1 };
    return impactOrder[b.impact] - impactOrder[a.impact];
  });

  const steps: InterventionStep[] = sorted.slice(0, count).map((t, i) => ({
    id: `step-${beach.id}-${now}-${i}`,
    category: t.category,
    title: t.title,
    ownerRole: t.owner,
    status: 'todo',
    expectedImpact: t.impact,
    linkedPolicyItemIds: findLinkedPolicyItems(t, policySet),
  }));

  // Projected impact
  const projectedImpact = computeProjectedImpact(beach, { steps });

  // Citations from policy reference
  const citations: Citation[] = gaps.highestPriorityItemIds.slice(0, 3).map(id => {
    const item = policySet.items.find(pi => pi.id === id);
    return {
      label: `${policySet.name} — ${item?.title ?? id}`,
      url: `${policySet.referenceUrl}#${id}`,
    };
  });

  // Summary
  const summary = beach.supportStatus === 'needs_assistance'
    ? `This beach needs focused support. Here are ${count} recommended next steps aligned to ${policySet.jurisdiction}. Projected: ${projectedImpact.trashReductionPct30d}% trash reduction in 30 days.`
    : beach.supportStatus === 'making_progress'
    ? `Good progress! These ${count} steps target remaining policy gaps and will help maintain momentum. Projected: ${projectedImpact.scoreImprovement30d}-point score improvement.`
    : `This beach is doing well. These ${count} maintenance steps keep compliance strong and conditions steady.`;

  return {
    id: `plan-${beach.id}-${now}`,
    createdAtISO: new Date().toISOString(),
    generatedBy: 'mock-ai',
    summary,
    projectedImpact,
    policyGapMatchup: {
      missingPolicyItemIds: gaps.missingPolicyItemIds,
      highestPriorityItemIds: gaps.highestPriorityItemIds,
      notes: gaps.notes,
    },
    steps,
    citations,
  };
}

// ── Reassessment simulation ──

export function simulateReassessment(beach: Beach): Beach {
  const latestPlan = beach.interventions[beach.interventions.length - 1];
  let completionRate = 0;
  if (latestPlan) {
    const done = latestPlan.steps.filter(s => s.status === 'done').length;
    const inProg = latestPlan.steps.filter(s => s.status === 'in_progress').length;
    completionRate = (done + inProg * 0.3) / latestPlan.steps.length;
  }

  let delta: number;
  if (completionRate >= 0.7) delta = -(8 + Math.round(completionRate * 12));
  else if (completionRate >= 0.3) delta = -(2 + Math.round(completionRate * 6));
  else if (beach.supportStatus === 'needs_assistance') delta = 3 + Math.round(Math.random() * 3);
  else delta = Math.round(Math.random() * 3) - 1;

  const newScore = Math.max(0, Math.min(100, beach.pollutionScore + delta));
  const newTrash = +(0.8 + (newScore / 100) * 7).toFixed(1);
  const newStatus: SupportStatus =
    newScore >= 60 ? 'needs_assistance' : newScore >= 35 ? 'making_progress' : 'steady';

  // Slightly improve compliance scores for completed steps
  const newCompliance = { ...beach.compliance, itemScores: { ...beach.compliance.itemScores } };
  if (latestPlan && completionRate > 0) {
    const doneSteps = latestPlan.steps.filter(s => s.status === 'done');
    for (const step of doneSteps) {
      for (const pid of step.linkedPolicyItemIds) {
        const current = newCompliance.itemScores[pid] ?? 0;
        newCompliance.itemScores[pid] = Math.min(1, current + 0.15);
      }
    }
    newCompliance.lastAuditISO = new Date().toISOString().slice(0, 10);
  }

  return {
    ...beach,
    pollutionScore: newScore,
    estimatedTrashTonsMonthly: newTrash,
    supportStatus: newStatus,
    lastUpdatedISO: new Date().toISOString().slice(0, 10),
    history: [...beach.history, { dateISO: new Date().toISOString().slice(0, 10), pollutionScore: newScore, trashTons: newTrash }],
    compliance: newCompliance,
  };
}
