import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MissionZone } from '../../types/mission';

export function ZonePolygons({ zones }: { zones: MissionZone[] }) {
  const map = useMap();

  useEffect(() => {
    const layers: L.Polygon[] = [];
    for (const z of zones) {
      if (!z.polygon || z.polygon.length < 3) continue;
      const poly = L.polygon(
        z.polygon.map(p => [p.lat, p.lng] as L.LatLngTuple),
        { color: '#38bdf8', weight: 2, fillOpacity: 0.1, dashArray: '6 4' },
      ).addTo(map);
      poly.bindTooltip(`${z.name} (~${z.estimatedTons}t)`, { sticky: true });
      layers.push(poly);
    }
    return () => layers.forEach(l => l.remove());
  }, [map, zones]);

  return null;
}
