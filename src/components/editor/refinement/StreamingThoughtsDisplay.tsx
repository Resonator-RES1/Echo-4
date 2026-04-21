import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReportThinkingFlow } from '../../flowrail/ReportThinkingFlow';

interface StreamingThoughtsDisplayProps {
  isRefining: boolean;
  streamingThoughts: string;
  streamingText: string;
  isThinkingExpanded: boolean;
  setIsThinkingExpanded: (expanded: boolean) => void;
}

export const StreamingThoughtsDisplay: React.FC<StreamingThoughtsDisplayProps> = ({
  isRefining,
  streamingThoughts,
  streamingText,
  isThinkingExpanded,
  setIsThinkingExpanded
}) => {
  const thoughtsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thoughts container
  useEffect(() => {
    if (thoughtsContainerRef.current) {
      thoughtsContainerRef.current.scrollTop = thoughtsContainerRef.current.scrollHeight;
    }
  }, [streamingThoughts, streamingText]);

  return (
    <AnimatePresence>
      {isRefining && (streamingThoughts || streamingText) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mt-6 p-4 bg-surface-container-highest/40 backdrop-blur-xl border border-primary/20 rounded-xl space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider text-primary">Cynical Mirror: Internal Reasoning</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 mr-2">
                <div className="w-1 h-1 bg-primary/20 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1 h-1 bg-primary/20 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1 h-1 bg-primary/20 rounded-full animate-bounce" />
              </div>
              <button 
                onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors px-2 py-1 rounded-md bg-white/5 hover:bg-white/10"
              >
                {isThinkingExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>
          
          <div 
            ref={thoughtsContainerRef}
            className={`overflow-y-auto custom-scrollbar space-y-4 transition-all duration-700 ease-in-out ${isThinkingExpanded ? 'max-h-[80vh]' : 'max-h-48'}`}
          >
            {streamingThoughts && (
              <div className="pr-2">
                <ReportThinkingFlow thinking={streamingThoughts} />
              </div>
            )}
            
            {streamingText && (
              <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3 h-3 text-primary/40" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40">Raw Refinement Stream</span>
                </div>
                <div className="text-[9px] font-mono text-primary/60 break-all opacity-50 line-clamp-3">
                  {streamingText}
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-2 flex items-center justify-between border-t border-white/5">
            <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/30">Audit in Progress</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-primary/40 animate-pulse">Analyzing Voice & Lore...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
