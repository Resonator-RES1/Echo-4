import React from 'react';
import { LoreEntry, VoiceProfile, AuthorVoice, FocusArea, FeedbackDepth, AuthorVoiceSuite, VoiceDNA } from '../../../types';
import { Info, ShieldCheck, Book, Sparkles, Target, Zap, AlertCircle, Fingerprint } from 'lucide-react';
import { motion } from 'motion/react';

import { focusAreaOptions } from '../../../constants/focusAreas';

interface AuditPreviewProps {
  activeLore: LoreEntry[];
  activeVoices: VoiceProfile[];
  activeAuthorVoices?: AuthorVoice[];
  allAuthorVoices?: AuthorVoice[];
  activeVoiceSuite?: AuthorVoiceSuite;
  voiceDNAs?: VoiceDNA[];
  focusAreas: FocusArea[];
  customFocus?: string;
  depth: FeedbackDepth;
  model: string;
  contextSize: number;
  contextLimit: number;
  mandateCompliance?: number;
  creativeScarring?: { snippet: string; rationale: string; dna_alignment: string }[];
}

export const AuditPreview: React.FC<AuditPreviewProps> = ({
  activeLore,
  activeVoices,
  activeAuthorVoices = [],
  allAuthorVoices = [],
  activeVoiceSuite,
  voiceDNAs = [],
  focusAreas,
  customFocus,
  depth,
  model,
  contextSize,
  contextLimit,
  mandateCompliance,
  creativeScarring = []
}) => {
  const basePressure = (contextSize / contextLimit) * 100;
  const focusMultiplier = 1 + (focusAreas.length * 0.08);
  const depthMultiplier = depth === 'in-depth' ? 1.5 : depth === 'balanced' ? 1.2 : 1.0;
  const modelMultiplier = model.includes('pro') ? 1.3 : 1.0;
  const cognitivePressure = Math.min(basePressure * focusMultiplier * depthMultiplier * modelMultiplier, 120);
  
  const getPressureColor = () => {
    if (cognitivePressure > 100) return 'bg-error';
    if (cognitivePressure > 80) return 'bg-accent-amber';
    if (cognitivePressure > 60) return 'bg-primary';
    return 'bg-accent-emerald';
  };

  return (
    <div className="bg-surface-container-high/40 rounded-xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b border-white/5 bg-surface-container-highest/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <h4 className="text-xs font-black uppercase tracking-wider text-on-surface">Audit Manifest</h4>
        </div>
        <div className="flex items-center gap-4">
          {mandateCompliance !== undefined && (
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-black uppercase tracking-widest text-on-surface-variant/40">Compliance</span>
              <span className={`text-[10px] font-black ${mandateCompliance > 80 ? 'text-primary' : 'text-accent-amber'}`}>
                {Math.round(mandateCompliance)}%
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Engine:</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {model.replace('gemini-', '').replace('-preview', '')}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Context Load */}
        <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">Cognitive Pressure</span>
              <span className="text-[7px] font-bold text-on-surface-variant/30 uppercase tracking-tighter">Context + Focus + Depth</span>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${cognitivePressure > 90 ? 'text-error' : 'text-on-surface-variant/40'}`}>
              {Math.round(cognitivePressure)}%
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${cognitivePressure}%` }}
              className={`h-full transition-all duration-700 ease-out ${getPressureColor()}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Identity */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-1.5 px-1">
                <ShieldCheck className="w-3 h-3" /> Voice DNA Construct
              </label>
              <div className="flex flex-wrap gap-2">
                {activeVoiceSuite && (
                  <div className="px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Suite: {activeVoiceSuite.name}
                  </div>
                )}
                {activeVoiceSuite && Object.entries(activeVoiceSuite.modalities).map(([modality, voiceId]) => {
                  if (!voiceId) return null;
                  const dna = voiceDNAs.find(v => v.id === voiceId) || allAuthorVoices.find(v => v.id === voiceId);
                  if (!dna) return null;
                  return (
                    <div key={modality} className="px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-xl text-[9px] font-bold text-primary flex items-center gap-2">
                      <span className="opacity-50 lowercase">{modality}</span> {dna.name}
                    </div>
                  );
                })}
                {!activeVoiceSuite && activeAuthorVoices.map(v => (
                  <div key={v.id} className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Author: {v.name}
                  </div>
                ))}
                {activeVoices.map(v => (
                  <div key={v.id} className="px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-[9px] font-black text-emerald-500 flex items-center gap-2 uppercase tracking-widest">
                    <Fingerprint className="w-3 h-3" /> {v.name}
                  </div>
                ))}
                {activeVoices.length === 0 && activeAuthorVoices.length === 0 && !activeVoiceSuite && (
                  <span className="text-[9px] italic text-on-surface-variant/40 px-1">No voice profiles detected in payload.</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-1.5 px-1">
                <Book className="w-3 h-3" /> Axioms & Lore
              </label>
              <div className="flex flex-wrap gap-2">
                {activeLore.map(l => (
                  <div key={l.id} className="px-3 py-1.5 bg-surface-container-highest/40 border border-white/5 rounded-xl text-[9px] font-bold text-on-surface flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo" /> {l.title}
                  </div>
                ))}
                {activeLore.length === 0 && (
                  <span className="text-[9px] italic text-on-surface-variant/40 px-1">No lore axioms active.</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Directives & Simulation Outputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-1.5 px-1">
                <Target className="w-3 h-3" /> Focus Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map(area => {
                  const opt = focusAreaOptions.find(o => o.id === area);
                  return (
                    <div key={area} className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      {opt?.icon && <span className="opacity-60">{React.cloneElement(opt.icon as React.ReactElement, { className: 'w-3 h-3' })}</span>}
                      {opt?.label || area}
                    </div>
                  );
                })}
                {focusAreas.length === 0 && (
                  <span className="text-[9px] italic text-on-surface-variant/40 px-1">Balanced audit (no specific focus).</span>
                )}
              </div>
            </div>

            {creativeScarring.length > 0 && (
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-1.5 px-1">
                  <Sparkles className="w-3 h-3" /> Protected Friction (Scarring)
                </label>
                <div className="space-y-2">
                  {creativeScarring.slice(0, 3).map((scar, idx) => (
                    <div key={idx} className="p-2.5 bg-primary/5 border border-primary/10 rounded-lg space-y-1">
                      <p className="text-[8px] font-bold text-primary uppercase tracking-tighter truncate leading-none">
                        {scar.dna_alignment}
                      </p>
                      <p className="text-[9px] text-on-surface-variant leading-tight line-clamp-2 italic">
                        "{scar.snippet}"
                      </p>
                    </div>
                  ))}
                  {creativeScarring.length > 3 && (
                    <span className="text-[7px] font-bold text-on-surface-variant/30 uppercase tracking-widest px-1">
                      + {creativeScarring.length - 3} more preserved friction points
                    </span>
                  )}
                </div>
              </div>
            )}

            {customFocus && (
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-1.5 px-1">
                  <Zap className="w-3 h-3" /> Surgical Directive
                </label>
                <div className="p-3 bg-accent-amber/5 border border-accent-amber/20 rounded-xl text-[9px] font-medium text-on-surface italic leading-relaxed">
                  "{customFocus}"
                </div>
              </div>
            )}
          </div>
        </div>

        {cognitivePressure > 85 && (
          <div className={`p-4 border rounded-lg flex items-start gap-3 ${cognitivePressure > 100 ? 'bg-error/5 border-error/20' : 'bg-accent-amber/5 border-accent-amber/20'}`}>
            <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${cognitivePressure > 100 ? 'text-error' : 'text-accent-amber'}`} />
            <div className="space-y-1">
              <p className={`text-[9px] font-bold uppercase tracking-wider ${cognitivePressure > 100 ? 'text-error' : 'text-accent-amber'}`}>
                {cognitivePressure > 100 ? 'Engine Saturation: Precision Loss Likely' : 'Cognitive Overload Risk'}
              </p>
              <p className={`text-[9px] leading-tight ${cognitivePressure > 100 ? 'text-error/70' : 'text-accent-amber/70'}`}>
                {cognitivePressure > 100 
                  ? 'The audit parameters exceed the engine\'s optimal reasoning capacity. Expect potential hallucinations or ignored directives. Simplify focus areas or reduce lore context.'
                  : 'The current context payload is extremely dense. The Mirror Editor may struggle with absolute fidelity. Consider deactivating non-essential lore for this audit.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
