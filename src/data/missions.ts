import type { Mission, MissionPriority, PersonalStats } from '../types/mission';

export const MISSIONS: Mission[] = [
  {
    id: 'po-001',
    name: 'Dakar Coastal Sweep',
    priority: 'HIGH',
    status: 'ONGOING',
    startDate: '2026-02-10T00:00:00Z',
    endDate: '2026-03-15T00:00:00Z',
    location: { name: 'Dakar, Senegal', lat: 14.6937, lng: -17.4441 },
    estimatedPlasticTons: 320,
    estimatedItems: 384000,
    zones: [
      {
        id: 'z-001a', name: 'Hann Bay', estimatedTons: 180,
        polygon: [
          { lat: 14.710, lng: -17.430 }, { lat: 14.715, lng: -17.420 },
          { lat: 14.705, lng: -17.415 }, { lat: 14.700, lng: -17.425 },
        ],
      },
      {
        id: 'z-001b', name: 'Yoff Shore', estimatedTons: 90,
        polygon: [
          { lat: 14.760, lng: -17.470 }, { lat: 14.765, lng: -17.460 },
          { lat: 14.755, lng: -17.455 }, { lat: 14.750, lng: -17.465 },
        ],
      },
      { id: 'z-001c', name: 'Ouakam Reef', estimatedTons: 50 },
    ],
    heatmapPoints: [
      { lat: 14.710, lng: -17.425, intensity: 0.95 },
      { lat: 14.708, lng: -17.422, intensity: 0.88 },
      { lat: 14.712, lng: -17.428, intensity: 0.82 },
      { lat: 14.705, lng: -17.420, intensity: 0.75 },
      { lat: 14.715, lng: -17.430, intensity: 0.70 },
      { lat: 14.760, lng: -17.465, intensity: 0.60 },
      { lat: 14.758, lng: -17.462, intensity: 0.55 },
      { lat: 14.762, lng: -17.468, intensity: 0.50 },
      { lat: 14.735, lng: -17.450, intensity: 0.35 },
      { lat: 14.740, lng: -17.445, intensity: 0.28 },
      { lat: 14.720, lng: -17.440, intensity: 0.20 },
    ],
    shoreline: [
      { lat: 14.700, lng: -17.435 }, { lat: 14.705, lng: -17.428 },
      { lat: 14.710, lng: -17.422 }, { lat: 14.718, lng: -17.418 },
      { lat: 14.725, lng: -17.425 }, { lat: 14.732, lng: -17.432 },
      { lat: 14.738, lng: -17.440 }, { lat: 14.745, lng: -17.448 },
      { lat: 14.752, lng: -17.455 }, { lat: 14.758, lng: -17.462 },
      { lat: 14.765, lng: -17.468 },
    ],
    shorelineBandWidthMeters: 60,
    shipAccessPoints: [
      { id: 'sap-001a', name: 'Hann Bay Jetty', lat: 14.708, lng: -17.427, type: 'DOCK' },
      { id: 'sap-001b', name: 'Yoff Beach Landing', lat: 14.757, lng: -17.464, type: 'BEACH_ACCESS' },
    ],
  },
  {
    id: 'po-002',
    name: 'Santo Domingo Harbour Cleanup',
    priority: 'HIGH',
    status: 'UPCOMING',
    startDate: '2026-04-01T00:00:00Z',
    endDate: '2026-05-10T00:00:00Z',
    location: { name: 'Santo Domingo, Dominican Republic', lat: 18.4861, lng: -69.9312 },
    estimatedPlasticTons: 540,
    estimatedItems: 648000,
    zones: [
      {
        id: 'z-002a', name: 'Ozama River Delta', estimatedTons: 310,
        polygon: [
          { lat: 18.470, lng: -69.880 }, { lat: 18.475, lng: -69.870 },
          { lat: 18.465, lng: -69.865 }, { lat: 18.460, lng: -69.875 },
        ],
      },
      { id: 'z-002b', name: 'Malecón Shore', estimatedTons: 150 },
      { id: 'z-002c', name: 'Sans Souci Cove', estimatedTons: 80 },
    ],
    heatmapPoints: [
      { lat: 18.470, lng: -69.875, intensity: 0.98 },
      { lat: 18.468, lng: -69.872, intensity: 0.90 },
      { lat: 18.472, lng: -69.878, intensity: 0.85 },
      { lat: 18.465, lng: -69.870, intensity: 0.70 },
      { lat: 18.490, lng: -69.910, intensity: 0.50 },
      { lat: 18.492, lng: -69.915, intensity: 0.45 },
      { lat: 18.488, lng: -69.920, intensity: 0.35 },
      { lat: 18.495, lng: -69.930, intensity: 0.25 },
    ],
    shoreline: [
      { lat: 18.458, lng: -69.882 }, { lat: 18.462, lng: -69.878 },
      { lat: 18.467, lng: -69.873 }, { lat: 18.472, lng: -69.870 },
      { lat: 18.478, lng: -69.875 }, { lat: 18.483, lng: -69.885 },
      { lat: 18.488, lng: -69.895 }, { lat: 18.491, lng: -69.908 },
      { lat: 18.493, lng: -69.918 }, { lat: 18.495, lng: -69.928 },
    ],
    shorelineBandWidthMeters: 60,
    shipAccessPoints: [
      { id: 'sap-002a', name: 'Ozama River Dock', lat: 18.469, lng: -69.877, type: 'DOCK' },
      { id: 'sap-002b', name: 'Sans Souci Marina', lat: 18.492, lng: -69.920, type: 'DOCK' },
    ],
  },
  {
    id: 'po-003',
    name: 'Recife Reef Recovery',
    priority: 'MEDIUM',
    status: 'ONGOING',
    startDate: '2026-01-20T00:00:00Z',
    endDate: '2026-03-01T00:00:00Z',
    location: { name: 'Recife, Brazil', lat: -8.0476, lng: -34.8770 },
    estimatedPlasticTons: 210,
    estimatedItems: 252000,
    zones: [
      { id: 'z-003a', name: 'Boa Viagem Beach', estimatedTons: 120 },
      {
        id: 'z-003b', name: 'Capibaribe Mouth', estimatedTons: 65,
        polygon: [
          { lat: -8.060, lng: -34.870 }, { lat: -8.055, lng: -34.865 },
          { lat: -8.065, lng: -34.860 }, { lat: -8.070, lng: -34.868 },
        ],
      },
      { id: 'z-003c', name: 'Pina Harbour', estimatedTons: 25 },
    ],
    heatmapPoints: [
      { lat: -8.050, lng: -34.875, intensity: 0.92 },
      { lat: -8.052, lng: -34.872, intensity: 0.80 },
      { lat: -8.048, lng: -34.878, intensity: 0.75 },
      { lat: -8.060, lng: -34.868, intensity: 0.60 },
      { lat: -8.063, lng: -34.865, intensity: 0.50 },
      { lat: -8.045, lng: -34.880, intensity: 0.30 },
    ],
    shoreline: [
      { lat: -8.042, lng: -34.882 }, { lat: -8.046, lng: -34.879 },
      { lat: -8.050, lng: -34.876 }, { lat: -8.054, lng: -34.873 },
      { lat: -8.058, lng: -34.870 }, { lat: -8.062, lng: -34.867 },
      { lat: -8.066, lng: -34.864 }, { lat: -8.070, lng: -34.862 },
    ],
    shorelineBandWidthMeters: 60,
    shipAccessPoints: [
      { id: 'sap-003a', name: 'Pina Harbour Wharf', lat: -8.063, lng: -34.866, type: 'DOCK' },
      { id: 'sap-003b', name: 'Boa Viagem Shore', lat: -8.048, lng: -34.879, type: 'BEACH_ACCESS' },
    ],
  },
  {
    id: 'po-004',
    name: 'Manila Bay Plastic Patrol',
    priority: 'HIGH',
    status: 'UPCOMING',
    startDate: '2026-06-01T00:00:00Z',
    location: { name: 'Manila, Philippines', lat: 14.5995, lng: 120.9842 },
    estimatedPlasticTons: 870,
    estimatedItems: 1044000,
    zones: [
      { id: 'z-004a', name: 'Pasig River Outflow', estimatedTons: 480 },
      { id: 'z-004b', name: 'Baseco Beach', estimatedTons: 250 },
      { id: 'z-004c', name: 'Navotas Fish Port', estimatedTons: 140 },
    ],
    heatmapPoints: [
      { lat: 14.600, lng: 120.970, intensity: 0.97 },
      { lat: 14.598, lng: 120.968, intensity: 0.90 },
      { lat: 14.602, lng: 120.972, intensity: 0.85 },
      { lat: 14.595, lng: 120.965, intensity: 0.72 },
      { lat: 14.610, lng: 120.980, intensity: 0.55 },
      { lat: 14.615, lng: 120.985, intensity: 0.40 },
      { lat: 14.620, lng: 120.990, intensity: 0.25 },
    ],
    shoreline: [
      { lat: 14.593, lng: 120.963 }, { lat: 14.596, lng: 120.967 },
      { lat: 14.600, lng: 120.971 }, { lat: 14.604, lng: 120.975 },
      { lat: 14.608, lng: 120.979 }, { lat: 14.612, lng: 120.983 },
      { lat: 14.616, lng: 120.987 }, { lat: 14.620, lng: 120.991 },
    ],
    shorelineBandWidthMeters: 60,
    shipAccessPoints: [
      { id: 'sap-004a', name: 'Manila South Harbor', lat: 14.597, lng: 120.966, type: 'DOCK' },
      { id: 'sap-004b', name: 'Baseco Beach Access', lat: 14.611, lng: 120.982, type: 'BEACH_ACCESS' },
    ],
  },
  {
    id: 'po-005',
    name: 'Thessaloniki Gulf Expedition',
    priority: 'LOW',
    status: 'COMPLETED',
    startDate: '2025-10-01T00:00:00Z',
    endDate: '2025-11-15T00:00:00Z',
    location: { name: 'Thessaloniki, Greece', lat: 40.6401, lng: 22.9444 },
    estimatedPlasticTons: 160,
    estimatedItems: 192000,
    zones: [
      { id: 'z-005a', name: 'Inner Harbour', estimatedTons: 90 },
      { id: 'z-005b', name: 'Thermaikos Shelf', estimatedTons: 50 },
      { id: 'z-005c', name: 'Axios Delta', estimatedTons: 20 },
    ],
    heatmapPoints: [
      { lat: 40.635, lng: 22.940, intensity: 0.85 },
      { lat: 40.637, lng: 22.942, intensity: 0.78 },
      { lat: 40.640, lng: 22.945, intensity: 0.60 },
      { lat: 40.645, lng: 22.950, intensity: 0.40 },
      { lat: 40.650, lng: 22.955, intensity: 0.20 },
    ],
    shoreline: [
      { lat: 40.633, lng: 22.938 }, { lat: 40.636, lng: 22.941 },
      { lat: 40.639, lng: 22.944 }, { lat: 40.642, lng: 22.947 },
      { lat: 40.645, lng: 22.950 }, { lat: 40.648, lng: 22.953 },
      { lat: 40.651, lng: 22.956 },
    ],
    shorelineBandWidthMeters: 60,
    shipAccessPoints: [
      { id: 'sap-005a', name: 'Thessaloniki Port', lat: 40.636, lng: 22.939, type: 'DOCK' },
    ],
  },
  {
    id: 'po-006',
    name: 'Abidjan Lagoon Rescue',
    priority: 'MEDIUM',
    status: 'UPCOMING',
    startDate: '2026-05-15T00:00:00Z',
    endDate: '2026-06-30T00:00:00Z',
    location: { name: 'Abidjan, Ivory Coast', lat: 5.3600, lng: -4.0083 },
    estimatedPlasticTons: 280,
    estimatedItems: 336000,
    zones: [
      { id: 'z-006a', name: 'Ebrié Lagoon North', estimatedTons: 160 },
      { id: 'z-006b', name: 'Vridi Canal', estimatedTons: 80 },
      { id: 'z-006c', name: 'Banco Park Shore', estimatedTons: 40 },
    ],
    heatmapPoints: [
      { lat: 5.365, lng: -4.010, intensity: 0.88 },
      { lat: 5.360, lng: -4.005, intensity: 0.75 },
      { lat: 5.355, lng: -4.012, intensity: 0.60 },
      { lat: 5.370, lng: -3.998, intensity: 0.45 },
      { lat: 5.350, lng: -4.020, intensity: 0.30 },
    ],
    shoreline: [
      { lat: 5.348, lng: -4.022 }, { lat: 5.352, lng: -4.018 },
      { lat: 5.356, lng: -4.013 }, { lat: 5.360, lng: -4.008 },
      { lat: 5.364, lng: -4.003 }, { lat: 5.368, lng: -3.999 },
      { lat: 5.372, lng: -3.996 },
    ],
    shorelineBandWidthMeters: 60,
    shipAccessPoints: [
      { id: 'sap-006a', name: 'Vridi Canal Dock', lat: 5.358, lng: -4.010, type: 'DOCK' },
      { id: 'sap-006b', name: 'Banco Shore Landing', lat: 5.370, lng: -3.998, type: 'BEACH_ACCESS' },
    ],
  },
  {
    id: 'po-007',
    name: 'Bali Strait Cleanup',
    priority: 'LOW',
    status: 'COMPLETED',
    startDate: '2025-08-01T00:00:00Z',
    endDate: '2025-09-20T00:00:00Z',
    location: { name: 'Bali, Indonesia', lat: -8.3405, lng: 115.0920 },
    estimatedPlasticTons: 95,
    estimatedItems: 114000,
    zones: [
      { id: 'z-007a', name: 'Kuta Beach', estimatedTons: 45 },
      { id: 'z-007b', name: 'Benoa Harbour', estimatedTons: 35 },
      { id: 'z-007c', name: 'Sanur Reef Flat', estimatedTons: 15 },
    ],
    heatmapPoints: [
      { lat: -8.335, lng: 115.090, intensity: 0.80 },
      { lat: -8.340, lng: 115.095, intensity: 0.65 },
      { lat: -8.345, lng: 115.088, intensity: 0.50 },
      { lat: -8.350, lng: 115.100, intensity: 0.30 },
    ],
    shoreline: [
      { lat: -8.333, lng: 115.088 }, { lat: -8.336, lng: 115.091 },
      { lat: -8.340, lng: 115.094 }, { lat: -8.344, lng: 115.092 },
      { lat: -8.348, lng: 115.096 }, { lat: -8.352, lng: 115.100 },
    ],
    shorelineBandWidthMeters: 60,
    shipAccessPoints: [
      { id: 'sap-007a', name: 'Benoa Harbour Dock', lat: -8.341, lng: 115.093, type: 'DOCK' },
      { id: 'sap-007b', name: 'Kuta Beach Access', lat: -8.335, lng: 115.089, type: 'BEACH_ACCESS' },
    ],
  },
];

export const PERSONAL_STATS: PersonalStats = {
  expeditionsCompleted: 4,
  wasteRemovedTons: 12.4,
  carbonLoweredTonsCO2e: 3.1,
  wildlifeProtectedCount: 240,
  coastlineImprovedKm: 18,
  hoursVolunteered: 320,
};

export function getMissions(): Mission[] {
  return MISSIONS;
}

export function getMissionById(id: string): Mission | undefined {
  return MISSIONS.find(m => m.id === id);
}

export function getPersonalStats(): PersonalStats {
  return PERSONAL_STATS;
}

/** Group missions by priority, maintaining order within each group. */
export function groupMissionsByPriority(missions: Mission[]): Record<MissionPriority, Mission[]> {
  const groups: Record<MissionPriority, Mission[]> = { HIGH: [], MEDIUM: [], LOW: [] };
  for (const m of missions) {
    groups[m.priority].push(m);
  }
  return groups;
}
