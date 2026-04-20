import { Check, Sparkles, Trash2, Save, Mic2, Eye, Zap, Clock, PenTool } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { ModalitySlot } from './ModalitySlot';

export const SuiteEditor = ({
  editingSuite,
  setEditingSuite,
  deleteVoiceSuite,
  setIsSelectingVoice,
  handleSaveSuite,
  voiceDNAs,
  authorVoices,
}: {
  editingSuite: any;
  setEditingSuite: (suite: any) => void;
  deleteVoiceSuite: (id: string) => void;
  setIsSelectingVoice: (modality: any) => void;
  handleSaveSuite: () => void;
  voiceDNAs: any[];
  authorVoices: any[];
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* Suite Info */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60">Suite Name</label>
            <input 
              value={editingSuite.name}
              onChange={(e) => setEditingSuite({ ...editingSuite, name: e.target.value })}
              placeholder="e.g. A.N."
              className="w-full text-lg bg-surface-container-highest/30 border-white/5 rounded-lg p-4 focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant/60">Description</label>
            <Textarea 
              value={editingSuite.description || ''}
              onChange={(e) => setEditingSuite({ ...editingSuite, description: e.target.value })}
              placeholder="Describe the intent of this persona..."
              rows={2}
              className="w-full bg-surface-container-highest/30 border-white/5 rounded-lg p-4 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setEditingSuite({ ...editingSuite, isActive: !editingSuite.isActive })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-label text-[9px] uppercase tracking-widest ${
              editingSuite.isActive 
                ? 'bg-secondary/20 border-secondary/40 text-secondary' 
                : 'bg-surface-container-low border-white/5 text-on-surface-variant/40 hover:border-secondary/20 hover:text-on-surface-variant'
            }`}
          >
            {editingSuite.isActive ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            {editingSuite.isActive ? 'Active Suite' : 'Set as Active'}
          </button>
          <button 
            onClick={() => {
              deleteVoiceSuite(editingSuite.id);
              setEditingSuite(null);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-surface-container-low text-on-surface-variant/40 hover:bg-error/10 hover:text-error hover:border-error/20 transition-all font-label text-[9px] uppercase tracking-widest"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Suite
          </button>
        </div>
      </div>

      {/* Modality Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModalitySlot 
          type="narrator"
          label="The Narrator"
          icon={Mic2}
          voiceId={editingSuite.modalities.narrator}
          onClick={() => setIsSelectingVoice({ modality: 'narrator' })}
          voiceDNAs={voiceDNAs}
          authorVoices={authorVoices}
        />
        <ModalitySlot 
          type="lens"
          label="The Lens"
          icon={Eye}
          voiceId={editingSuite.modalities.lens}
          onClick={() => setIsSelectingVoice({ modality: 'lens' })}
          voiceDNAs={voiceDNAs}
          authorVoices={authorVoices}
        />
        <ModalitySlot 
          type="rhythm"
          label="The Rhythm"
          icon={Zap}
          voiceId={editingSuite.modalities.rhythm}
          onClick={() => setIsSelectingVoice({ modality: 'rhythm' })}
          voiceDNAs={voiceDNAs}
          authorVoices={authorVoices}
        />
        <ModalitySlot 
          type="temporal"
          label="The Temporal Filter"
          icon={Clock}
          voiceId={editingSuite.modalities.temporal}
          onClick={() => setIsSelectingVoice({ modality: 'temporal' })}
          voiceDNAs={voiceDNAs}
          authorVoices={authorVoices}
        />
        <ModalitySlot 
          type="lexicon"
          label="The Lexicon"
          icon={PenTool}
          voiceId={editingSuite.modalities.lexicon}
          onClick={() => setIsSelectingVoice({ modality: 'lexicon' })}
          voiceDNAs={voiceDNAs}
          authorVoices={authorVoices}
        />
        <ModalitySlot 
          type="atmosphere"
          label="The Atmosphere"
          icon={Sparkles}
          voiceId={editingSuite.modalities.atmosphere}
          onClick={() => setIsSelectingVoice({ modality: 'atmosphere' })}
          voiceDNAs={voiceDNAs}
          authorVoices={authorVoices}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSaveSuite}
          className="flex items-center gap-3 px-10 py-4 bg-primary hover:bg-primary/90 rounded-lg text-surface font-black uppercase tracking-wider text-[9px] shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] relative overflow-hidden group/btn"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
          <Save className="w-4 h-4" />
          Save Persona Suite
        </button>
      </div>
    </div>
  );
};
