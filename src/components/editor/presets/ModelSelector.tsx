import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Brain, Key } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: any) => void;
  selectedThinkingLevel?: 'minimal' | 'low' | 'medium' | 'default' | 'high';
  setSelectedThinkingLevel?: (level: any) => void;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, setSelectedModel, selectedThinkingLevel, setSelectedThinkingLevel }) => {
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const activeFamily = selectedModel.includes('2.5') ? '2.5' : '3.x';

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasCustomKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const modelFamilies = [
    { id: '3.x', label: 'Gemini 3.x', description: 'Next-gen reasoning architecture.' },
    { id: '2.5', label: 'Gemini 2.5', description: 'Refined production-grade stability.' },
  ];

  const modelOptions = activeFamily === '3.x' ? [
    { 
      id: 'gemini-3.1-flash-lite-preview', 
      label: 'Flash Lite', 
      icon: <Zap className="w-5 h-5" />, 
      description: 'Ultra-fast, low-cost narrative sweep.' 
    },
    { 
      id: 'gemini-3-flash-preview', 
      label: 'Flash', 
      icon: <Zap className="w-5 h-5" />, 
      description: 'Balanced speed and narrative depth.' 
    },
    { 
      id: 'gemini-3.1-pro-preview', 
      label: 'Pro', 
      icon: <Brain className="w-5 h-5" />, 
      description: 'Deepest reasoning for complex epics.' 
    },
  ] : [
    { 
      id: 'gemini-2.5-flash-lite', 
      label: 'Flash Lite 2.5', 
      icon: <Zap className="w-5 h-5" />, 
      description: 'Optimized efficiency for rapid iterations.' 
    },
    { 
      id: 'gemini-2.5-flash', 
      label: 'Flash 2.5', 
      icon: <Zap className="w-5 h-5" />, 
      description: 'Speed-optimized production model.' 
    },
    { 
      id: 'gemini-2.5-pro', 
      label: 'Pro 2.5', 
      icon: <Brain className="w-5 h-5" />, 
      description: 'Advanced reasoning and large context capacity.' 
    },
  ];

  const handleFamilyChange = (id: '3.x' | '2.5') => {
    if (id === '3.x') {
      if (selectedModel.includes('pro')) setSelectedModel('gemini-3.1-pro-preview');
      else if (selectedModel.includes('lite')) setSelectedModel('gemini-3.1-flash-lite-preview');
      else setSelectedModel('gemini-3-flash-preview');
    } else {
      if (selectedModel.includes('pro')) setSelectedModel('gemini-2.5-pro');
      else if (selectedModel.includes('lite')) setSelectedModel('gemini-2.5-flash-lite');
      else setSelectedModel('gemini-2.5-flash');
    }
  };

  const thinkingLevels: { id: 'minimal' | 'low' | 'medium' | 'default' | 'high'; label: string }[] = [
    { id: 'minimal', label: 'Minimal' },
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'default', label: 'Default' },
    { id: 'high', label: 'High' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 font-label text-[9px] uppercase tracking-wider text-on-surface/40 font-black">
            <Cpu className="w-3.5 h-3.5" />
            <span>Model Generation</span>
          </div>
          <div className="flex bg-black/20 p-0.5 rounded-lg border border-white/5">
            {modelFamilies.map(family => (
              <button
                key={family.id}
                onClick={() => handleFamilyChange(family.id as '3.x' | '2.5')}
                className={`
                  px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all
                  ${activeFamily === family.id 
                    ? 'bg-primary text-on-primary shadow-sm' 
                    : 'text-on-surface-variant/40 hover:text-on-surface-variant/70'}
                `}
                title={family.description}
              >
                {family.id}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {modelOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedModel(opt.id)}
              className={`
                flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all group relative overflow-hidden
                ${selectedModel === opt.id 
                  ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5' 
                  : 'bg-surface-container-highest/20 border-white/5 text-on-surface-variant/60 hover:border-white/10 hover:bg-surface-container-highest/30'}
              `}
              title={opt.description}
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${selectedModel === opt.id ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                {opt.icon}
              </div>
              <span className="font-label text-[10px] uppercase tracking-widest font-black">
                {opt.label}
              </span>
              {selectedModel === opt.id && (
                <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {selectedThinkingLevel && setSelectedThinkingLevel && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-label text-[9px] uppercase tracking-wider text-on-surface/50 font-black">
            <Brain className="w-3.5 h-3.5" />
            <span>Thinking Level</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {thinkingLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedThinkingLevel(level.id)}
                className={`
                  p-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                  ${selectedThinkingLevel === level.id
                    ? 'bg-primary text-on-primary-fixed'
                    : 'bg-surface-container-highest/20 text-on-surface-variant hover:bg-surface-container-highest/40'}
                `}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasCustomKey && (
        <p className="text-[9px] text-accent-emerald/60 font-black uppercase tracking-widest text-center">
          Using personal Gemini API quota
        </p>
      )}
    </div>
  );
};
