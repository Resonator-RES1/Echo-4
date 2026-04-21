import React from 'react';
import { User, Trash2, Plus, Sparkles, UserRound, UserCircle, Square, Circle, Hexagon, Users, Zap } from 'lucide-react';
import { VoiceProfile } from '../../types';
import { GenderIcon } from '../GenderIcon';

interface CharacterVoicesListProps {
  voiceProfiles: VoiceProfile[];
  onEdit: (profile: VoiceProfile) => void;
  onAddNew: () => void;
  onDelete: (id: string) => void;
}

export function CharacterVoicesList({
  voiceProfiles,
  onEdit,
  onAddNew,
  onDelete
}: CharacterVoicesListProps) {
  return (
    <div className="lg:col-span-12 space-y-8">
      <div className="flex items-center gap-4">
        <h3 className="font-headline text-3xl flex items-center gap-3">
          Character Voices
          <User className="text-primary w-7 h-7" />
        </h3>
        <span className="font-label text-xs font-normal text-on-surface-variant py-1 px-3 bg-surface-container rounded-full uppercase tracking-tighter">
          {String(voiceProfiles.length).padStart(2, '0')} Profiles
        </span>
      </div>
      
      {voiceProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 bg-surface-container-lowest/50 rounded-xl border border-outline-variant/10">
          <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-2">
            <Users className="w-10 h-10 text-primary/40" />
          </div>
          <div className="space-y-2">
            <h4 className="font-headline text-2xl font-light text-on-surface">No Character Voices</h4>
            <p className="font-body text-on-surface-variant max-w-md mx-auto text-sm">
              Give your characters distinct dialogue patterns. Add a voice profile to ensure they sound consistent throughout your manuscript.
            </p>
          </div>
          <button 
            onClick={onAddNew}
            className="px-8 py-3 rounded-full bg-primary/10 text-primary font-label text-xs uppercase tracking-widest hover:bg-primary/20 transition-all duration-300"
          >
            Create Character Voice
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {voiceProfiles.map(profile => (
            <div 
              key={profile.id} 
              onClick={() => onEdit(profile)}
              className={`glass-slab p-4 rounded-lg border transition-all duration-500 group cursor-pointer relative overflow-hidden ${profile.isActive ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-outline-variant/10 hover:border-primary/30'}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${profile.isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  {profile.gender === 'male' ? <Square className="w-5 h-5" /> : 
                   profile.gender === 'female' ? <Circle className="w-5 h-5" /> : 
                   <Hexagon className="w-5 h-5" />}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {profile.tensionVectors && profile.tensionVectors.length > 0 && (
                      <span className="font-label text-[9px] uppercase tracking-widest text-secondary bg-secondary/10 py-1 px-2 rounded-full flex items-center gap-1" title="Kinetic Tension Core Active">
                        <Zap className="w-2.5 h-2.5" />
                        Kinetic
                      </span>
                    )}
                    {profile.isActive && (
                      <span className="font-label text-[9px] uppercase tracking-widest text-primary bg-primary/10 py-1 px-2 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2 h-2" />
                        Active
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
                    className="text-on-surface-variant/30 hover:text-error transition-colors mr-1"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h4 className="font-headline text-xl mb-1 group-hover:text-primary transition-colors relative z-10">{profile.name}</h4>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <GenderIcon gender={profile.gender} className="w-3 h-3 text-on-surface-variant/70" />
                <span className="text-xs text-on-surface-variant/70 uppercase tracking-wider">{profile.archetype}</span>
              </div>
              
              {profile.preview && (
                <div className="mb-4 p-3 rounded-lg bg-surface-container-highest/50 border border-outline-variant/10 relative z-10">
                  <p className="font-body text-xs text-on-surface-variant italic line-clamp-2">"{profile.preview}"</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 relative z-10">
                {profile.signatureTraits.slice(0, 2).map((trait, idx) => (
                  <span key={idx} className="px-2 py-1 bg-surface-container rounded-md text-[9px] text-on-surface-variant uppercase tracking-wider">
                    {trait}
                  </span>
                ))}
                {profile.signatureTraits.length > 2 && (
                  <span className="px-2 py-1 bg-surface-container rounded-md text-[9px] text-on-surface-variant uppercase tracking-wider">
                    +{profile.signatureTraits.length - 2}
                  </span>
                )}
              </div>
            </div>
          ))}

          <div 
            onClick={onAddNew}
            className="group border border-dashed border-outline-variant/30 rounded-lg p-5 flex flex-col items-center justify-center gap-4 hover:border-primary/40 transition-all duration-500 cursor-pointer bg-surface-container/10"
          >
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Plus className="text-on-surface-variant group-hover:text-primary transition-colors w-6 h-6" />
            </div>
            <p className="font-label text-sm text-on-surface-variant group-hover:text-primary transition-colors">Create Profile</p>
          </div>
        </div>
      )}
    </div>
  );
}
