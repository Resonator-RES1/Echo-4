import { useState, useMemo, useEffect } from 'react';
import { VoiceProfile } from '../types';
import { useLoreStore } from '../stores/useLoreStore';

export const useVoiceLogic = () => {
  const { 
    voiceProfiles, 
    voiceCollections,
    addVoiceProfile, 
    deleteVoiceProfile, 
    importVoiceProfiles, 
  } = useLoreStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  const [editingProfile, setEditingProfile] = useState<VoiceProfile | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingEvolutionFor, setCreatingEvolutionFor] = useState<string | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleOpenProfile = (e: Event) => {
      const customEvent = e as CustomEvent;
      const profileId = customEvent.detail;
      const profile = voiceProfiles.find(v => v.id === profileId);
      if (profile) {
        setEditingProfile(profile);
        setIsCreating(false);
      }
    };
    window.addEventListener('open-voice-profile', handleOpenProfile);
    return () => window.removeEventListener('open-voice-profile', handleOpenProfile);
  }, [voiceProfiles]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!initialized && voiceCollections.length > 0) {
    setInitialized(true);
    setExpandedCollections(new Set(voiceCollections.map(c => c.id)));
  }

  const toggleCollection = (id: string) => {
    const next = new Set(expandedCollections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCollections(next);
  };

  const handleSaveProfile = async (profile: VoiceProfile) => {
    await addVoiceProfile(profile);
    setIsCreating(false);
    setCreatingEvolutionFor(undefined);
    setEditingProfile(profile);
  };

  const handleEditProfile = (profile: VoiceProfile) => {
    setEditingProfile(profile);
    setIsCreating(false);
  };

  const handleAddNew = () => {
    setEditingProfile(undefined);
    setCreatingEvolutionFor(undefined);
    setIsCreating(true);
  };

  const handleCreateEvolution = (parentId: string) => {
    setEditingProfile(undefined);
    setCreatingEvolutionFor(parentId);
    setIsCreating(true);
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingProfile(undefined);
    setCreatingEvolutionFor(undefined);
  };

  const handleExport = () => {
    const dataToExport = voiceProfiles;
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'echo-character-voices.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
            await importVoiceProfiles(data);
        }
      } catch (error) {
        console.error("Failed to import voices:", error);
      }
    };
    reader.readAsText(file);
  };

  const filteredCharacterVoices = useMemo(() => {
    return voiceProfiles.filter(v => 
      !v.parentId && (
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.archetype?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [voiceProfiles, searchQuery]);

  const filteredCollections = useMemo(() => {
    return voiceCollections.filter(c => c.type === 'character');
  }, [voiceCollections]);

  const voicesByCollection = useMemo(() => {
    const map: Record<string, { characters: VoiceProfile[] }> = {};
    filteredCollections.forEach(c => {
      map[c.id] = {
        characters: filteredCharacterVoices.filter(v => v.collectionId === c.id)
      };
    });
    return map;
  }, [filteredCollections, filteredCharacterVoices]);

  return {
    voiceProfiles,
    voiceCollections,
    searchQuery,
    setSearchQuery,
    expandedCollections,
    toggleCollection,
    editingProfile,
    isCreating,
    isMobile,
    handleSaveProfile,
    handleEditProfile,
    handleAddNew,
    handleCloseForm,
    handleExport,
    handleImport,
    filteredCollections,
    voicesByCollection,
    deleteVoiceProfile,
    creatingEvolutionFor,
    handleCreateEvolution
  };
};
