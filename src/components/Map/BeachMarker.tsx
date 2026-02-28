import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Beach } from '../../types/domain';
import { STATUS_LABEL } from '../../utils/planEngine';

interface Props {
  beach: Beach;
  onClick: () => void;
}

function createIcon(beach: Beach): L.DivIcon {
  const needsHelp = beach.supportStatus === 'needs_assistance';
  const pulse = needsHelp
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid #f87171;opacity:0.4;animation:markerPulse 2s ease-in-out infinite;"></div>`
    : '';

  const bgColor = needsHelp ? '#fecdd3' : beach.supportStatus === 'making_progress' ? '#fef3c7' : '#d1fae5';
  const borderColor = needsHelp ? '#f87171' : beach.supportStatus === 'making_progress' ? '#fbbf24' : '#34d399';

  return L.divIcon({
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `
      <div style="position:relative;width:44px;height:44px;cursor:pointer;">
        ${pulse}
        <div style="
          width:44px;height:44px;border-radius:50%;
          background:${bgColor};
          border:3px solid ${borderColor};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.12);
          font-size:20px;line-height:1;
          transition:transform 0.2s;
          animation:float 3s ease-in-out infinite;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          ${beach.mascot.emoji}
        </div>
      </div>
    `,
  });
}

export default function BeachMarker({ beach, onClick }: Props) {
  return (
    <Marker
      position={[beach.location.lat, beach.location.lon]}
      icon={createIcon(beach)}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip direction="top" offset={[0, -24]} className="onda-tooltip">
        <span style={{ fontSize: 13 }}>
          {beach.mascot.emoji} <strong>{beach.name}</strong> — {STATUS_LABEL[beach.supportStatus]}
        </span>
      </Tooltip>
    </Marker>
  );
}
