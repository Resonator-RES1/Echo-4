import React, { useEffect, useState } from 'react';
import { DexieSaver } from '../../engines/gemini/dexieSaver';
import { CheckpointTuple } from '@langchain/langgraph-checkpoint';
import { SimpleSideBySideDiff } from './SimpleSideBySideDiff';
import { Loader2, ArrowLeft, ArrowRight, Activity, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LangDiffViewerProps {
    threadId: string;
    onClose: () => void;
}

export const LangDiffViewer: React.FC<LangDiffViewerProps> = ({ threadId, onClose }) => {
    const [checkpoints, setCheckpoints] = useState<CheckpointTuple[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadCheckpoints = async () => {
            setIsLoading(true);
            try {
                const saver = new DexieSaver();
                const iterator = saver.list({ configurable: { thread_id: threadId } });
                const loaded: CheckpointTuple[] = [];
                for await (const cp of iterator) {
                    loaded.push(cp);
                }
                // Sort checkpoints by age (oldest to newest might be intuitive for timeline, or newest to oldest. `list` yields newest first usually)
                // Let's sort oldest first (based on checkpoint_id timestamp)
                loaded.sort((a, b) => {
                    const aId = a.config.configurable?.checkpoint_id || '';
                    const bId = b.config.configurable?.checkpoint_id || '';
                    return aId.localeCompare(bId);
                });
                
                if (isMounted) {
                    setCheckpoints(loaded);
                    setCurrentIndex(0); // Start at the beginning
                }
            } catch (error) {
                console.error("Failed to load checkpoints:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        loadCheckpoints();
        return () => { isMounted = false; };
    }, [threadId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">Loading LangGraph Memory...</p>
            </div>
        );
    }

    if (checkpoints.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
                <Activity className="w-12 h-12 text-on-surface-variant/30" />
                <p className="text-sm font-label text-on-surface-variant text-center leading-relaxed">
                    No timeline data found for this execution.<br/>
                    <span className="text-xs opacity-60">Thread ID: {threadId}</span>
                </p>
                <button onClick={onClose} className="mt-4 px-4 py-2 border border-outline-variant rounded-md text-xs hover:bg-surface-container transition-colors">
                    Return to Report
                </button>
            </div>
        );
    }

    const currentCp = checkpoints[currentIndex];
    const prevStateText = currentIndex > 0 
        ? ((checkpoints[currentIndex - 1].checkpoint as any)?.channel_values?.refinedText || 
           (checkpoints[currentIndex - 1].checkpoint as any)?.channel_values?.draft || "")
        : ((checkpoints[0].checkpoint as any)?.channel_values?.draft || "");
        
    const currentStateText = (currentCp.checkpoint as any)?.channel_values?.refinedText || (currentCp.checkpoint as any)?.channel_values?.draft || "";
    
    // Determine the active node at this checkpoint using metadata
    const metadata = currentCp.metadata as any;
    const source = metadata?.source || 'unknown';
    const stepName = metadata?.step || `Step ${currentIndex + 1}`;
    
    // Detailed node info
    const isError = (currentCp.checkpoint as any)?.channel_values?.errorMessage;
    const needsHealing = (currentCp.checkpoint as any)?.channel_values?.needsHealing;
    const healingPasses = (currentCp.checkpoint as any)?.channel_values?.healingPasses || 0;

    return (
        <div className="flex flex-col h-full bg-[#1A1A1A] text-on-surface rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-surface-container-low border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">LangDiff Explorer</h3>
                        <p className="text-[10px] text-on-surface-variant/60 font-mono tracking-tight">{threadId}</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-on-surface-variant hover:text-on-surface"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
            </div>

            {/* Main Diff Area */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="popLayout">
                    <motion.div 
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar"
                    >
                        {currentIndex === 0 ? (
                            <div className="p-6 h-full flex flex-col">
                                <div className="mb-4">
                                    <h4 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        Initial Draft Intake
                                    </h4>
                                </div>
                                <div className="bg-surface-container-lowest p-4 rounded-lg border border-white/5 flex-1 whitespace-pre-wrap font-serif text-sm leading-relaxed text-on-surface/80">
                                    {currentStateText}
                                </div>
                            </div>
                        ) : (
                            <SimpleSideBySideDiff 
                                original={prevStateText}
                                polished={currentStateText}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Timeline Scrubber */}
            <div className="bg-surface-container-low p-4 border-t border-white/5 flex flex-col gap-4 z-10">
                <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase">Initial</span>
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase">Final</span>
                </div>
                
                <div className="relative w-full h-1 bg-white/10 rounded-full">
                    {checkpoints.map((cp, idx) => {
                        const isCurrent = idx === currentIndex;
                        const isPast = idx < currentIndex;
                        const position = checkpoints.length > 1 ? (idx / (checkpoints.length - 1)) * 100 : 50;
                        
                        return (
                            <div 
                                key={idx}
                                className="absolute top-1/2 -translate-y-1/2 group"
                                style={{ left: `calc(${position}% - 6px)` }}
                            >
                                <button 
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                                        isCurrent 
                                            ? 'bg-primary border-primary scale-125' 
                                            : isPast
                                                ? 'bg-primary/50 border-primary/20 hover:border-primary/50'
                                                : 'bg-surface-container hover:bg-surface-container-high border-white/20'
                                    }`}
                                />
                                
                                <div className="absolute top-0 -translate-y-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest px-2 py-1 rounded shadow-xl pointer-events-none whitespace-nowrap z-50">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface">
                                        Step {idx}: {((cp.metadata as any)?.source) || 'Node Execution'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Active Track Background */}
                    {checkpoints.length > 1 && (
                        <div 
                            className="absolute top-0 left-0 h-full bg-primary/40 rounded-full transition-all duration-300"
                            style={{ width: `${(currentIndex / (checkpoints.length - 1)) * 100}%` }}
                        />
                    )}
                </div>

                <div className="flex justify-between items-center mt-2">
                    <button 
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" /> Prev
                    </button>
                    
                    <div className="flex gap-4 items-center">
                        <div className="text-center">
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Step</p>
                            <p className="text-xs text-primary font-mono">{stepName} ({source})</p>
                        </div>
                        {needsHealing && (
                            <div className="px-2 py-1 bg-amber-500/20 text-amber-500 rounded text-[9px] font-bold uppercase tracking-widest border border-amber-500/30">
                                Healing Triggered
                            </div>
                        )}
                        {healingPasses > 0 && (
                            <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold uppercase tracking-widest border border-blue-500/30">
                                Heal Pass {healingPasses}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setCurrentIndex(Math.min(checkpoints.length - 1, currentIndex + 1))}
                        disabled={currentIndex === checkpoints.length - 1}
                        className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs flex items-center gap-1 transition-colors"
                    >
                        Next <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
            
        </div>
    );
};
