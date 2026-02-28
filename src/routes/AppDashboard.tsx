import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Mission } from '../types/mission';
import { getStoredTheme } from '../utils/theme';
import { getMissions, getMissionById } from '../data/missions';
import MetricsRow from '../components/Dashboard/MetricsRow';
import MapView from '../components/Map/MapView';
import MissionSidebar from '../components/Missions/MissionSidebar';
import MissionDetailPanel from '../components/Missions/MissionDetailPanel';

export default function AppDashboard() {
  const [searchParams] = useSearchParams();
  const missions = getMissions();
  const isDark = getStoredTheme() === 'dark';

  // Support deep-linking from Home: /missions?selected=po-001
  const preselectedId = searchParams.get('selected');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  useEffect(() => {
    if (preselectedId) {
      const found = getMissionById(preselectedId);
      if (found) setSelectedMission(found);
    }
  }, [preselectedId]);

  // Mission metrics
  const ongoingCount = missions.filter(m => m.status === 'ONGOING').length;
  const upcomingCount = missions.filter(m => m.status === 'UPCOMING').length;
  const totalMissionTons = missions.reduce((s, m) => s + m.estimatedPlasticTons, 0);
  const highPriorityCount = missions.filter(m => m.priority === 'HIGH').length;

  return (
    <div className="space-y-4">
      {/* Metrics row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <MetricsRow items={[
          { label: 'Total Missions', value: String(missions.length) },
          { label: 'Ongoing', value: String(ongoingCount), color: '#38bdf8' },
          { label: 'Upcoming', value: String(upcomingCount), color: '#fbbf24' },
          { label: 'High Priority', value: String(highPriorityCount), color: '#f87171' },
          { label: 'Est. Plastic (t)', value: String(totalMissionTons) },
        ]} />
      </motion.div>

      {/* 3-column grid: list | map | detail */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: selectedMission
            ? 'minmax(240px, 280px) 1fr minmax(320px, 380px)'
            : 'minmax(240px, 300px) 1fr',
          height: 'calc(100vh - 240px)',
          minHeight: 450,
        }}
      >
        <MissionSidebar
          missions={missions}
          selectedId={selectedMission?.id ?? null}
          onSelect={setSelectedMission}
        />

        <MapView
          mode="missions"
          center={{ lat: 20, lng: 0 }}
          missions={missions}
          selectedMissionId={selectedMission?.id ?? null}
          onSelectMission={setSelectedMission}
          isDark={isDark}
          activeMission={selectedMission}
        />

        {selectedMission && (
          <MissionDetailPanel
            mission={selectedMission}
            onClose={() => setSelectedMission(null)}
          />
        )}
      </div>
    </div>
  );
}
