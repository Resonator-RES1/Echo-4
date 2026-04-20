import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { VoiceProfile, VoiceCollection } from '../../types';

interface VoiceCollectionListProps {
  filteredCollections: VoiceCollection[];
  voicesByCollection: Record<string, { characters: VoiceProfile[] }>;
  expandedCollections: Set<string>;
  toggleCollection: (id: string) => void;
  editingProfile?: VoiceProfile;
  handleEditProfile: (profile: VoiceProfile) => void;
  deleteVoiceProfile: (id: string) => void;
  handleCloseForm: () => void;
  searchQuery: string;
}

export const VoiceCollectionList: React.FC<VoiceCollectionListProps> = ({
  filteredCollections,
  voicesByCollection,
  expandedCollections,
  toggleCollection,
  editingProfile,
  handleEditProfile,
  deleteVoiceProfile,
  handleCloseForm,
  searchQuery
}) => {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
      {filteredCollections.map(collection => {
        const collectionVoices = voicesByCollection[collection.id];
        const characters = collectionVoices?.characters || [];
        const hasEntries = characters.length > 0;
        
        if (!hasEntries && searchQuery) return null;
        
        const isExpanded = expandedCollections.has(collection.id);

        return (
          <div key={collection.id} className="space-y-3">
            <button 
              onClick={() => toggleCollection(collection.id)}
              className="w-full flex items-center justify-between group/coll py-1"
            >
              <div className="flex items-center gap-2">
                <div className={`w-1 h-3 rounded-full bg-primary/30 transition-all ${isExpanded ? 'h-4 bg-primary shadow-primary-glow' : ''}`} />
                <span className={`font-label text-[9px] uppercase tracking-wider transition-colors ${isExpanded ? 'text-on-surface' : 'text-on-surface-variant/40 group-hover/coll:text-on-surface-variant/70'}`}>
                  {collection.name}
                </span>
                <span className="text-[8px] font-mono text-on-surface-variant/20">
                  [{characters.length}]
                </span>
              </div>
              <ChevronRight className={`w-3 h-3 text-on-surface-variant/20 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-primary/40' : ''}`} />
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-3"
                >
                  {characters.length === 0 ? (
                      <div className="pl-4 py-4 text-on-surface-variant/20 text-[9px] italic uppercase tracking-widest">
                        No character resonance in this collection.
                      </div>
                  ) : (
                      characters.map(voice => (
                        <div 
                          key={voice.id} 
                          onClick={() => handleEditProfile(voice)}
                          className={`p-5 rounded-lg border transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                            editingProfile?.id === voice.id 
                              ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' 
                              : 'bg-surface-container-low/20 border-white/5 hover:border-primary/20 hover:bg-primary/5'
                          }`}
                        >
                          {voice.isActive && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 blur-2xl rounded-full -mr-8 -mt-8" />
                          )}
                          <div className="flex justify-between items-start mb-3 relative z-10">
                            <span className={`font-label text-[8px] uppercase tracking-widest flex items-center gap-1.5 ${voice.isActive ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                              {voice.isActive && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                              {voice.isActive ? 'Active Resonance' : 'Character DNA'}
                            </span>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                deleteVoiceProfile(voice.id);
                                if (editingProfile?.id === voice.id) handleCloseForm();
                              }}
                              className="text-on-surface-variant/40 hover:text-error transition-colors p-3 -mr-3 -mt-3"
                              title="Purge DNA"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="font-headline text-base font-bold mb-2 text-on-surface group-hover:text-primary transition-colors">{voice.name}</h4>
                          <p className="font-body text-[9px] text-on-surface-variant/60 line-clamp-2 leading-relaxed">
                            {voice.archetype || "No archetype defined."}
                          </p>
                        </div>
                      ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Empty State if no collections or no voices at all */}
      {filteredCollections.length === 0 && (
        <div className="text-center py-12 text-on-surface-variant/40 text-[9px] uppercase tracking-widest italic">
          No collections defined.
        </div>
      )}
    </div>
  );
};
