export const VIBE_PALETTE: Record<string, string> = {
  'Atmospheric': 'bg-blue-400',
  'Tense': 'bg-amber-500',
  'Action-Oriented': 'bg-red-500',
  'Melancholic': 'bg-indigo-400',
  'Hopeful': 'bg-emerald-400',
  'Surreal': 'bg-purple-400',
  'Clinical': 'bg-slate-400',
  'Visceral': 'bg-orange-600',
  'Whimsical': 'bg-pink-400',
  'Nostalgic': 'bg-sepia-400',
  'Default': 'bg-outline-variant/20'
};

export const getVibeColor = (vibe: string): string => {
  return VIBE_PALETTE[vibe] || VIBE_PALETTE['Default'];
};
