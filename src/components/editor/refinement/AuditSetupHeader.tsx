import React from 'react';
import { Sparkles, ChevronUp, ChevronDown, Zap } from 'lucide-react';

interface AuditSetupHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  efficiency: number;
}

export const AuditSetupHeader: React.FC<AuditSetupHeaderProps> = ({ isOpen, onToggle, efficiency }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 lg:gap-3">
        <button 
          onClick={onToggle} 
          className="flex items-center gap-2 lg:gap-3 text-lg lg:text-xl font-headline font-bold text-primary tracking-tight group"
        >
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
            <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
          </div>
          <span>Audit Setup</span>
          <div className="p-1 rounded-full hover:bg-primary/10 transition-all">
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 lg:w-4 lg:h-4"/> : <ChevronDown className="w-3.5 h-3.5 lg:w-4 lg:h-4" />}
          </div>
        </button>
      </div>
      {efficiency > 0 && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent-emerald/10 border border-accent-emerald/20 rounded-full shadow-sm" title="Context filtering is saving API quota">
          <Zap className="w-3.5 h-3.5 text-accent-emerald animate-pulse" />
          <span className="text-[9px] font-black text-accent-emerald uppercase tracking-widest">
            {efficiency}% LEAN
          </span>
        </div>
      )}
    </div>
  );
};
