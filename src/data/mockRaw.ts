// Raw mock data simulating an external feed.
// Tomorrow: replace this file with real API response shapes,
// then update adapter.ts mapping only.

export interface RawBeachRecord {
  beach_id: string;
  beach_name: string;
  district_ref: string;
  lat: number;
  lon: number;
  type_tag: string;
  score: number;
  trash_tons: number;
  last_update: string;
  foot_traffic: number;
  vendor_proximity: number;
  river_proximity: number;
  score_history: { date: string; score: number; trash: number }[];
  compliance_scores: Record<string, number>; // policyItemId → 0-1
  last_audit: string;
}

export interface RawDistrictRecord {
  district_id: string;
  district_name: string;
  city: string;
  center_lat: number;
  center_lon: number;
  beach_ids: string[];
  policy_set_id: string;
}

function hist(base: number, n: number): { date: string; score: number; trash: number }[] {
  const out: { date: string; score: number; trash: number }[] = [];
  let s = base + 14;
  for (let i = n; i >= 1; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    s += Math.round(Math.sin(i * 1.1) * 6 - 1.5);
    s = Math.max(0, Math.min(100, s));
    out.push({ date: d.toISOString().slice(0, 10), score: s, trash: +(0.8 + (s / 100) * 7).toFixed(1) });
  }
  out.push({ date: new Date().toISOString().slice(0, 10), score: base, trash: +(0.8 + (base / 100) * 7).toFixed(1) });
  return out;
}

// Deterministic compliance scores based on beach score + seeded variation
function comp(beachScore: number, policyIds: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  let seed = beachScore;
  for (const pid of policyIds) {
    // Higher pollution → lower compliance, with per-item variation
    seed = ((seed * 31 + pid.charCodeAt(pid.length - 1)) % 97) / 97;
    const base = 1 - (beachScore / 130); // 0.23–1.0 range roughly
    const varied = Math.max(0, Math.min(1, base + (seed - 0.5) * 0.5));
    out[pid] = +varied.toFixed(2);
    seed = Math.abs(seed * 100) % 97;
  }
  return out;
}

const SF_ITEMS = ['pi-sf-01','pi-sf-02','pi-sf-03','pi-sf-04','pi-sf-05','pi-sf-06','pi-sf-07','pi-sf-08','pi-sf-09','pi-sf-10','pi-sf-11','pi-sf-12'];
const LA_ITEMS = ['pi-la-01','pi-la-02','pi-la-03','pi-la-04','pi-la-05','pi-la-06','pi-la-07','pi-la-08','pi-la-09','pi-la-10','pi-la-11','pi-la-12','pi-la-13'];
const MI_ITEMS = ['pi-mi-01','pi-mi-02','pi-mi-03','pi-mi-04','pi-mi-05','pi-mi-06','pi-mi-07','pi-mi-08','pi-mi-09','pi-mi-10','pi-mi-11','pi-mi-12','pi-mi-13','pi-mi-14'];

export const RAW_DISTRICTS: RawDistrictRecord[] = [
  { district_id: 'd-sf', district_name: 'Bay Coast District', city: 'San Francisco', center_lat: 37.775, center_lon: -122.419, beach_ids: ['b1','b2','b3','b4','b5'], policy_set_id: 'ps-sf' },
  { district_id: 'd-la', district_name: 'South Shore District', city: 'Los Angeles', center_lat: 33.942, center_lon: -118.408, beach_ids: ['b6','b7','b8','b9','b10'], policy_set_id: 'ps-la' },
  { district_id: 'd-mi', district_name: 'Tropical Coast District', city: 'Miami', center_lat: 25.762, center_lon: -80.192, beach_ids: ['b11','b12','b13','b14','b15'], policy_set_id: 'ps-mi' },
];

