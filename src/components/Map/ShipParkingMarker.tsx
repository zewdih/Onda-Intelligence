import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { ShipAccessPoint } from '../../types/mission';

function createShipParkingIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:#1e3a5f;
        border:3px solid #38bdf8;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 0 3px rgba(56,189,248,0.25), 0 2px 8px rgba(0,0,0,0.2);
        font-size:16px;line-height:1;
        cursor:pointer;
      ">
        <span style="filter:drop-shadow(0 1px 1px rgba(0,0,0,0.3));">⚓</span>
      </div>
    `,
  });
}

const shipParkingIcon = createShipParkingIcon();

interface Props {
  accessPoint: ShipAccessPoint;
}

export default function ShipParkingMarker({ accessPoint }: Props) {
  return (
    <Marker
      position={[accessPoint.lat, accessPoint.lng]}
      icon={shipParkingIcon}
    >
      <Tooltip direction="top" offset={[0, -20]} className="onda-tooltip">
        <span style={{ fontSize: 12 }}>
          ⚓ <strong>Ship Parking: {accessPoint.name}</strong>
          <br />
          <span style={{ fontSize: 11, opacity: 0.8 }}>
            {accessPoint.type === 'DOCK' ? 'Dock' : 'Beach Access'}
          </span>
        </span>
      </Tooltip>
    </Marker>
  );
}
