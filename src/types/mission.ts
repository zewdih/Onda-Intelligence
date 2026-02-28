export type MissionStatus = 'ONGOING' | 'UPCOMING' | 'COMPLETED';
export type MissionPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface MissionZone {
  id: string;
  name: string;
  estimatedTons: number;
  polygon?: Array<{ lat: number; lng: number }>;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // 0–1
}

export interface ShipAccessPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'DOCK' | 'BEACH_ACCESS';
}

export interface Mission {
  id: string;
  name: string;
  priority: MissionPriority;
  status: MissionStatus;
  startDate: string; // ISO
  endDate?: string;  // ISO
  location: { name: string; lat: number; lng: number };
  estimatedPlasticTons: number;
  estimatedItems: number;
  zones: MissionZone[];
  heatmapPoints: HeatmapPoint[];
  shoreline: Array<{ lat: number; lng: number }>;
  shorelineBandWidthMeters: number;
  shipAccessPoints: ShipAccessPoint[];
}

export interface PersonalStats {
  expeditionsCompleted: number;
  wasteRemovedTons: number;
  carbonLoweredTonsCO2e: number;
  wildlifeProtectedCount: number;
  coastlineImprovedKm: number;
  hoursVolunteered: number;
}
