// ── Enums / Unions ──

export type BeachType = 'urban' | 'tourist' | 'remote' | 'harbor' | 'river_mouth';
export type SupportStatus = 'needs_assistance' | 'making_progress' | 'steady';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type ExpectedImpact = 'low' | 'medium' | 'high';
export type OwnerRole = 'City Ops' | 'Parks' | 'Volunteers' | 'Vendors' | 'Sanitation';
export type StepCategory = 'Infrastructure' | 'Community' | 'Policy' | 'Monitoring';
export type PolicyCategory = 'Waste Infrastructure' | 'Vendor Compliance' | 'Community Programs' | 'Enforcement' | 'Monitoring';
export type EvidenceType = 'photo' | 'audit' | 'sensor' | 'report';
export type MascotAnimal = 'sea_turtle' | 'seal' | 'dolphin' | 'seabird' | 'otter' | 'whale' | 'manatee' | 'crab';

// ── Value Objects ──

export interface Mascot {
  animal: MascotAnimal;
  emoji: string;
  label: string;
}

export interface HistoryEntry {
  dateISO: string;
  pollutionScore: number;
  trashTons: number;
}

export interface Signals {
  footTrafficIndex: number;
  proximityToVendorsIndex: number;
  riverProximityIndex: number;
}

// ── Policy ──

export interface PolicyItem {
  id: string;
  title: string;
  description: string;
  category: PolicyCategory;
  severityIfMissing: ExpectedImpact; // reuse low/medium/high
  evidenceType: EvidenceType;
}

export interface PolicySet {
  id: string;
  name: string;
  jurisdiction: string;
  referenceUrl: string;
  items: PolicyItem[];
}

// ── Compliance ──

export interface BeachComplianceSnapshot {
  itemScores: Record<string, number>; // policyItemId → 0-1
  lastAuditISO: string;
}

// ── Intervention ──

export interface ProjectedImpact {
  trashReductionPct30d: number;
  scoreImprovement30d: number;
  confidence: 'low' | 'medium' | 'high';
  rationaleBullets: string[];
}

export interface PolicyGapMatchup {
  missingPolicyItemIds: string[];
  highestPriorityItemIds: string[];
  notes: string[];
}

export interface Citation {
  label: string;
  url: string;
}

export interface InterventionStep {
  id: string;
  category: StepCategory;
  title: string;
  ownerRole: OwnerRole;
  status: TaskStatus;
  expectedImpact: ExpectedImpact;
  linkedPolicyItemIds: string[];
}

export interface InterventionPlan {
  id: string;
  createdAtISO: string;
  generatedBy: 'mock-ai';
  summary: string;
  projectedImpact: ProjectedImpact;
  policyGapMatchup: PolicyGapMatchup;
  steps: InterventionStep[];
  citations: Citation[];
}

// ── Core Aggregates ──

export interface Beach {
  id: string;
  name: string;
  districtId: string;
  location: { lat: number; lon: number };
  beachType: BeachType;
  supportStatus: SupportStatus;
  pollutionScore: number;
  estimatedTrashTonsMonthly: number;
  lastUpdatedISO: string;
  history: HistoryEntry[];
  signals: Signals;
  mascot: Mascot;
  compliance: BeachComplianceSnapshot;
  interventions: InterventionPlan[];
}

export interface District {
  id: string;
  name: string;
  city: string;
  center: { lat: number; lon: number };
  beachIds: string[];
  policySetId: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  districtId: string;
}

// ── Activity Timeline ──

export type ActivityType = 'plan_generated' | 'tasks_completed' | 'progress_check' | 'status_change';

export interface ActivityEntry {
  id: string;
  timestampISO: string;
  type: ActivityType;
  beachName: string;
  beachEmoji: string;
  message: string;
}

// ── District Aggregation ──

export interface DistrictProjection {
  trashReductionPct: number;
  avgScoreImprovement: number;
  beachesImpacted: number;
  timeframeLabel: string;
  confidence: 'low' | 'medium' | 'high';
}
