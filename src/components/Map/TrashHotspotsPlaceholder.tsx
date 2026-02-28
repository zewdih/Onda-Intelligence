export default function TrashHotspotsPlaceholder() {
  return (
    <div
      className="absolute bottom-3 left-3 right-3 z-[500] rounded-xl p-4"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">🛰</span>
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold"
            style={{ color: 'var(--text)' }}
          >
            Trash Hotspots (Coming Soon)
          </h3>
          <p
            className="text-xs mt-1 leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            This layer will return once the drone-image model is trained to show
            precise trash locations.
          </p>
          <span
            className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-medium px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(251,191,36,0.12)',
              color: '#d97706',
              border: '1px solid rgba(251,191,36,0.25)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#d97706' }}
            />
            Model training in progress: YOLOv8-mseg
          </span>
        </div>
      </div>
    </div>
  );
}
