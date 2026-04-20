import React from 'react';
import { Settings2, Sparkles } from 'lucide-react';

interface ScopeModifiersProps {
  refinementScope: 'scene' | 'chapter';
  setRefinementScope: (scope: 'scene' | 'chapter') => void;
  isSurgicalMode: boolean;
  setIsSurgicalMode: (mode: boolean) => void;
  hasSelection: boolean;
}

export const ScopeModifiers: React.FC<ScopeModifiersProps> = ({
  refinementScope,
  setRefinementScope,
  isSurgicalMode,
  setIsSurgicalMode,
  hasSelection
}) => {
  return (
    <div className="bg-surface-container-high/30 rounded-xl p-4 border border-white/5 space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Settings2 className="w-3.5 h-3.5 text-primary" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface">Audit Scope & Modifiers</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scope Toggle */}
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Audit Scope</label>
          <div className="flex bg-surface-container-highest/20 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setRefinementScope('scene')}
              className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${refinementScope === 'scene' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5'}`}
            >
              Scene Refinement
            </button>
            <button
              onClick={() => setRefinementScope('chapter')}
              className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all ${refinementScope === 'chapter' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5'}`}
            >
              Chapter Refinement
            </button>
          </div>
          <p className="text-[8px] text-on-surface-variant/50 italic px-1">
            {refinementScope === 'scene' ? 'Audit the current scene draft.' : 'Audit the entire chapter manuscript.'}
          </p>
        </div>

        {/* Surgical Modifier */}
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Surgical Modifier</label>
          <button
            onClick={() => hasSelection && setIsSurgicalMode(!isSurgicalMode)}
            disabled={!hasSelection}
            className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${!hasSelection ? 'opacity-50 cursor-not-allowed bg-surface-container-highest/10 border-white/5' : isSurgicalMode ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface-container-highest/20 border-white/5 text-on-surface-variant hover:bg-surface-container-highest/40'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSurgicalMode ? 'bg-primary border-primary text-on-primary' : 'border-on-surface-variant/30'}`}>
                {isSurgicalMode && <Sparkles className="w-2 h-2" />}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">Surgical Mode</span>
            </div>
            {hasSelection && (
              <span className="text-[8px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                Selection Active
              </span>
            )}
          </button>
          <p className="text-[8px] text-on-surface-variant/50 italic px-1">
            {hasSelection ? 'Restrict the audit strictly to the selected text.' : 'Select text in the editor to enable Surgical Mode.'}
          </p>
        </div>
      </div>
    </div>
  );
};
