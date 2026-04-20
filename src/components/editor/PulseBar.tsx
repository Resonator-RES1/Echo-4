import React from 'react';
import { DensityMap, DensityPoint } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface PulseBarProps {
  densityMap: DensityMap;
  onPointClick?: (point: DensityPoint) => void;
}

export const PulseBar: React.FC<PulseBarProps> = ({ densityMap, onPointClick }) => {
  return (
    <div className="relative w-4 h-full bg-surface-container-low/30 border-l border-white/5 overflow-hidden group">
      {/* The Track */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
        <div className="h-full w-px bg-white/10 mx-auto" />
      </div>

      {/* The Points */}
      <AnimatePresence>
        {densityMap.points.map((point, idx) => {
          const colorClass = 
            point.type === 'lore' ? 'bg-primary' : 
            point.type === 'voice' ? 'bg-accent-amber' : 
            point.severity === 'high' ? 'bg-error' : 
            point.severity === 'medium' ? 'bg-warning' : 'bg-info';

          const glowClass = 
            point.type === 'lore' ? 'shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]' : 
            point.type === 'voice' ? 'shadow-[0_0_8px_rgba(var(--accent-amber-rgb),0.6)]' : 
            'shadow-[0_0_8px_rgba(var(--error-rgb),0.6)]';

          return (
            <motion.div
              key={`${point.id}-${idx}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full cursor-pointer transition-transform hover:scale-150 z-10 ${colorClass} ${glowClass}`}
              style={{ top: `${point.offset}%` }}
              onClick={() => onPointClick?.(point)}
              title={`${point.type.toUpperCase()}: ${point.label}`}
            />
          );
        })}
      </AnimatePresence>

      {/* Hover Tooltip Area (Optional: could show density clusters) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* We could add a heatmap gradient here if we wanted a true "heat" look */}
      </div>
    </div>
  );
};
