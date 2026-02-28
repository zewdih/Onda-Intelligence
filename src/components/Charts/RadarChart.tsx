// Custom SVG radar/spider chart — no external dependencies.

interface RadarDataPoint {
  label: string;
  values: { name: string; value: number; color: string }[];
}

interface Props {
  axes: RadarDataPoint[];
  size?: number;
}

const PASTEL_FILLS = [
  'rgba(56,189,248,0.15)',
  'rgba(167,139,250,0.15)',
  'rgba(251,191,36,0.15)',
  'rgba(52,211,153,0.15)',
];

export default function RadarChart({ axes, size = 260 }: Props) {
  if (axes.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 40;
  const angleStep = (2 * Math.PI) / axes.length;

  // How many data series
  const seriesCount = axes[0]?.values.length ?? 0;

  function polarToXY(index: number, value: number): [number, number] {
    const angle = angleStep * index - Math.PI / 2;
    return [cx + r * value * Math.cos(angle), cy + r * value * Math.sin(angle)];
  }

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* Grid */}
      {rings.map(ring => {
        const points = axes.map((_, i) => polarToXY(i, ring)).map(p => p.join(',')).join(' ');
        return <polygon key={ring} points={points} fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.5" />;
      })}

      {/* Axes */}
      {axes.map((_, i) => {
        const [x, y] = polarToXY(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="1" opacity="0.3" />;
      })}

      {/* Data polygons */}
      {Array.from({ length: seriesCount }).map((_, si) => {
        const points = axes.map((axis, i) => {
          const val = Math.max(0, Math.min(1, axis.values[si]?.value ?? 0));
          return polarToXY(i, val);
        });
        const pathStr = points.map(p => p.join(',')).join(' ');
        const color = axes[0].values[si]?.color ?? '#38bdf8';

        return (
          <g key={si}>
            <polygon
              points={pathStr}
              fill={PASTEL_FILLS[si % PASTEL_FILLS.length]}
              stroke={color}
              strokeWidth="2"
              opacity="0.85"
            />
            {points.map(([px, py], pi) => (
              <circle key={pi} cx={px} cy={py} r="3.5" fill={color} stroke="var(--bg-card)" strokeWidth="1.5" />
            ))}
          </g>
        );
      })}

      {/* Labels */}
      {axes.map((axis, i) => {
        const [x, y] = polarToXY(i, 1.18);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--text-muted)"
            fontSize="9"
            fontWeight="500"
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}
