import React from 'react';
import { BookOpen, ChevronUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuggestionLedgerProps {
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  suggestionLedger: string[];
  clearSuggestions: () => void;
  appendCustomDirective: (directive: string) => void;
  removeSuggestion: (index: number) => void;
}

export const SuggestionLedger: React.FC<SuggestionLedgerProps> = ({
  showSuggestions,
  setShowSuggestions,
  suggestionLedger,
  clearSuggestions,
  appendCustomDirective,
  removeSuggestion
}) => {
  return (
    <div className="mt-4">
      <button 
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors px-1"
      >
        <BookOpen className="w-3.5 h-3.5" />
        {showSuggestions ? 'Hide Suggestion Ledger' : 'View Suggestion Ledger'}
        {suggestionLedger.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] ml-1">
            {suggestionLedger.length}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-3 overflow-hidden"
          >
            <div className="p-4 bg-surface-container-highest/10 rounded-lg border border-white/5 space-y-4 flex flex-col">
              <div className="flex items-center justify-between flex-shrink-0">
                <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Suggestion Ledger</p>
                {suggestionLedger.length > 0 && (
                  <button 
                    onClick={clearSuggestions}
                    className="text-[8px] font-black uppercase tracking-widest text-error/60 hover:text-error transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {suggestionLedger.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-[8px] text-on-surface-variant/40 italic">No suggestions collected. You can collect suggestions from the Audit Log to guide the next refinement cycle.</p>
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  {suggestionLedger.map((suggestion, idx) => (
                    <div key={idx} className="group flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 group-hover:bg-primary transition-colors shrink-0" />
                      <p className="flex-1 text-[9px] text-on-surface-variant/80 leading-relaxed italic font-serif">
                        {suggestion}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            appendCustomDirective(suggestion);
                            removeSuggestion(idx);
                          }}
                          className="p-1 hover:bg-primary/20 text-primary/60 hover:text-primary transition-colors rounded-md"
                          title="Move to Custom Directives"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => removeSuggestion(idx)}
                          className="p-1 hover:bg-error/20 text-error/60 hover:text-error transition-colors rounded-md"
                          title="Remove Suggestion"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
