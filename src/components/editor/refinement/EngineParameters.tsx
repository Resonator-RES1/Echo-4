import React from 'react';
import { Settings2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ModelSelector } from '../presets/ModelSelector';
import { PolishDepthSelector } from '../presets/PolishDepthSelector';
import { DraftingStance, FeedbackDepth } from '../../../types';

interface EngineParametersProps {
  model: string;
  setModel: (model: string) => void;
  refinementThinkingLevel: 'minimal' | 'low' | 'medium' | 'default' | 'high';
  setRefinementThinkingLevel: (level: 'minimal' | 'low' | 'medium' | 'default' | 'high') => void;
  reportModel: string;
  setReportModel: (model: string) => void;
  reportThinkingLevel: 'minimal' | 'low' | 'medium' | 'default' | 'high';
  setReportThinkingLevel: (level: 'minimal' | 'low' | 'medium' | 'default' | 'high') => void;
  feedbackDepth: FeedbackDepth;
  setFeedbackDepth: (depth: FeedbackDepth) => void;
  creativeTension: number;
  setCreativeTension: (tension: number) => void;
  reportTemperature: number;
  setReportTemperature: (temp: number) => void;
  cognitivePressure: number;
  draftingStance: DraftingStance;
  setDraftingStance: (stance: DraftingStance) => void;
}

export const EngineParameters: React.FC<EngineParametersProps> = ({
  model,
  setModel,
  refinementThinkingLevel,
  setRefinementThinkingLevel,
  reportModel,
  setReportModel,
  reportThinkingLevel,
  setReportThinkingLevel,
  feedbackDepth,
  setFeedbackDepth,
  creativeTension,
  setCreativeTension,
  reportTemperature,
  setReportTemperature,
  cognitivePressure,
  draftingStance,
  setDraftingStance
}) => {
  const getPressureColor = () => {
    if (cognitivePressure > 100) return 'bg-error';
    if (cognitivePressure > 80) return 'bg-accent-amber';
    if (cognitivePressure > 60) return 'bg-primary';
    return 'bg-accent-emerald';
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    
    // SOVEREIGN MANDATE: Lite models cannot sustain the cognitive pressure of In-depth refinement.
    const isLite = newModel.includes('lite');
    if (isLite && feedbackDepth === 'in-depth') {
      setFeedbackDepth('balanced');
    }
  };

  return (
    <div className="bg-surface-container-high/30 rounded-xl p-4 border border-white/5 space-y-6">
      <div className="flex items-center gap-2 px-1">
        <Settings2 className="w-3.5 h-3.5 text-primary" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface">Engine Parameters</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Drafting Stance</label>
        <select
          value={draftingStance}
          onChange={(e) => setDraftingStance(e.target.value as DraftingStance)}
          className="w-full bg-black/40 border border-primary/30 rounded-lg px-2 py-1.5 text-xs outline-none text-on-surface font-bold focus:border-primary transition-colors appearance-none"
        >
          <option value="Standard Prose">Standard Prose</option>
          <option value="Treatment Expansion">Treatment Expansion (Bullets to Prose)</option>
          <option value="Script-to-Prose">Script-to-Prose</option>
          <option value="Vomit Refinement">Vomit Refinement (Aggressive Cleanup)</option>
          <option value="Epistolary">Epistolary (Document Realism)</option>
        </select>
        <p className="text-[8px] text-on-surface-variant/40 italic">Instructs the engine on how to interpret the raw draft.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Refinement Intelligence Model</label>
        <ModelSelector 
          selectedModel={model}
          setSelectedModel={handleModelChange}
          selectedThinkingLevel={refinementThinkingLevel}
          setSelectedThinkingLevel={setRefinementThinkingLevel}
        />
      </div>
      
      <div className="space-y-1.5">
        <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Report Intelligence Model</label>
        <ModelSelector 
          selectedModel={reportModel}
          setSelectedModel={setReportModel}
          selectedThinkingLevel={reportThinkingLevel}
          setSelectedThinkingLevel={setReportThinkingLevel}
        />
      </div>
      
      <PolishDepthSelector 
        feedbackDepth={feedbackDepth} 
        setFeedbackDepth={setFeedbackDepth} 
        mode="collaborative"
      />

      <div className="space-y-3">
        <div className="flex justify-between items-end px-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Refinement Creative Tension</span>
            <span className="text-[7px] font-bold text-on-surface-variant/30 uppercase tracking-tighter">Continuity vs. Expansion</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
            {creativeTension.toFixed(1)}
          </span>
        </div>
        <input 
          type="range"
          min="0.7"
          max="1.2"
          step="0.1"
          value={creativeTension}
          onChange={(e) => setCreativeTension(parseFloat(e.target.value))}
          className="w-full h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between px-1">
          <span className="text-[7px] font-bold uppercase tracking-wider text-on-surface-variant/30">Strict Continuity</span>
          <span className="text-[7px] font-bold uppercase tracking-wider text-on-surface-variant/30">Sensory Expansion</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end px-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Report Creative Tension</span>
            <span className="text-[7px] font-bold text-on-surface-variant/30 uppercase tracking-tighter">Analytical Stability</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
            {reportTemperature.toFixed(1)}
          </span>
        </div>
        <input 
          type="range"
          min="0.0"
          max="2.0"
          step="0.1"
          value={reportTemperature}
          onChange={(e) => setReportTemperature(parseFloat(e.target.value))}
          className="w-full h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Context Meter */}
      <div className="space-y-2 pt-3 border-t border-white/5">
        <div className="flex justify-between items-end px-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-bold uppercase tracking-wider text-on-surface-variant/50">Cognitive Pressure</span>
            <span className="text-[7px] font-bold text-on-surface-variant/30 uppercase tracking-tighter">Context + Focus + Depth</span>
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-wider ${cognitivePressure > 90 ? 'text-error' : 'text-on-surface-variant/50'}`}>
            {Math.round(cognitivePressure)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${cognitivePressure}%` }}
            className={`h-full transition-all duration-500 ease-out ${getPressureColor()}`}
          />
        </div>
        {cognitivePressure > 80 && (
          <p className={`text-[8px] font-bold italic flex items-center gap-1 px-1 ${cognitivePressure > 100 ? 'text-error' : 'text-accent-amber'}`}>
            <AlertCircle className="w-2.5 h-2.5" />
            {cognitivePressure > 100 ? 'Engine Saturation: Precision Loss Likely.' : 'Cognitive Overload Imminent.'}
          </p>
        )}
      </div>
    </div>
  );
};
