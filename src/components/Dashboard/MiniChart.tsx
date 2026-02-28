interface Props {
  data: number[];
  width?: number;
  height?: number;
}

export default function MiniChart({ data, width = 200, height = 60 }: Props) {
  if (data.length < 2) return null;

  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L${pad + w},${pad + h} L${pad},${pad + h} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="mcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#mcGrad)" />
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * w;
        const y = pad + h - ((v - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" stroke="var(--bg)" strokeWidth="1.5" />;
      })}
    </svg>
  );
}