import { useState, useCallback } from 'react';
import type { Beach, TaskStatus, PolicySet, ActivityEntry } from '../types/domain';
import { loadBeachesForDistrict } from '../data/adapter';
import { getPolicySetForDistrict } from '../data/policiesAdapter';
import { generateSupportPlan, simulateReassessment } from '../utils/planEngine';

const STORE_KEY = 'onda-domain-store';
const ACTIVITY_KEY = 'onda-activity';

function loadPersisted(): Record<string, Beach> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate schema — if any beach lacks compliance, discard stale data
      const values = Object.values(parsed) as Beach[];
      if (values.length > 0 && !values[0].compliance) {
        localStorage.removeItem(STORE_KEY);
        return {};
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return {};
}

function persist(store: Record<string, Beach>) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function loadActivity(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function persistActivity(entries: ActivityEntry[]) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(entries.slice(0, 50)));
}

function addActivity(
  entries: ActivityEntry[],
  type: ActivityEntry['type'],
  beach: Beach,
  message: string,
): ActivityEntry[] {
  const entry: ActivityEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestampISO: new Date().toISOString(),
    type,
    beachName: beach.name,
    beachEmoji: beach.mascot.emoji,
    message,
  };
  const next = [entry, ...entries].slice(0, 50);
  persistActivity(next);
  return next;
}

export function useDomainStore() {
  const [store, setStore] = useState<Record<string, Beach>>(loadPersisted);
  const [policySet, setPolicySet] = useState<PolicySet | undefined>(undefined);
  const [activity, setActivity] = useState<ActivityEntry[]>(loadActivity);

  const initForDistrict = useCallback((districtId: string) => {
    const existing = loadPersisted();
    const fresh = loadBeachesForDistrict(districtId);
    const merged: Record<string, Beach> = {};
    for (const b of fresh) {
      merged[b.id] = existing[b.id] ?? b;
    }
    persist(merged);
    setStore(merged);
    setPolicySet(getPolicySetForDistrict(districtId));
  }, []);

  const beaches = Object.values(store);

  const getBeach = useCallback((id: string): Beach | undefined => store[id], [store]);

  const generatePlan = useCallback((beachId: string) => {
    setStore(prev => {
      const beach = prev[beachId];
      if (!beach) return prev;
      const ps = policySet;
      if (!ps) return prev;
      const plan = generateSupportPlan(beach, ps);
      const updated = { ...beach, interventions: [...beach.interventions, plan] };
      const next = { ...prev, [beachId]: updated };
      persist(next);
      setActivity(a => addActivity(a, 'plan_generated', beach, `Support plan generated for ${beach.name}`));
      return next;
    });
  }, [policySet]);

  const updateStepStatus = useCallback((beachId: string, planId: string, stepId: string, status: TaskStatus) => {
    setStore(prev => {
      const beach = prev[beachId];
      if (!beach) return prev;
      const interventions = beach.interventions.map(p => {
        if (p.id !== planId) return p;
        return { ...p, steps: p.steps.map(s => s.id === stepId ? { ...s, status } : s) };
      });
      const updated = { ...beach, interventions };
      const next = { ...prev, [beachId]: updated };
      persist(next);
      if (status === 'done') {
        const doneCount = interventions.find(p => p.id === planId)?.steps.filter(s => s.status === 'done').length ?? 0;
        setActivity(a => addActivity(a, 'tasks_completed', beach, `${doneCount} task${doneCount !== 1 ? 's' : ''} completed at ${beach.name}`));
      }
      return next;
    });
  }, []);

  const reassess = useCallback((beachId: string) => {
    setStore(prev => {
      const beach = prev[beachId];
      if (!beach) return prev;
      const updated = simulateReassessment(beach);
      const next = { ...prev, [beachId]: updated };
      persist(next);
      setActivity(a => addActivity(a, 'progress_check', beach, `Progress check performed at ${beach.name}`));
      if (updated.supportStatus !== beach.supportStatus) {
        setActivity(a => addActivity(a, 'status_change', updated,
          `${updated.name} moved to ${updated.supportStatus === 'steady' ? 'Steady' : updated.supportStatus === 'making_progress' ? 'Making Progress' : 'Needs Assistance'}`
        ));
      }
      return next;
    });
  }, []);

  const resetStore = useCallback(() => {
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
    setStore({});
    setActivity([]);
  }, []);

  return { beaches, getBeach, initForDistrict, generatePlan, updateStepStatus, reassess, resetStore, policySet, activity };
}

export type DomainStore = ReturnType<typeof useDomainStore>;
