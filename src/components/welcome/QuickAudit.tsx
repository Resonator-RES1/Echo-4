import React from 'react';
import { Zap, Wand2 } from 'lucide-react';

interface QuickAuditProps {
  playgroundInput: string;
  setPlaygroundInput: (input: string) => void;
  playgroundResult: any;
  isRefining: boolean;
  streamingText: string;
  error: string | null;
  refinePlayground: (presets: string[]) => void;
}

export const QuickAudit: React.FC<QuickAuditProps> = ({
  playgroundInput,
  setPlaygroundInput,
  playgroundResult,
  isRefining,
  streamingText,
  error,
  refinePlayground
}) => {
  return (
    <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 shadow-xl space-y-6 flex flex-col h-full min-h-[500px]">
      <div className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-widest text-on-surface">Quick Audit</h4>
        <p className="text-[9px] text-on-surface-variant/40 italic leading-relaxed">Instantly test your prose against a sovereign preset.</p>
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex-1 relative">
          <textarea 
            value={playgroundInput}
            onChange={(e) => setPlaygroundInput(e.target.value)}
            placeholder="Drop a sentence here..."
            className="w-full h-full min-h-[120px] bg-black/20 border border-white/5 rounded-lg p-4 text-xs font-body leading-relaxed outline-none focus:border-primary/30 transition-all resize-none scrollbar-none"
          />
          <div className="absolute bottom-4 right-4 text-[8px] font-black uppercase tracking-widest text-on-surface-variant/20">Raw Draft</div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="flex-1 relative bg-primary/5 border border-primary/10 rounded-lg p-4 flex flex-col min-h-[120px]">
          <div className="flex-1 text-xs italic text-on-surface/60 leading-relaxed overflow-y-auto scrollbar-none">
            {isRefining && streamingText ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 opacity-40">
                  <Zap className="w-3 h-3 animate-pulse text-primary" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Streaming Audit...</span>
                </div>
                <p className="animate-in fade-in slide-in-from-bottom-1 duration-500">
                  {streamingText}
                  <span className="inline-block w-1 h-3 bg-primary/40 ml-1 animate-pulse" />
                </p>
              </div>
            ) : isRefining ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 opacity-40">
                <Zap className="w-4 h-4 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest">Auditing...</span>
              </div>
            ) : playgroundResult ? (
              playgroundResult.text?.startsWith('Error:') ? (
                <span className="text-error">{playgroundResult.text}</span>
              ) : (
                `"${playgroundResult.text}"`
              )
            ) : error ? (
              <span className="text-error text-[9px]">{error}</span>
            ) : (
              "Awaiting input for sovereign transformation..."
            )}
          </div>
          <div className="absolute bottom-4 right-4 text-[8px] font-black uppercase tracking-widest text-primary/20">Echo Result</div>
        </div>
      </div>

      <button 
        onClick={() => refinePlayground(['tone'])}
        disabled={isRefining || !playgroundInput.trim()}
        className="w-full py-4 rounded-lg bg-primary/10 text-primary font-label text-[9px] uppercase tracking-widest font-black border border-primary/20 hover:bg-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isRefining ? <Zap size={14} className="animate-pulse" /> : <Wand2 size={14} />}
        {isRefining ? 'Auditing...' : 'Run Quick Audit'}
      </button>
    </div>
  );
};
