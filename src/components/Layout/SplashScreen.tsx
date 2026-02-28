interface Props {
  visible: boolean;
}

export default function SplashScreen({ visible }: Props) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="absolute rounded-full"
        style={{ width: 280, height: 280, background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)', animation: 'splashGlow 2.5s ease-in-out infinite' }}
      />
      <div className="text-5xl mb-4" style={{ animation: 'float 2s ease-in-out infinite' }}>🌊</div>
      <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--text)', animation: 'splashFadeUp 0.8s ease-out 0.2s both' }}>
        Onda Intelligence
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)', animation: 'splashFadeUp 0.8s ease-out 0.5s both' }}>
        Let's help our coastline thrive
      </p>
      <svg className="w-6 h-6" viewBox="0 0 24 24" style={{ animation: 'splashSpin 1.2s linear infinite' }}>
        <circle cx="12" cy="12" r="10" fill="none" stroke="var(--border)" strokeWidth="2" />
        <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </svg>
    </div>
  );
}
