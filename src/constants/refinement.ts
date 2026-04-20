import { FeedbackDepth } from '../types';

export const DEPTH_CONFIG: Record<FeedbackDepth, { label: string; thinkingLevel: 'low' | 'default' | 'high' }> = {
  casual: { label: 'Casual Polish', thinkingLevel: 'low' },
  balanced: { label: 'Balanced Polish', thinkingLevel: 'default' },
  'in-depth': { label: 'In-depth Polish (High Fidelity)', thinkingLevel: 'high' },
};
