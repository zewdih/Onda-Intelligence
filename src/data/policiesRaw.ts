// Raw mock policy data simulating a municipal policy database.
// Tomorrow: replace with real policy JSON/CSV, update policiesAdapter.ts only.

export interface RawPolicyItem {
  item_id: string;
  item_title: string;
  item_desc: string;
  category_tag: string;
  severity_tag: string;
  evidence_tag: string;
}

export interface RawPolicySet {
  policy_id: string;
  policy_name: string;
  jurisdiction_label: string;
  ref_url: string;
  items: RawPolicyItem[];
}

export const RAW_POLICY_SETS: RawPolicySet[] = [
  {
    policy_id: 'ps-sf',
    policy_name: 'Bay Area Coastal Waste Management Standards',
    jurisdiction_label: 'City of San Francisco — Coastal Ordinance §12.4',
    ref_url: 'https://sfgov.org/coastal-waste-policy',
    items: [
      { item_id: 'pi-sf-01', item_title: 'Public waste receptacles at all entry points', item_desc: 'Every beach access point must have a minimum of 2 waste bins (trash + recycling) within 10m of the entry.', category_tag: 'Waste Infrastructure', severity_tag: 'high', evidence_tag: 'photo' },
      { item_id: 'pi-sf-02', item_title: 'Storm drain debris barriers', item_desc: 'All storm drain outlets within 200m of the beach must have functioning debris barriers installed and inspected quarterly.', category_tag: 'Waste Infrastructure', severity_tag: 'high', evidence_tag: 'audit' },
      { item_id: 'pi-sf-03', item_title: 'Vendor waste disposal compliance', item_desc: 'All licensed beach vendors must demonstrate proper waste disposal training and use compostable packaging.', category_tag: 'Vendor Compliance', severity_tag: 'medium', evidence_tag: 'audit' },
      { item_id: 'pi-sf-04', item_title: 'Vendor compostable packaging requirement', item_desc: 'Food vendors within 300m of coast must use 100% compostable or recyclable packaging by ordinance.', category_tag: 'Vendor Compliance', severity_tag: 'high', evidence_tag: 'audit' },
      { item_id: 'pi-sf-05', item_title: 'Community beach cleanup program', item_desc: 'District must sponsor or support at least 2 community cleanup events per month during peak season.', category_tag: 'Community Programs', severity_tag: 'medium', evidence_tag: 'report' },
      { item_id: 'pi-sf-06', item_title: 'Youth environmental education outreach', item_desc: 'Annual educational programming targeting local schools on marine conservation and coastal stewardship.', category_tag: 'Community Programs', severity_tag: 'low', evidence_tag: 'report' },
      { item_id: 'pi-sf-07', item_title: 'Illegal dumping enforcement patrols', item_desc: 'Weekly enforcement patrols during peak season, monthly during off-season, with documented incident reporting.', category_tag: 'Enforcement', severity_tag: 'high', evidence_tag: 'report' },
      { item_id: 'pi-sf-08', item_title: 'Single-use plastic restriction signage', item_desc: 'Visible signage at all entry points communicating single-use plastic restrictions and alternatives.', category_tag: 'Enforcement', severity_tag: 'medium', evidence_tag: 'photo' },
      { item_id: 'pi-sf-09', item_title: 'Monthly water quality sampling', item_desc: 'Water samples taken at 3+ locations monthly, results published within 48 hours.', category_tag: 'Monitoring', severity_tag: 'medium', evidence_tag: 'sensor' },
      { item_id: 'pi-sf-10', item_title: 'Annual beach condition audit', item_desc: 'Comprehensive annual audit covering infrastructure condition, compliance levels, and pollution trends.', category_tag: 'Monitoring', severity_tag: 'low', evidence_tag: 'audit' },
      { item_id: 'pi-sf-11', item_title: 'Tide-line debris tracking protocol', item_desc: 'Weekly photographic documentation of tide-line debris patterns for trend analysis.', category_tag: 'Monitoring', severity_tag: 'low', evidence_tag: 'photo' },
      { item_id: 'pi-sf-12', item_title: 'Recycling station maintenance schedule', item_desc: 'All recycling stations cleaned and serviced at least twice weekly during peak season.', category_tag: 'Waste Infrastructure', severity_tag: 'medium', evidence_tag: 'audit' },
    ],
  },
  {
    policy_id: 'ps-la',
    policy_name: 'Los Angeles Shoreline Protection Standards',
    jurisdiction_label: 'City of Los Angeles — Shoreline Ord. §8.21',
    ref_url: 'https://lacity.gov/shoreline-protection',
    items: [
      { item_id: 'pi-la-01', item_title: 'Beachfront waste bin coverage', item_desc: 'Minimum 1 waste bin per 50m of beachfront, with separate recycling and compost streams.', category_tag: 'Waste Infrastructure', severity_tag: 'high', evidence_tag: 'photo' },
      { item_id: 'pi-la-02', item_title: 'Harbor debris containment systems', item_desc: 'All harbor areas must deploy floating debris booms and skim systems, inspected bi-weekly.', category_tag: 'Waste Infrastructure', severity_tag: 'high', evidence_tag: 'audit' },
      { item_id: 'pi-la-03', item_title: 'Vendor licensing waste requirements', item_desc: 'Beach vendor licenses must include waste management plan review and approval.', category_tag: 'Vendor Compliance', severity_tag: 'medium', evidence_tag: 'audit' },
      { item_id: 'pi-la-04', item_title: 'Vendor packaging material standards', item_desc: 'Vendors must eliminate polystyrene and switch to compostable alternatives within licensing period.', category_tag: 'Vendor Compliance', severity_tag: 'high', evidence_tag: 'audit' },
      { item_id: 'pi-la-05', item_title: 'Monthly community cleanup coordination', item_desc: 'Coordinate with local nonprofits for at least 1 organized cleanup event per beach per month.', category_tag: 'Community Programs', severity_tag: 'medium', evidence_tag: 'report' },
      { item_id: 'pi-la-06', item_title: 'Beach ambassador volunteer program', item_desc: 'Recruit and train beach ambassadors to educate visitors and report pollution incidents.', category_tag: 'Community Programs', severity_tag: 'low', evidence_tag: 'report' },
      { item_id: 'pi-la-07', item_title: 'Adopt-a-Beach corporate partnerships', item_desc: 'Establish corporate sponsorship program for ongoing beach maintenance and stewardship.', category_tag: 'Community Programs', severity_tag: 'low', evidence_tag: 'report' },
      { item_id: 'pi-la-08', item_title: 'Illegal discharge reporting hotline', item_desc: 'Maintain 24/7 hotline and mobile app for reporting illegal discharges, with 48-hour response SLA.', category_tag: 'Enforcement', severity_tag: 'high', evidence_tag: 'report' },
      { item_id: 'pi-la-09', item_title: 'Stormwater runoff monitoring', item_desc: 'Real-time sensors at major runoff points measuring turbidity, contaminants, and flow rate.', category_tag: 'Monitoring', severity_tag: 'medium', evidence_tag: 'sensor' },
      { item_id: 'pi-la-10', item_title: 'Quarterly beach health scorecard', item_desc: 'Published quarterly report card on beach health metrics, compliance, and improvement trends.', category_tag: 'Monitoring', severity_tag: 'medium', evidence_tag: 'report' },
      { item_id: 'pi-la-11', item_title: 'Microplastic sampling program', item_desc: 'Bi-monthly sand sampling for microplastic analysis at designated monitoring points.', category_tag: 'Monitoring', severity_tag: 'low', evidence_tag: 'sensor' },
      { item_id: 'pi-la-12', item_title: 'Heavy equipment beach cleaning schedule', item_desc: 'Mechanical beach cleaning at tourist beaches minimum 3x/week during peak season.', category_tag: 'Waste Infrastructure', severity_tag: 'medium', evidence_tag: 'audit' },
      { item_id: 'pi-la-13', item_title: 'Night-time littering enforcement', item_desc: 'After-hours patrols at high-traffic beaches with documented citation authority.', category_tag: 'Enforcement', severity_tag: 'medium', evidence_tag: 'report' },
    ],
  },
  {
    policy_id: 'ps-mi',
    policy_name: 'Miami-Dade Coastal Conservation Standards',
    jurisdiction_label: 'Miami-Dade County — Coastal Conservation Code §5.11',
    ref_url: 'https://miamidade.gov/coastal-conservation',
    items: [
      { item_id: 'pi-mi-01', item_title: 'Beach access waste stations', item_desc: 'Triple-stream waste stations (trash, recycling, compost) at every 75m along beachfront.', category_tag: 'Waste Infrastructure', severity_tag: 'high', evidence_tag: 'photo' },
      { item_id: 'pi-mi-02', item_title: 'Mangrove buffer zone protection', item_desc: 'Maintain 50m protected buffer around mangrove areas with no waste disposal or vendor activity.', category_tag: 'Waste Infrastructure', severity_tag: 'high', evidence_tag: 'audit' },
      { item_id: 'pi-mi-03', item_title: 'Tourist vendor waste agreements', item_desc: 'All tourist-area vendors must sign waste reduction agreements as condition of beach proximity permits.', category_tag: 'Vendor Compliance', severity_tag: 'medium', evidence_tag: 'audit' },
      { item_id: 'pi-mi-04', item_title: 'Vendor end-of-day cleanup protocol', item_desc: 'Vendors must complete documented cleanup of their permitted area before leaving for the day.', category_tag: 'Vendor Compliance', severity_tag: 'high', evidence_tag: 'photo' },
      { item_id: 'pi-mi-05', item_title: 'Sea turtle nesting protection plan', item_desc: 'Lighting and waste restrictions during turtle nesting season (March–October) at designated beaches.', category_tag: 'Community Programs', severity_tag: 'high', evidence_tag: 'audit' },
      { item_id: 'pi-mi-06', item_title: 'Bilingual coastal education program', item_desc: 'Community education materials and programming available in English and Spanish.', category_tag: 'Community Programs', severity_tag: 'medium', evidence_tag: 'report' },
      { item_id: 'pi-mi-07', item_title: 'Tourist-facing beach etiquette signage', item_desc: 'Multi-language signage at tourist beach entry points covering waste disposal and wildlife protection.', category_tag: 'Community Programs', severity_tag: 'low', evidence_tag: 'photo' },
      { item_id: 'pi-mi-08', item_title: 'Marine debris enforcement response', item_desc: 'Dedicated marine debris enforcement unit with authority for citations and cleanup orders.', category_tag: 'Enforcement', severity_tag: 'high', evidence_tag: 'report' },
      { item_id: 'pi-mi-09', item_title: 'Illegal anchoring and waste dumping patrols', item_desc: 'Harbor patrol for illegal waste dumping from vessels, with documented incident tracking.', category_tag: 'Enforcement', severity_tag: 'medium', evidence_tag: 'report' },
      { item_id: 'pi-mi-10', item_title: 'Real-time water quality sensors', item_desc: 'IoT sensor network for continuous water quality monitoring at high-traffic beaches.', category_tag: 'Monitoring', severity_tag: 'medium', evidence_tag: 'sensor' },
      { item_id: 'pi-mi-11', item_title: 'Coral reef proximity impact tracking', item_desc: 'Quarterly assessment of pollution impact on nearby coral reef health markers.', category_tag: 'Monitoring', severity_tag: 'medium', evidence_tag: 'sensor' },
      { item_id: 'pi-mi-12', item_title: 'Beach erosion and debris accumulation mapping', item_desc: 'Monthly drone survey mapping debris accumulation patterns and erosion changes.', category_tag: 'Monitoring', severity_tag: 'low', evidence_tag: 'photo' },
      { item_id: 'pi-mi-13', item_title: 'Hurricane preparedness waste plan', item_desc: 'Pre-season waste infrastructure securing and post-storm debris cleanup rapid response plan.', category_tag: 'Waste Infrastructure', severity_tag: 'medium', evidence_tag: 'report' },
      { item_id: 'pi-mi-14', item_title: 'River mouth debris interception', item_desc: 'Floating barriers at river mouth entries to intercept upstream debris before reaching beaches.', category_tag: 'Waste Infrastructure', severity_tag: 'high', evidence_tag: 'audit' },
    ],
  },
];

// Map district IDs to policy set IDs
export const DISTRICT_POLICY_MAP: Record<string, string> = {
  'd-sf': 'ps-sf',
  'd-la': 'ps-la',
  'd-mi': 'ps-mi',
};
