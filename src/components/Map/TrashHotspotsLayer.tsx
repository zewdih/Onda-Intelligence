import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { getHotspots } from '../../services/hotspotsService';
import type { HotspotFeatureCollection } from '../../types/hotspot';

interface Props {
  areaId: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Stub component for rendering trash hotspot detections on the map.
 * When the YOLOv8-mseg model is deployed and getHotspots() returns real data,
 * this component will render GeoJSON polygon features on the Leaflet map.
 *
 * Currently shows a lightweight "Hotspots ready" label when the feature flag
 * VITE_ENABLE_TRASH_HOTSPOTS_LAYER is true.
 */
export default function TrashHotspotsLayer({ areaId, dateFrom, dateTo }: Props) {
  const map = useMap();
  const [data, setData] = useState<HotspotFeatureCollection | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHotspots({ areaId, dateFrom, dateTo }).then(fc => {
      if (!cancelled) setData(fc);
    });
    return () => { cancelled = true; };
  }, [areaId, dateFrom, dateTo]);

  useEffect(() => {
    if (!data || data.features.length === 0 || !map) return;

    // TODO: Render GeoJSON features as vector layers on the map.
    // Example (once real data is available):
    // const layer = L.geoJSON(data, { style: ... }).addTo(map);
    // return () => { layer.remove(); };
  }, [map, data]);

  if (!data || data.features.length === 0) {
    return null;
  }

  return null;
}
