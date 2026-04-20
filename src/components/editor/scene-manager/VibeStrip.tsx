import React from 'react';
import { RefinedVersion } from '../../../types';
import { getVibeColor } from '../../../utils/vibePalette';

interface VibeStripProps {
  version?: RefinedVersion;
}

export const VibeStrip: React.FC<VibeStripProps> = ({ version }) => {
  if (!version?.expressionProfile || version.expressionProfile.length === 0) {
    return <div className="w-1.5 h-full bg-white/5 shrink-0" />;
  }

  const total = version.expressionProfile.reduce((acc, curr) => acc + curr.score, 0);
  
  const tooltipText = version.expressionProfile
    .map(v => `${Math.round((v.score / total) * 100)}% ${v.vibe}`)
    .join(', ');

  return (
    <div className="w-1.5 h-full flex flex-col shrink-0 relative group/vibe" title={tooltipText}>
      {version.expressionProfile.map((v, idx) => (
        <div 
          key={`${v.vibe}-${idx}`} 
          className={`${getVibeColor(v.vibe)} shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]`} 
          style={{ height: `${(v.score / total) * 100}%` }}
        />
      ))}
      {/* Tooltip */}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-surface-container-highest/90 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-on-surface rounded-lg shadow-2xl opacity-0 group-hover/vibe:opacity-100 transition-all pointer-events-none z-[100] whitespace-nowrap border border-white/10 translate-x-2 group-hover/vibe:translate-x-0">
        {tooltipText}
      </div>
    </div>
  );
};
