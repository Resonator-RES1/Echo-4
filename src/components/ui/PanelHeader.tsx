import React from 'react';
import { Plus, X } from 'lucide-react';

interface PanelHeaderProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  onAdd: () => void;
  addLabel: string;
  onClose?: () => void;
}

export function PanelHeader({ title, description, icon, onAdd, addLabel, onClose }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 shrink-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">{title}</h2>
          {description && (
            <p className="text-[9px] font-label text-on-surface-variant/60 uppercase tracking-wider mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-label text-xs uppercase tracking-widest font-bold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          {addLabel}
        </button>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-3 rounded-full bg-surface-container-highest/50 hover:bg-error/10 transition-all group border border-white/5"
          >
            <X className="w-4 h-4 text-on-surface-variant/60 group-hover:text-error transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
}
