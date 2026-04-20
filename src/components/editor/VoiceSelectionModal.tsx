import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VoiceSelectionModal = ({
  isSelectingVoice,
  setIsSelectingVoice,
  voiceDNAs,
  authorVoices,
  editingSuite,
  handleSelectVoice,
}: {
  isSelectingVoice: any;
  setIsSelectingVoice: (value: any) => void;
  voiceDNAs: any[];
  authorVoices: any[];
  editingSuite: any;
  handleSelectVoice: (id: string) => void;
}) => {
  return (
    <AnimatePresence>
      {isSelectingVoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSelectingVoice(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-surface-container-low rounded-xl border border-white/5 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">Select Voice DNA</h3>
                <p className="text-xs text-on-surface-variant/60 uppercase font-label tracking-widest">
                  Assigning to: {isSelectingVoice.modality}
                </p>
              </div>
              <button 
                onClick={() => setIsSelectingVoice(null)}
                className="p-2 rounded-xl hover:bg-surface-container-highest transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {voiceDNAs.length === 0 && authorVoices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-on-surface-variant/40 italic">Your Voice Library is empty.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Author Voices Section */}
                  {authorVoices.filter(v => !isSelectingVoice.modality || v.modality === isSelectingVoice.modality).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/40 ml-2">Author Voices</h4>
                      {authorVoices
                        .filter(v => !isSelectingVoice.modality || v.modality === isSelectingVoice.modality)
                        .map(voice => (
                          <div 
                            key={voice.id}
                            onClick={() => handleSelectVoice(voice.id)}
                            className="p-5 rounded-lg border border-white/5 bg-surface-container-highest/30 hover:bg-secondary/5 hover:border-secondary/20 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <h4 className="font-headline font-bold text-on-surface group-hover:text-secondary transition-colors">
                                  {voice.name}
                                </h4>
                                <span className="text-[8px] font-label uppercase tracking-widest text-secondary/60">
                                  {voice.category}
                                </span>
                              </div>
                              {editingSuite?.modalities[isSelectingVoice.modality] === voice.id && (
                                <Check className="w-4 h-4 text-secondary" />
                              )}
                            </div>
                            <p className="text-[9px] text-on-surface-variant/60 line-clamp-2 italic">
                              {voice.narrativeStyle}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Legacy Voice DNAs Section */}
                  {voiceDNAs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/40 ml-2">Voice DNAs</h4>
                      {voiceDNAs.map(voice => (
                        <div 
                          key={voice.id}
                          onClick={() => handleSelectVoice(voice.id)}
                          className="p-5 rounded-lg border border-white/5 bg-surface-container-highest/30 hover:bg-secondary/5 hover:border-secondary/20 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-headline font-bold text-on-surface group-hover:text-secondary transition-colors">
                                {voice.name}
                              </h4>
                              {voice.isForeshadowing && (
                                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter border border-primary/20">
                                  Foreshadow
                                </span>
                              )}
                            </div>
                            {editingSuite?.modalities[isSelectingVoice.modality] === voice.id && (
                              <Check className="w-4 h-4 text-secondary" />
                            )}
                          </div>
                          <p className="text-[9px] text-on-surface-variant/60 line-clamp-2 italic">
                            {voice.narrativeStyle}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
