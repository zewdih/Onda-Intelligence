import type { Beach } from '../../types/domain';
import { mascotMessage } from '../../utils/messaging';

export default function SpeechBubble({ beach }: { beach: Beach }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-3xl flex-shrink-0" style={{ animation: 'float 3s ease-in-out infinite' }}>
        {beach.mascot.emoji}
      </div>
      <div
        className="relative rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
      >
        <strong>{beach.mascot.label}</strong> says: "{mascotMessage(beach)}"
      </div>
    </div>
  );
}
