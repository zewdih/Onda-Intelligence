// Data Adapter: maps raw feed shapes → canonical domain types.
// To plug in real data: replace mockRaw.ts with your API client,
// then update only the mapping functions below.

import { RAW_DISTRICTS, RAW_BEACHES, RAW_ADMINS } from './mockRaw';
import type { RawBeachRecord, RawDistrictRecord } from './mockRaw';
import type { District, Beach, AdminUser, BeachType, SupportStatus, Mascot, MascotAnimal, BeachComplianceSnapshot } from '../types/domain';

// ── Mascot assignment (deterministic by beach type + id hash) ──

const MASCOT_MAP: Record<BeachType, [MascotAnimal, MascotAnimal]> = {
  river_mouth: ['seabird', 'crab'],
  harbor: ['seal', 'otter'],
  tourist: ['sea_turtle', 'dolphin'],
  remote: ['whale', 'seabird'],
  urban: ['otter', 'seal'],
};

const EMOJI_MAP: Record<MascotAnimal, string> = {
  sea_turtle: '🐢', seal: '🦭', dolphin: '🐬', seabird: '🐦',
  otter: '🦦', whale: '🐋', manatee: '🐬', crab: '🦀',
};

const LABEL_MAP: Record<MascotAnimal, string> = {
  sea_turtle: 'Sea Turtle', seal: 'Seal', dolphin: 'Dolphin', seabird: 'Seabird',
  otter: 'Sea Otter', whale: 'Whale', manatee: 'Manatee', crab: 'Crab',
};

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function assignMascot(type: BeachType, beachId: string): Mascot {
  const pair = MASCOT_MAP[type];
  const animal = pair[hashCode(beachId) % 2];
  return { animal, emoji: EMOJI_MAP[animal], label: LABEL_MAP[animal] };
}

// ── Support status from score ──

function toSupportStatus(score: number): SupportStatus {
  if (score >= 60) return 'needs_assistance';
  if (score >= 35) return 'making_progress';
  return 'steady';
}

// ── Beach type labels ──

const BEACH_TYPE_LABELS: Record<BeachType, string> = {
  urban: 'Urban Beach',
  tourist: 'Tourist Beach',
  remote: 'Remote Beach',
  harbor: 'Harbor',
  river_mouth: 'River Mouth',
};

export function getBeachTypeLabel(type: BeachType): string {
  return BEACH_TYPE_LABELS[type] ?? type;
}

// ── Mappers ──

function mapCompliance(raw: RawBeachRecord): BeachComplianceSnapshot {
  return {
    itemScores: raw.compliance_scores,
    lastAuditISO: raw.last_audit,
  };
}

function mapBeach(raw: RawBeachRecord): Beach {
  const beachType = raw.type_tag as BeachType;
  return {
    id: raw.beach_id,
    name: raw.beach_name,
    districtId: raw.district_ref,
    location: { lat: raw.lat, lon: raw.lon },
    beachType,
    supportStatus: toSupportStatus(raw.score),
    pollutionScore: raw.score,
    estimatedTrashTonsMonthly: raw.trash_tons,
    lastUpdatedISO: raw.last_update,
    history: raw.score_history.map(h => ({ dateISO: h.date, pollutionScore: h.score, trashTons: h.trash })),
    signals: {
      footTrafficIndex: raw.foot_traffic,
      proximityToVendorsIndex: raw.vendor_proximity,
      riverProximityIndex: raw.river_proximity,
    },
    mascot: assignMascot(beachType, raw.beach_id),
    compliance: mapCompliance(raw),
    interventions: [],
  };
}

function mapDistrict(raw: RawDistrictRecord): District {
  return {
    id: raw.district_id,
    name: raw.district_name,
    city: raw.city,
    center: { lat: raw.center_lat, lon: raw.center_lon },
    beachIds: raw.beach_ids,
    policySetId: raw.policy_set_id,
  };
}

function mapAdmin(raw: typeof RAW_ADMINS[number]): AdminUser {
  return {
    id: raw.admin_id,
    name: raw.full_name,
    email: raw.email_addr,
    districtId: raw.district_ref,
  };
}

// ── Public API ──

export function loadDistricts(): District[] {
  return RAW_DISTRICTS.map(mapDistrict);
}

export function loadBeaches(): Beach[] {
  return RAW_BEACHES.map(mapBeach);
}

export function loadAdmins(): AdminUser[] {
  return RAW_ADMINS.map(mapAdmin);
}

export function loadBeachesForDistrict(districtId: string): Beach[] {
  return loadBeaches().filter(b => b.districtId === districtId);
}

export function findAdmin(email: string): AdminUser | undefined {
  return loadAdmins().find(a => a.email.toLowerCase() === email.toLowerCase());
}

export function getDistrictById(id: string): District | undefined {
  return loadDistricts().find(d => d.id === id);
}
