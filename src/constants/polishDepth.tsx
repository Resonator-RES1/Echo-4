import React from 'react';
import { FeedbackDepth, IntensityProfile } from '../types';
import { Zap, Scale, Search } from 'lucide-react';

export const INTENSITY_CONFIG: Record<FeedbackDepth, IntensityProfile> = {
  casual: { maxHealingPasses: 0, auditComplexity: 'standard', temperatureBias: 0.8 },
  balanced: { maxHealingPasses: 1, auditComplexity: 'ruthless', temperatureBias: 0.7 },
  'in-depth': { maxHealingPasses: 3, auditComplexity: 'exhaustive', temperatureBias: 0.6 },
};

export const DEPTH_CONFIG: Record<FeedbackDepth, { label: string; thinkingLevel: 'low' | 'default' | 'high'; icon: React.ReactNode; description: string }> = {
  casual: { 
    label: 'Casual', 
    thinkingLevel: 'low', 
    icon: <Zap className="w-4 h-4" />, 
    description: 'Quick, light polish for flow and clarity.' 
  },
  balanced: { 
    label: 'Balanced', 
    thinkingLevel: 'default', 
    icon: <Scale className="w-4 h-4" />, 
    description: 'Standard refinement for professional prose.' 
  },
  'in-depth': { 
    label: 'In-depth', 
    thinkingLevel: 'high', 
    icon: <Search className="w-4 h-4" />, 
    description: 'Deep stylistic overhaul and narrative audit.' 
  },
};

export const REVIEW_DEPTH_CONFIG: Record<FeedbackDepth, { label: string; thinkingLevel: 'low' | 'default' | 'high'; icon: React.ReactNode; description: string }> = {
  casual: { 
    label: 'Casual', 
    thinkingLevel: 'low', 
    icon: <Zap className="w-4 h-4" />, 
    description: 'Quick check for glaring errors.' 
  },
  balanced: { 
    label: 'Balanced', 
    thinkingLevel: 'default', 
    icon: <Scale className="w-4 h-4" />, 
    description: 'Thorough review of prose and logic.' 
  },
  'in-depth': { 
    label: 'In-depth', 
    thinkingLevel: 'high', 
    icon: <Search className="w-4 h-4" />, 
    description: 'Comprehensive audit of all narrative layers.' 
  },
};

export const REACTION_DEPTH_CONFIG: Record<FeedbackDepth, { label: string; thinkingLevel: 'low' | 'default' | 'high'; icon: React.ReactNode; description: string }> = {
  casual: { 
    label: 'Quick', 
    thinkingLevel: 'low', 
    icon: <Zap className="w-4 h-4" />, 
    description: 'Immediate impressions and vibes.' 
  },
  balanced: { 
    label: 'Balanced', 
    thinkingLevel: 'default', 
    icon: <Scale className="w-4 h-4" />, 
    description: 'Thoughtful reaction to scene and character.' 
  },
  'in-depth': { 
    label: 'Deep', 
    thinkingLevel: 'high', 
    icon: <Search className="w-4 h-4" />, 
    description: 'Profound analysis of emotional and thematic resonance.' 
  },
};
