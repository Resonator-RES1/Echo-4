import React from 'react';
import { ShieldCheck, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { CreativeScarring } from '../../../types';

interface CreativeScarringLedgerProps {
  scarring: CreativeScarring[];
}

export const CreativeScarringLedger: React.FC<CreativeScarringLedgerProps> = ({ scarring }) => {
  if (!scarring || scarring.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck className="w-3.5 h-3.5 text-accent-amber" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-amber">Preserved Human Friction (Kintsugi)</h4>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {scarring.map((scar, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-accent-amber/5 border border-accent-amber/20 rounded-xl space-y-3 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Heart className="w-12 h-12 text-accent-amber rotate-12" />
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-accent-amber/10 flex items-center justify-center">
                  {scar.category === 'Voice_DNA' ? <Sparkles className="w-3 h-3 text-accent-amber" /> : <AlertCircle className="w-3 h-3 text-accent-amber" />}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-accent-amber/80">{scar.category.replace('_', ' ')}</span>
              </div>
              <span className="text-[8px] font-bold text-accent-amber/40 uppercase tracking-tighter">Sovereign Exception</span>
            </div>

            <div className="space-y-2 relative z-10">
              <div className="p-3 bg-surface-container-low border border-accent-amber/10 rounded-lg italic font-serif text-[11px] text-on-surface/90 leading-relaxed border-l-4 border-l-accent-amber">
                "{scar.snippet}"
              </div>
              <p className="text-[10px] text-on-surface-variant/70 leading-relaxed pl-1">
                <span className="font-bold text-accent-amber/60 mr-1">WHY:</span> {scar.justification}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="p-4 bg-surface-container-highest/20 border border-white/5 rounded-xl">
        <p className="text-[9px] text-on-surface-variant/40 italic leading-snug">
          The items above were flagged as "imperfect" by the mechanical audit but were intentionally preserved by Echo to protect your unique authorial soul. This is the "Gold" in the Kintsugi repair.
        </p>
      </div>
    </div>
  );
};
