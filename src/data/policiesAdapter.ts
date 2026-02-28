// Policy Data Adapter: maps raw policy shapes → canonical domain types.
// Tomorrow: replace policiesRaw.ts with real policy data, update mapping below.

import { RAW_POLICY_SETS, DISTRICT_POLICY_MAP } from './policiesRaw';
import type { RawPolicySet, RawPolicyItem } from './policiesRaw';
import type { PolicySet, PolicyItem, PolicyCategory, EvidenceType, ExpectedImpact } from '../types/domain';

function mapPolicyItem(raw: RawPolicyItem): PolicyItem {
  return {
    id: raw.item_id,
    title: raw.item_title,
    description: raw.item_desc,
    category: raw.category_tag as PolicyCategory,
    severityIfMissing: raw.severity_tag as ExpectedImpact,
    evidenceType: raw.evidence_tag as EvidenceType,
  };
}

function mapPolicySet(raw: RawPolicySet): PolicySet {
  return {
    id: raw.policy_id,
    name: raw.policy_name,
    jurisdiction: raw.jurisdiction_label,
    referenceUrl: raw.ref_url,
    items: raw.items.map(mapPolicyItem),
  };
}

// ── Public API ──

export function loadAllPolicySets(): PolicySet[] {
  return RAW_POLICY_SETS.map(mapPolicySet);
}

export function getPolicySetById(id: string): PolicySet | undefined {
  return loadAllPolicySets().find(ps => ps.id === id);
}

export function getPolicySetForDistrict(districtId: string): PolicySet | undefined {
  const psId = DISTRICT_POLICY_MAP[districtId];
  if (!psId) return undefined;
  return getPolicySetById(psId);
}