export const RAW_BEACHES: RawBeachRecord[] = [
  // SF
  { beach_id: 'b1', beach_name: 'Coral Bay', district_ref: 'd-sf', lat: 37.786, lon: -122.437, type_tag: 'urban', score: 76, trash_tons: 7.1, last_update: '2026-02-25', foot_traffic: 0.85, vendor_proximity: 0.7, river_proximity: 0.2, score_history: hist(76, 6), compliance_scores: comp(76, SF_ITEMS), last_audit: '2026-02-10' },
  { beach_id: 'b2', beach_name: 'Sunset Cove', district_ref: 'd-sf', lat: 37.759, lon: -122.397, type_tag: 'tourist', score: 51, trash_tons: 4.2, last_update: '2026-02-24', foot_traffic: 0.9, vendor_proximity: 0.8, river_proximity: 0.1, score_history: hist(51, 6), compliance_scores: comp(51, SF_ITEMS), last_audit: '2026-02-08' },
  { beach_id: 'b3', beach_name: 'Driftwood Shore', district_ref: 'd-sf', lat: 37.800, lon: -122.410, type_tag: 'harbor', score: 44, trash_tons: 3.6, last_update: '2026-02-26', foot_traffic: 0.5, vendor_proximity: 0.3, river_proximity: 0.4, score_history: hist(44, 6), compliance_scores: comp(44, SF_ITEMS), last_audit: '2026-02-12' },
  { beach_id: 'b4', beach_name: 'Moonlit Bay', district_ref: 'd-sf', lat: 37.795, lon: -122.444, type_tag: 'remote', score: 19, trash_tons: 1.4, last_update: '2026-02-27', foot_traffic: 0.15, vendor_proximity: 0.05, river_proximity: 0.1, score_history: hist(19, 6), compliance_scores: comp(19, SF_ITEMS), last_audit: '2026-02-15' },
  { beach_id: 'b5', beach_name: 'Reef Point', district_ref: 'd-sf', lat: 37.745, lon: -122.404, type_tag: 'river_mouth', score: 67, trash_tons: 5.8, last_update: '2026-02-25', foot_traffic: 0.4, vendor_proximity: 0.2, river_proximity: 0.9, score_history: hist(67, 6), compliance_scores: comp(67, SF_ITEMS), last_audit: '2026-02-07' },
  // LA
  { beach_id: 'b6', beach_name: 'Emerald Strand', district_ref: 'd-la', lat: 33.951, lon: -118.426, type_tag: 'tourist', score: 24, trash_tons: 1.9, last_update: '2026-02-26', foot_traffic: 0.7, vendor_proximity: 0.6, river_proximity: 0.1, score_history: hist(24, 6), compliance_scores: comp(24, LA_ITEMS), last_audit: '2026-02-14' },
  { beach_id: 'b7', beach_name: 'Sapphire Coast', district_ref: 'd-la', lat: 33.923, lon: -118.430, type_tag: 'urban', score: 71, trash_tons: 6.1, last_update: '2026-02-25', foot_traffic: 0.9, vendor_proximity: 0.75, river_proximity: 0.15, score_history: hist(71, 6), compliance_scores: comp(71, LA_ITEMS), last_audit: '2026-02-09' },
  { beach_id: 'b8', beach_name: 'Tideline Beach', district_ref: 'd-la', lat: 33.948, lon: -118.383, type_tag: 'harbor', score: 32, trash_tons: 2.6, last_update: '2026-02-27', foot_traffic: 0.35, vendor_proximity: 0.3, river_proximity: 0.5, score_history: hist(32, 6), compliance_scores: comp(32, LA_ITEMS), last_audit: '2026-02-11' },
  { beach_id: 'b9', beach_name: 'Pelican Shores', district_ref: 'd-la', lat: 33.963, lon: -118.438, type_tag: 'tourist', score: 57, trash_tons: 4.9, last_update: '2026-02-24', foot_traffic: 0.85, vendor_proximity: 0.7, river_proximity: 0.1, score_history: hist(57, 6), compliance_scores: comp(57, LA_ITEMS), last_audit: '2026-02-06' },
  { beach_id: 'b10', beach_name: 'Marina Vista', district_ref: 'd-la', lat: 33.933, lon: -118.398, type_tag: 'harbor', score: 81, trash_tons: 8.0, last_update: '2026-02-23', foot_traffic: 0.6, vendor_proximity: 0.4, river_proximity: 0.7, score_history: hist(81, 6), compliance_scores: comp(81, LA_ITEMS), last_audit: '2026-02-03' },
  // Miami
  { beach_id: 'b11', beach_name: 'Flamingo Bay', district_ref: 'd-mi', lat: 25.772, lon: -80.202, type_tag: 'tourist', score: 61, trash_tons: 5.3, last_update: '2026-02-26', foot_traffic: 0.9, vendor_proximity: 0.85, river_proximity: 0.1, score_history: hist(61, 6), compliance_scores: comp(61, MI_ITEMS), last_audit: '2026-02-13' },
  { beach_id: 'b12', beach_name: 'Biscayne Edge', district_ref: 'd-mi', lat: 25.752, lon: -80.182, type_tag: 'urban', score: 74, trash_tons: 6.8, last_update: '2026-02-25', foot_traffic: 0.95, vendor_proximity: 0.8, river_proximity: 0.2, score_history: hist(74, 6), compliance_scores: comp(74, MI_ITEMS), last_audit: '2026-02-10' },
  { beach_id: 'b13', beach_name: 'Mangrove Point', district_ref: 'd-mi', lat: 25.782, lon: -80.207, type_tag: 'river_mouth', score: 47, trash_tons: 3.9, last_update: '2026-02-24', foot_traffic: 0.3, vendor_proximity: 0.15, river_proximity: 0.85, score_history: hist(47, 6), compliance_scores: comp(47, MI_ITEMS), last_audit: '2026-02-05' },
  { beach_id: 'b14', beach_name: 'Seagrass Inlet', district_ref: 'd-mi', lat: 25.742, lon: -80.177, type_tag: 'remote', score: 17, trash_tons: 1.1, last_update: '2026-02-27', foot_traffic: 0.1, vendor_proximity: 0.05, river_proximity: 0.2, score_history: hist(17, 6), compliance_scores: comp(17, MI_ITEMS), last_audit: '2026-02-16' },
  { beach_id: 'b15', beach_name: 'Starfish Lagoon', district_ref: 'd-mi', lat: 25.768, lon: -80.215, type_tag: 'harbor', score: 39, trash_tons: 3.1, last_update: '2026-02-26', foot_traffic: 0.45, vendor_proximity: 0.35, river_proximity: 0.3, score_history: hist(39, 6), compliance_scores: comp(39, MI_ITEMS), last_audit: '2026-02-09' },
];

export const RAW_ADMINS = [
  { admin_id: 'a1', full_name: 'Maria Santos', email_addr: 'maria@onda.io', district_ref: 'd-sf' },
  { admin_id: 'a2', full_name: 'James Okafor', email_addr: 'james@onda.io', district_ref: 'd-la' },
  { admin_id: 'a3', full_name: 'Lina Park', email_addr: 'lina@onda.io', district_ref: 'd-mi' },
];
