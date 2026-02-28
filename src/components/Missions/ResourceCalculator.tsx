import { useState } from 'react';
import { computeResources, deriveDurationDays } from '../../utils/missionCalculator';

interface Props {
  defaultTons: number;
  startDate: string;
  endDate?: string;
}

export default function ResourceCalculator({ defaultTons, startDate, endDate }: Props) {
  const defaultDays = deriveDurationDays(startDate, endDate);

  const [tons, setTons] = useState(defaultTons);
  const [rate, setRate] = useState(0.05);
  const [ppShip, setPpShip] = useState(12);
  const [days, setDays] = useState(defaultDays);
  const [showAssumptions, setShowAssumptions] = useState(false);

  const result = computeResources({
    totalPlasticTons: tons,
    extractionRatePerPersonPerDay: rate,
    peoplePerShip: ppShip,
    durationDays: days,
  });

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
        Resource Calculator
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Total plastic (tons)</span>
          <input
            type="number" min={0} step={1} value={tons}
            onChange={e => setTons(Math.max(0, +e.target.value))}
            className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </label>
        <label className="space-y-1">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Rate (t/person/day)</span>
          <input
            type="number" min={0.001} step={0.01} value={rate}
            onChange={e => setRate(Math.max(0.001, +e.target.value))}
            className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </label>
        <label className="space-y-1">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>People per ship</span>
          <input
            type="number" min={1} step={1} value={ppShip}
            onChange={e => setPpShip(Math.max(1, Math.round(+e.target.value)))}
            className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </label>
        <label className="space-y-1">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Duration (days)</span>
          <input
            type="number" min={1} step={1} value={days}
            onChange={e => setDays(Math.max(1, Math.round(+e.target.value)))}
            className="w-full px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </label>
      </div>

      {/* Results */}
      {result.valid ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{result.peopleRequired}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>People required</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent2)' }}>{result.shipsRequired}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Ships required</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-3 text-center text-xs" style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171' }}>
          {result.error}
        </div>
      )}

      {/* Assumptions toggle */}
      <button
        onClick={() => setShowAssumptions(!showAssumptions)}
        className="text-[11px] font-medium"
        style={{ color: 'var(--accent)' }}
      >
        {showAssumptions ? '▾ Hide' : '▸ Show'} Assumptions
      </button>
      {showAssumptions && (
        <div className="text-[11px] space-y-1 pl-2" style={{ color: 'var(--text-muted)' }}>
          <p><strong>Formula:</strong></p>
          <p>people = ⌈ totalTons / (rate × days) ⌉</p>
          <p>ships = ⌈ people / peoplePerShip ⌉</p>
          <p className="mt-1"><strong>Defaults:</strong> 0.05 t/person/day extraction rate, 12 crew per ship, duration derived from mission dates (fallback 7 days).</p>
        </div>
      )}
    </div>
  );
}
