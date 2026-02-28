import type { Beach, PolicySet } from '../../types/domain';
import BeachCard from './BeachCard';

interface Props {
  beaches: Beach[];
  selectedId: string | null;
  onSelect: (beach: Beach) => void;
  policySet?: PolicySet;
}

export default function BeachList({ beaches, selectedId, onSelect, policySet }: Props) {
  return (
    <div
      className="h-full overflow-y-auto space-y-2 pr-1 rounded-2xl p-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
        Beaches ({beaches.length})
      </h2>
      {beaches.length === 0 && (
        <p className="text-sm p-4 text-center" style={{ color: 'var(--text-muted)' }}>No beaches loaded yet.</p>
      )}
      {beaches.map((beach, i) => (
        <BeachCard
          key={beach.id}
          beach={beach}
          selected={selectedId === beach.id}
          onClick={() => onSelect(beach)}
          policySet={policySet}
          index={i}
        />
      ))}
    </div>
  );
}
