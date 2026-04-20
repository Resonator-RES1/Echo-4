import { useState, useEffect } from 'react';
import { useLoreStore } from '../stores/useLoreStore';
import { usePromptStore } from '../stores/usePromptStore';
import { AuthorVoiceSuite, AuthorVoice, PromptFragment } from '../types';

export const useSuiteBuilder = () => {
  const { 
    voiceDNAs, 
    voiceSuites, 
    authorVoices,
    addVoiceSuite, 
    deleteVoiceSuite, 
    addAuthorVoice,
  } = useLoreStore();

  const {
    fragments,
    addFragment,
    updateFragment,
    deleteFragment,
    toggleFragment
  } = usePromptStore();

  const [activeTab, setActiveTab] = useState<'suites' | 'voices' | 'fragments'>('suites');
  const [editingSuite, setEditingSuite] = useState<AuthorVoiceSuite | null>(null);
  const [editingVoice, setEditingVoice] = useState<AuthorVoice | null>(null);
  const [editingFragment, setEditingFragment] = useState<PromptFragment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSelectingVoice, setIsSelectingVoice] = useState<{ modality: 'narrator' | 'lens' | 'rhythm' | 'temporal' | 'lexicon' | 'atmosphere' } | null>(null);

  useEffect(() => {
    const handleOpenVoice = (e: Event) => {
      const customEvent = e as CustomEvent;
      const voiceId = customEvent.detail;
      const voice = authorVoices.find(v => v.id === voiceId);
      if (voice) {
        setEditingVoice(voice);
        setEditingSuite(null);
        setEditingFragment(null);
        setIsCreating(false);
        setActiveTab('voices');
      }
    };
    window.addEventListener('open-author-voice', handleOpenVoice);
    return () => window.removeEventListener('open-author-voice', handleOpenVoice);
  }, [authorVoices]);

  const handleCreateNewSuite = () => {
    const newSuite: AuthorVoiceSuite = {
      id: Date.now().toString(),
      name: 'New Persona Suite',
      modalities: {},
      lastModified: new Date().toISOString(),
      isActive: voiceSuites.length === 0
    };
    setEditingSuite(newSuite);
    setEditingVoice(null);
    setEditingFragment(null);
    setIsCreating(true);
    setActiveTab('suites');
  };

  const handleCreateNewVoice = () => {
    setEditingVoice(null);
    setEditingSuite(null);
    setEditingFragment(null);
    setIsCreating(true);
    setActiveTab('voices');
  };

  const handleCreateNewFragment = () => {
    const newFragment: PromptFragment = {
      id: Date.now().toString(),
      name: 'New Directive',
      description: '',
      content: '',
      category: 'directive',
      tags: [],
      lastModified: new Date().toISOString(),
      isActive: true
    };
    setEditingFragment(newFragment);
    setEditingSuite(null);
    setEditingVoice(null);
    setIsCreating(true);
    setActiveTab('fragments');
  };

  const handleSaveSuite = async () => {
    if (!editingSuite) return;
    await addVoiceSuite(editingSuite);
    setEditingSuite(null);
    setIsCreating(false);
  };

  const handleSaveVoice = async (voice: AuthorVoice) => {
    console.log("Saving AuthorVoice:", voice);
    try {
      await addAuthorVoice(voice);
      console.log("Successfully added AuthorVoice to store.");
    } catch (error) {
      console.error("Error in handleSaveVoice:", error);
    }
    setEditingVoice(null);
    setIsCreating(false);
  };

  const handleSaveFragment = async () => {
    if (!editingFragment) return;
    if (fragments.find(f => f.id === editingFragment.id)) {
      await updateFragment(editingFragment);
    } else {
      await addFragment(editingFragment);
    }
    setEditingFragment(null);
    setIsCreating(false);
  };

  const handleSelectVoice = (voiceId: string) => {
    if (!editingSuite || !isSelectingVoice) return;

    const updatedSuite = {
      ...editingSuite,
      modalities: {
        ...editingSuite.modalities,
        [isSelectingVoice.modality]: voiceId
      }
    };
    setEditingSuite(updatedSuite);
    setIsSelectingVoice(null);
  };

  return {
    voiceDNAs,
    voiceSuites,
    authorVoices,
    fragments,
    activeTab,
    setActiveTab,
    editingSuite,
    setEditingSuite,
    editingVoice,
    setEditingVoice,
    editingFragment,
    setEditingFragment,
    isCreating,
    setIsCreating,
    isSelectingVoice,
    setIsSelectingVoice,
    handleCreateNewSuite,
    handleCreateNewVoice,
    handleCreateNewFragment,
    handleSaveSuite,
    handleSaveVoice,
    handleSaveFragment,
    handleSelectVoice,
    deleteVoiceSuite,
    deleteFragment,
    toggleFragment
  };
};
