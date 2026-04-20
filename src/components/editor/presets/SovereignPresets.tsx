import React from 'react';
import { SOVEREIGN_PRESETS, Preset } from '../../../constants/sovereignPresets';

interface SovereignPresetsProps {
  onSelect: (preset: Preset) => void;
  activePresetIds: string[];
}

export const SovereignPresets: React.FC<SovereignPresetsProps> = ({ onSelect, activePresetIds }) => {
  const chapterCoherence = SOVEREIGN_PRESETS.find(p => p.id === 'full-chapter-coherence');
  const otherPresets = SOVEREIGN_PRESETS.filter(p => p.id !== 'full-chapter-coherence');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Sovereign Presets</label>
        <span className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">One-Click Configuration</span>
      </div>

      {/* Special Chapter Coherence Preset */}
      {chapterCoherence && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-1 rounded-full bg-primary shadow-primary-glow" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-primary/60">Sovereign Integration</span>
          </div>
          <button
            key={chapterCoherence.id}
            onClick={() => onSelect(chapterCoherence)}
            className={`
              group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-500 text-left w-full
              ${activePresetIds.includes(chapterCoherence.id) 
                ? 'bg-primary/10 border-primary shadow-2xl scale-[1.01] z-10' 
                : 'bg-white/[0.02] border-white/5 hover:border-primary/30 hover:bg-white/[0.05] shadow-xl'
              }
            `}
          >
            <div className={`p-3 rounded-lg bg-surface-container-low border border-white/5 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${chapterCoherence.color}`}>
              {chapterCoherence.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className={`text-xs font-bold uppercase tracking-wider ${activePresetIds.includes(chapterCoherence.id) ? 'text-primary' : 'text-on-surface'}`}>
                  {chapterCoherence.name}
                </h4>
                <div className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                  <span className="text-[7px] font-bold text-primary uppercase tracking-tighter">Chapter Level</span>
                </div>
              </div>
              <p className="text-[9px] text-on-surface-variant/60 leading-relaxed font-medium max-w-2xl">
                {chapterCoherence.description}
              </p>
              {chapterCoherence.benefit && (
                <div className="mt-1.5 p-1.5 rounded bg-primary/5 border border-primary/10">
                  <p className="text-[9px] text-primary/80 font-medium italic">
                    <span className="font-bold uppercase tracking-wider not-italic mr-1">When to use:</span> 
                    {chapterCoherence.benefit}
                  </p>
                </div>
              )}
            </div>
            {activePresetIds.includes(chapterCoherence.id) && (
              <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-primary-glow" />
            )}
          </button>
        </div>
      )}

      {/* Categorized Presets */}
      <div className="space-y-6">
        {(['Structural', 'Character', 'Prose', 'Thematic', 'Pacing'] as const).map(category => {
          const categoryPresets = otherPresets.filter(p => p.category === category);
          if (categoryPresets.length === 0) return null;
          
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-1 rounded-full bg-on-surface-variant/20" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/40">{category} Refinement</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoryPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onSelect(preset)}
                    className={`
                      group relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 text-left
                      ${activePresetIds.includes(preset.id) 
                        ? 'bg-primary/5 border-primary shadow-lg scale-[1.02] z-10' 
                        : 'bg-white/[0.01] border-white/5 hover:border-outline-variant/30 hover:bg-white/[0.03]'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-lg bg-surface-container-low border border-white/5 shadow-inner transition-transform group-hover:scale-110 ${preset.color}`}>
                      {preset.icon}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <h4 className={`text-[9px] font-bold uppercase tracking-wider truncate ${activePresetIds.includes(preset.id) ? 'text-primary' : 'text-on-surface'}`}>
                        {preset.name}
                      </h4>
                      <p className="text-[8px] text-on-surface-variant/60 leading-tight font-medium line-clamp-2">
                        {preset.description}
                      </p>
                      {preset.benefit && (
                        <p className="text-[8px] text-primary/70 font-medium italic line-clamp-2 mt-0.5">
                          <span className="font-bold uppercase tracking-wider not-italic mr-1">Use when:</span>
                          {preset.benefit}
                        </p>
                      )}
                    </div>
                    {activePresetIds.includes(preset.id) && (
                      <div className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
