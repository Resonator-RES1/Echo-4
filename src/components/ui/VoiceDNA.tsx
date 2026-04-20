import React from 'react';
import { motion } from 'motion/react';

interface VoiceDNAProps {
  data: Record<string, number>;
  color?: string;
  size?: number;
}

export function VoiceDNA({ data, color = 'var(--color-primary)', size = 200 }: VoiceDNAProps) {
  const keys = Object.keys(data);
  const angleStep = (Math.PI * 2) / keys.length;
  const center = size / 2;
  const radius = (size / 2) * 0.8;

  const points = keys.map((key, i) => {
    const value = data[key] / 100;
    const angle = i * angleStep - Math.PI / 2;
    const x = center + radius * value * Math.cos(angle);
    const y = center + radius * value * Math.sin(angle);
    return { x, y, label: key };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid lines */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
          <circle
            key={r}
            cx={center}
            cy={center}
            r={radius * r}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-on-surface-variant/10"
          />
        ))}
        
        {/* Axis lines */}
        {keys.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-on-surface-variant/10"
            />
          );
        })}

        {/* Data shape */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1 }}
          d={pathData}
          fill={color}
        />
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={color}
            className="shadow-sm"
          />
        ))}
      </svg>

      {/* Labels */}
      {points.map((p, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelX = center + (radius + 15) * Math.cos(angle);
        const labelY = center + (radius + 15) * Math.sin(angle);
        
        return (
          <div
            key={i}
            className="absolute text-[8px] font-label uppercase tracking-widest text-on-surface-variant/60 whitespace-nowrap"
            style={{
              left: labelX,
              top: labelY,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {p.label}
          </div>
        );
      })}
    </div>
  );
}
