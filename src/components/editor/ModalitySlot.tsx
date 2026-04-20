import { ChevronRight, Plus } from 'lucide-react';

export const ModalitySlot = ({ 
  type, 
  label, 
  icon: Icon, 
  voiceId, 
  onClick,
  voiceDNAs,
  authorVoices
}: { 
  type: 'narrator' | 'lens' | 'rhythm' | 'temporal' | 'lexicon' | 'atmosphere', 
  label: string, 
  icon: any, 
  voiceId?: string, 
  onClick: () => void,
  voiceDNAs: any[],
  authorVoices: any[]
}) => {
  const voice = voiceDNAs.find(v => v.id === voiceId) || authorVoices.find(v => v.id === voiceId);

  return (
    <div 
      onClick={onClick}
      className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-4 ${
        voice 
          ? 'bg-secondary/5 border-secondary/20 hover:border-secondary/40' 
          : 'bg-surface-container-low/30 border-dashed border-white/5 hover:border-secondary/20 hover:bg-secondary/5'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            voice ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-highest text-on-surface-variant/40'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 block">
                {label}
              </span>
              {voice?.isForeshadowing && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter border border-primary/20">
                  Foreshadow
                </span>
              )}
            </div>
            <h4 className={`font-headline font-bold transition-colors ${
              voice ? 'text-on-surface' : 'text-on-surface-variant/20'
            }`}>
              {voice ? voice.name : 'Unassigned Slot'}
            </h4>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 transition-all ${
          voice ? 'text-secondary opacity-40 group-hover:opacity-100' : 'text-on-surface-variant/10'
        }`} />
      </div>

      {voice && (
        <p className="text-[9px] text-on-surface-variant/60 line-clamp-2 italic leading-relaxed">
          {voice.narrativeStyle}
        </p>
      )}

      {!voice && (
        <div className="flex items-center gap-2 text-[9px] font-label uppercase tracking-widest text-on-surface-variant/30">
          <Plus className="w-3 h-3" />
          Assign Voice DNA
        </div>
      )}
    </div>
  );
};
