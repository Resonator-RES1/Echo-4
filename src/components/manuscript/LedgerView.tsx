import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Trash2, FileText, Clock, Sparkles, Info } from 'lucide-react';
import { RefinedVersion } from '../../types';

interface LedgerViewProps {
  versionHistory: RefinedVersion[];
  onClearAcceptedVersions: () => void;
  onDeleteVersion: (id: string) => void;
  setDraft: (draft: string) => void;
  showToast: (message: string) => void;
  onViewReport: (version: RefinedVersion) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  versionHistory,
  onClearAcceptedVersions,
  onDeleteVersion,
  setDraft,
  showToast,
  onViewReport
}) => {
  return (
    <div className="h-full overflow-y-auto p-4 lg:p-4 space-y-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-8 lg:mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-on-surface tracking-tight uppercase italic">The Ledger</h2>
            </div>
            <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-bold font-sans max-w-sm leading-relaxed">
              The definitive lineage of your narrative. Every accepted milestone is etched into the archive.
            </p>
          </div>
          {versionHistory.length > 0 && (
            <button 
              onClick={onClearAcceptedVersions}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-error/5 text-error border border-error/10 hover:bg-error/10 transition-all text-[9px] font-bold uppercase tracking-wider group shadow-lg"
            >
              <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Purge Archive
            </button>
          )}
        </div>

        {versionHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] bg-white/[0.01] rounded-xl border-2 border-dashed border-white/5 group/empty transition-all hover:border-primary/20">
            <div className="w-16 h-16 rounded-lg bg-white/[0.02] flex items-center justify-center mb-4 group-hover/empty:scale-110 group-hover/empty:bg-primary/5 transition-all duration-700">
              <CheckCircle2 className="w-8 h-8 text-on-surface-variant/10 group-hover/empty:text-primary/20 transition-colors" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/20 italic">The Ledger is currently void</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 relative">
            <div className="absolute left-[31px] top-4 bottom-12 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
            
            {versionHistory.map((version, idx) => (
              <motion.div 
                key={version.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative pl-16 group"
              >
                <div className="absolute left-[28px] top-5 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.4)] group-hover:scale-125 transition-transform duration-500 z-10" />
                
                <div className="bg-surface-container-low/40 backdrop-blur-xl border border-white/5 rounded-lg p-4 hover:border-primary/30 transition-all shadow-xl group/card relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-[80px] group-hover/card:bg-primary/10 transition-colors duration-700" />
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner group-hover/card:scale-105 transition-transform duration-500">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover/card:text-primary transition-colors duration-300">{version.title || 'Untitled Milestone'}</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                            <Clock className="w-2.5 h-2.5 text-primary/60" />
                            <p className="text-[8px] text-on-surface-variant/60 font-bold uppercase tracking-wider">
                              {new Date(version.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/10">
                            <Sparkles className="w-2.5 h-2.5 text-primary" />
                            <p className="text-[8px] text-primary font-bold uppercase tracking-wider">Sovereign Graft</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteVersion(version.id)}
                      className="w-8 h-8 flex items-center justify-center text-on-surface-variant/40 hover:text-error hover:bg-error/10 rounded-lg transition-all border border-transparent hover:border-error/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative mb-6 group/summary">
                    <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-primary/20 rounded-full group-hover/summary:bg-primary/40 transition-colors" />
                    <p className="text-sm text-on-surface-variant leading-relaxed italic font-serif line-clamp-3 relative z-10 pl-3">
                      “{version.summary}”
                    </p>
                  </div>

                  <div className="flex gap-4 relative z-10">
                    <button 
                      onClick={() => {
                        setDraft(version.text);
                        showToast('Milestone restored to sanctuary');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-surface font-bold uppercase tracking-wider text-[9px] hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 group/btn overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      <Sparkles className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      Restore to Sanctuary
                    </button>
                    {version.justification && (
                      <button 
                        onClick={() => onViewReport(version)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all text-[9px] font-bold uppercase tracking-wider"
                      >
                        <Info className="w-4 h-4" />
                        View Logic
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
