// Mascot speech bubble message generator.
// Messages react to beach state (supportive, not punitive).

import type { Beach } from '../types/domain';

const NEEDS_ASSISTANCE_MESSAGES: Record<string, string[]> = {
  sea_turtle: [
    "I could use a little help — let's focus on bins near the entrances!",
    "The tide brought a lot in today. A cleanup would make a big difference!",
  ],
  seal: [
    "My resting spots are getting cluttered. Can we get some help here?",
    "I know we can turn this around — let's start with the storm drains!",
  ],
  dolphin: [
    "The water's been murky lately. Some upstream attention would really help!",
    "I'm hopeful! A few targeted actions could make things much better.",
  ],
  seabird: [
    "There's a lot of debris in my nesting area. Let's tackle it together!",
    "I've seen worse — with the right plan, this beach will bounce back.",
  ],
  otter: [
    "My kelp beds are getting tangled with trash. Let's clean up!",
    "A few bins and a cleanup crew would do wonders here.",
  ],
  whale: [
    "Even small actions on shore make a big difference out at sea!",
    "This coastline needs some love. Let's build a plan together.",
  ],
  crab: [
    "Hard to find a clean spot to burrow! Let's get some support.",
    "The sand here has a lot of debris. Can we get a cleanup going?",
  ],
};

const MAKING_PROGRESS_MESSAGES: Record<string, string[]> = {
  sea_turtle: [
    "Things are looking up! Keep the momentum going!",
    "I can see the difference already — nice work, team!",
  ],
  seal: [
    "My beach is getting better! Let's keep pushing forward.",
    "Great progress — the community cleanups are really paying off!",
  ],
  dolphin: [
    "The water's clearing up! Those barrier nets are working.",
    "We're on the right track — just a few more steps to go!",
  ],
  seabird: [
    "I'm finding cleaner nesting spots! Thank you for the effort.",
    "Each cleanup makes a difference — keep it up!",
  ],
  otter: [
    "My favorite spots are getting cleaner! Love the progress.",
    "The recycling stations are helping a lot — nice addition!",
  ],
  whale: [
    "I can tell you're making an impact from out here!",
    "Steady improvements — that's how lasting change happens.",
  ],
  crab: [
    "The sand is getting cleaner! Good work, everyone!",
    "I can actually burrow in peace now — things are improving!",
  ],
};

const STEADY_MESSAGES: Record<string, string[]> = {
  sea_turtle: [
    "This beach is in great shape! Let's keep it that way.",
    "Holding steady — I feel safe nesting here. Thank you!",
  ],
  seal: [
    "Love my clean resting spot! Maintenance mode looks good.",
    "Everything's running smoothly — small touches keep it perfect.",
  ],
  dolphin: [
    "Crystal clear waters! This is how it should be.",
    "Steady and clean — a model for other beaches!",
  ],
  seabird: [
    "Perfect conditions for my family. Keep up the great stewardship!",
    "This beach is a safe haven — let's maintain this standard!",
  ],
  otter: [
    "Clean kelp, clean water, happy otter! Thank you!",
    "This beach is thriving — a true success story.",
  ],
  whale: [
    "Seeing this coastline healthy makes my heart sing!",
    "Every clean beach matters for the whole ocean. Great job!",
  ],
  crab: [
    "Perfect sand for burrowing! This beach is well cared for.",
    "Steady and clean — just the way I like it!",
  ],
};

export function mascotMessage(beach: Beach): string {
  const animal = beach.mascot.animal;
  let pool: string[];

  switch (beach.supportStatus) {
    case 'needs_assistance':
      pool = NEEDS_ASSISTANCE_MESSAGES[animal] ?? ["This beach could use extra support right now."];
      break;
    case 'making_progress':
      pool = MAKING_PROGRESS_MESSAGES[animal] ?? ["We're getting there! Keep up the good work!"];
      break;
    case 'steady':
      pool = STEADY_MESSAGES[animal] ?? ["Holding steady — small changes make a big difference."];
      break;
  }

  // Deterministic pick based on beach id hash
  let h = 0;
  for (let i = 0; i < beach.id.length; i++) h = ((h << 5) - h + beach.id.charCodeAt(i)) | 0;
  return pool[Math.abs(h) % pool.length];
}
