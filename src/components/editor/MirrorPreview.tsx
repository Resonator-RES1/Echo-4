import React, { useMemo } from 'react';
import { AlertCircle, Zap, Fingerprint, Book, Sparkles } from 'lucide-react';
import { ContinuityIssue } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { ReportThinkingFlow } from '../flowrail/ReportThinkingFlow';

interface MirrorPreviewProps {
  text: string;
  selection?: { text: string; start: number; end: number } | null;
  localWarnings?: ContinuityIssue[];
  isSurgical?: boolean;
  streamingThoughts?: string;
  streamingText?: string;
  isRefining?: boolean;
}

export const MirrorPreview: React.FC<MirrorPreviewProps> = ({
  text,
  selection,
  localWarnings = [],
  isSurgical = false,
  streamingThoughts,
  streamingText,
  isRefining = false
}) => {
  const [activeTab, setActiveTab] = React.useState<'preview' | 'thoughts'>('preview');

  const displayLines = useMemo(() => {
    const content = (isSurgical && selection ? selection.text : text);
    return content.split('\n');
  }, [text, selection, isSurgical]);

  const wordCount = useMemo(() => {
    const content = isRefining && streamingText ? streamingText : (isSurgical && selection ? selection.text : text);
    const matches = content.match(/\S+/g);
    return matches ? matches.length : 0;
  }, [text, selection, isSurgical, streamingText, isRefining]);

  // Locally calculated "First Impression" metrics
  const diagnostics = useMemo(() => {
    const content = isSurgical && selection ? selection.text : text;
    const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length;
    const avgSentenceLength = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
    
    return {
      density: avgSentenceLength > 25 ? 'High' : avgSentenceLength > 15 ? 'Balanced' : 'Sparse',
      resonance: localWarnings.length === 0 ? 'Harmonic' : localWarnings.length < 3 ? 'Fraying' : 'Critical',
      avgSentenceLength
    };
  }, [text, selection, isSurgical, wordCount, localWarnings]);

  return (
    <div className="flex flex-col h-full bg-surface-container-low border border-white/5 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Header */}
      <div className="p-4 px-6 border-b border-white/5 bg-surface-container-high/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Fingerprint className="w-4 h-4 text-primary" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${activeTab === 'preview' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant/60'}`}
            >
              Preview
            </button>
            <button 
              onClick={() => setActiveTab('thoughts')}
              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${activeTab === 'thoughts' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant/60'}`}
            >
              Thought Stream
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40">Word Count</span>
            <span className="text-[9px] font-mono text-primary">{wordCount}</span>
          </div>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <>
          {/* Diagnostic Strip */}
          <div className="grid grid-cols-3 gap-px bg-white/5 border-b border-white/5">
            <div className="p-3 bg-surface-container-low flex flex-col items-center gap-1">
              <span className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant/40">Prose Density</span>
              <span className={`text-[9px] font-bold ${diagnostics.density === 'High' ? 'text-accent-amber' : 'text-accent-emerald'}`}>
                {diagnostics.density}
              </span>
            </div>
            <div className="p-3 bg-surface-container-low flex flex-col items-center gap-1 border-x border-white/5">
              <span className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant/40">Resonance</span>
              <span className={`text-[9px] font-bold ${diagnostics.resonance === 'Critical' ? 'text-error' : diagnostics.resonance === 'Fraying' ? 'text-accent-amber' : 'text-accent-emerald'}`}>
                {diagnostics.resonance}
              </span>
            </div>
            <div className="p-3 bg-surface-container-low flex flex-col items-center gap-1">
              <span className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant/40">Avg Sentence</span>
              <span className="text-[9px] font-bold text-on-surface">{diagnostics.avgSentenceLength} words</span>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 font-serif text-sm leading-relaxed text-on-surface-variant/80 selection:bg-primary/20 relative">
            <AnimatePresence>
              {isRefining && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-surface-container-low/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center space-y-4"
                >
                  <div className="relative">
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                    <motion.div 
                      className="absolute -inset-2 border border-primary/20 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Echo Processing</h4>
                    <p className="text-[9px] text-on-surface-variant font-medium italic opacity-60">Architecting Sovereign Prose...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className={`max-w-prose mx-auto space-y-4 transition-all duration-700 ${isRefining ? 'blur-[1px] opacity-40 grayscale' : ''}`}>
              {displayLines.map((line, idx) => (
                <p key={idx} className="relative group">
                  {line || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
           <ReportThinkingFlow thinking={streamingThoughts || 'No active thoughts...'} />
        </div>
      )}

      {/* Warnings Footer */}
      {localWarnings.length > 0 && (
        <div className="p-4 bg-error/5 border-t border-error/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-3 h-3 text-error" />
            <span className="text-[8px] font-black uppercase tracking-widest text-error">Continuity Alerts ({localWarnings.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {localWarnings.slice(0, 3).map((warning, idx) => (
              <div key={idx} className="px-2 py-1 bg-error/10 rounded-md flex items-center gap-1.5 border border-error/20">
                <div className="w-1 h-1 rounded-full bg-error" />
                <span className="text-[8px] font-bold text-error/80 uppercase tracking-tighter">{warning.message}</span>
              </div>
            ))}
            {localWarnings.length > 3 && (
              <span className="text-[8px] font-bold text-on-surface-variant/40">+{localWarnings.length - 3} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
