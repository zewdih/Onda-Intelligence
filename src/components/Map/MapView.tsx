import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Mission } from '../../types/mission';
import MissionMarker from './MissionMarker';
import { ZonePolygons } from './HeatOverlay';
import ShipParkingMarker from './ShipParkingMarker';
import TrashHotspotsPlaceholder from './TrashHotspotsPlaceholder';
import TrashHotspotsLayer from './TrashHotspotsLayer';
import { ENABLE_TRASH_HOTSPOTS_LAYER } from '../../config/featureFlags';

interface Props {
  mode: 'missions';
  center: { lat: number; lng: number };
  missions: Mission[];
  selectedMissionId: string | null;
  onSelectMission: (mission: Mission) => void;
  isDark: boolean;
  activeMission: Mission | null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 12, { duration: 1.2 }); }, [map, lat, lng]);
  return null;
}

export default function MapView({ center, missions, selectedMissionId, onSelectMission, isDark, activeMission }: Props) {
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const flyTarget = activeMission?.location ?? center;

  return (
    <div className="rounded-2xl overflow-hidden h-full relative" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)', minHeight: 400 }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />
        <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />
        {missions.map(m => (
          <MissionMarker
            key={m.id}
            mission={m}
            selected={selectedMissionId === m.id}
            onClick={() => onSelectMission(m)}
          />
        ))}
        {activeMission && (
          <>
            <ZonePolygons zones={activeMission.zones} />
            {ENABLE_TRASH_HOTSPOTS_LAYER && (
              <TrashHotspotsLayer areaId={activeMission.id} />
            )}
            {activeMission.shipAccessPoints.length > 0 && (
              <ShipParkingMarker accessPoint={activeMission.shipAccessPoints[0]} />
            )}
          </>
        )}
      </MapContainer>
      {activeMission && !ENABLE_TRASH_HOTSPOTS_LAYER && (
        <TrashHotspotsPlaceholder />
      )}
    </div>
  );
}
