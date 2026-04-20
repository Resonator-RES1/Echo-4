import React from 'react';
import { Wand2, Database, Mic2, BarChart3 } from 'lucide-react';

export const FeatureHighlights: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { icon: Wand2, label: 'Audit', color: 'text-primary' },
        { icon: Database, label: 'Codex', color: 'text-secondary' },
        { icon: Mic2, label: 'Voice', color: 'text-emerald-400' },
        { icon: BarChart3, label: 'Analysis', color: 'text-cyan-400' }
      ].map((feature, i) => (
        <div key={i} className="p-4 rounded-xl bg-surface-container-low/40 border border-white/5 flex flex-col items-center gap-3 group hover:bg-surface-container-low transition-all">
          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform ${feature.color}`}>
            <feature.icon size={20} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 group-hover:text-on-surface transition-colors">{feature.label}</span>
        </div>
      ))}
    </div>
  );
};
