import React from 'react';
import { Sparkles, Check, Plus } from 'lucide-react';
import { PromptFragment } from '../../../types';
import { usePromptStore } from '../../../stores/usePromptStore';
import { useConfigStore } from '../../../stores/useConfigStore';

export const FragmentSelector: React.FC = () => {
  const fragments = usePromptStore(state => state.fragments);
  const activeFragmentIds = useConfigStore(state => state.activeFragmentIds);
  const setActiveFragmentIds = useConfigStore(state => state.setActiveFragmentIds);

  const toggleFragment = (id: string) => {
    if (activeFragmentIds.includes(id)) {
      setActiveFragmentIds(activeFragmentIds.filter(fid => fid !== id));
    } else {
      setActiveFragmentIds([...activeFragmentIds, id]);
    }
  };

  if (fragments.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50 flex items-center gap-2">
          <Sparkles className="w-3 h-3" /> Active Prompt Fragments
        </label>
        <span className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">
          {activeFragmentIds.length} Selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {fragments.map(fragment => {
          const isActive = activeFragmentIds.includes(fragment.id);
          return (
            <button
              key={fragment.id}
              onClick={() => toggleFragment(fragment.id)}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all text-left group ${
                isActive 
                  ? 'bg-secondary/10 border-secondary/30 ring-1 ring-secondary/20' 
                  : 'bg-surface-container-highest/10 border-white/5 hover:border-secondary/20 hover:bg-secondary/5'
              }`}
            >
              <div className={`mt-0.5 w-3.5 h-3.5 rounded bg-surface-container-low border flex items-center justify-center transition-all ${
                isActive ? 'bg-secondary border-secondary text-secondary-foreground' : 'border-outline-variant/30'
              }`}>
                {isActive && <Check className="w-2.5 h-2.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[9px] font-bold truncate transition-colors ${isActive ? 'text-secondary' : 'text-on-surface'}`}>
                    {fragment.name}
                  </span>
                  <span className="text-[7px] font-bold uppercase tracking-wider opacity-30 group-hover:opacity-60 transition-opacity">
                    {fragment.category}
                  </span>
                </div>
                <p className="text-[8px] text-on-surface-variant/60 line-clamp-1 leading-tight">
                  {fragment.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
