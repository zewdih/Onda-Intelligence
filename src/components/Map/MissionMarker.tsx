import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Mission } from '../../types/mission';

const STATUS_COLOR: Record<string, { bg: string; border: string }> = {
  ONGOING: { bg: '#bae6fd', border: '#38bdf8' },
  UPCOMING: { bg: '#fef3c7', border: '#fbbf24' },
  COMPLETED: { bg: '#d1fae5', border: '#34d399' },
};

function createIcon(mission: Mission, selected: boolean): L.DivIcon {
  const colors = STATUS_COLOR[mission.status] ?? STATUS_COLOR.ONGOING;
  const pulse = mission.status === 'ONGOING'
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${colors.border};opacity:0.4;animation:markerPulse 2s ease-in-out infinite;"></div>`
    : '';

  return L.divIcon({
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `
      <div style="position:relative;width:44px;height:44px;cursor:pointer;">
        ${pulse}
        <div style="
          width:44px;height:44px;border-radius:50%;
          background:${colors.bg};
          border:3px solid ${colors.border};
          display:flex;align-items:center;justify-content:center;
          box-shadow:${selected ? `0 0 0 3px ${colors.border}40,` : ''} 0 2px 8px rgba(0,0,0,0.12);
          font-size:20px;line-height:1;
          transition:transform 0.2s;
          animation:float 3s ease-in-out infinite;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          🚢
        </div>
      </div>
    `,
  });
}

interface Props {
  mission: Mission;
  selected: boolean;
  onClick: () => void;
}

export default function MissionMarker({ mission, selected, onClick }: Props) {
  return (
    <Marker
      position={[mission.location.lat, mission.location.lng]}
      icon={createIcon(mission, selected)}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip direction="top" offset={[0, -24]} className="onda-tooltip">
        <span style={{ fontSize: 13 }}>
          🚢 <strong>{mission.name}</strong> — {mission.status}
        </span>
      </Tooltip>
    </Marker>
  );
}
