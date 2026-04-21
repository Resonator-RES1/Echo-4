/* eslint-disable react-hooks/incompatible-library */
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, Mic2, Plus, Trash2, Fingerprint, Cpu, Sparkles, Users, Loader2, ChevronRight, ChevronLeft, Brain, Quote, Check as CheckIcon, Zap, PlusCircle } from 'lucide-react';
import { VoiceProfile, Relationship, TensionVector } from '../../types';
import { voiceProfileSchema, VoiceProfileFormValues, tensionVectorSchema } from '../../schemas';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { VoiceDNA } from '../ui/VoiceDNA';
import { useLoreStore } from '../../stores/useLoreStore';
import { motion, AnimatePresence } from 'motion/react';
import { StoryDateInput } from './StoryDateInput';

interface VoiceProfileFormProps {
  onClose: () => void;
  onSave: (profile: VoiceProfile) => void;
  initialData?: VoiceProfile;
  isModal?: boolean;
  voiceProfiles?: VoiceProfile[];
  parentId?: string;
  onCreateEvolution?: (parentId: string) => void;
  onEditEvolution?: (profile: VoiceProfile) => void;
}

export function VoiceProfileForm({ onClose, onSave, initialData, isModal = true, voiceProfiles = [], parentId, onCreateEvolution, onEditEvolution }: VoiceProfileFormProps) {
  const { voiceCollections } = useLoreStore();
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'edit' | 'history' | 'meta'>('edit');
  const [isSaved, setIsSaved] = useState(false);

  const parentProfile = parentId ? voiceProfiles.find(p => p.id === parentId) : null;
  const evolutions = voiceProfiles.filter(p => p.parentId === (initialData?.parentId || initialData?.id || parentId));

  const form = useForm<VoiceProfileFormValues>({
    resolver: zodResolver(voiceProfileSchema),
    defaultValues: {
      id: initialData?.id,
      parentId: initialData?.parentId || parentId,
      collectionId: initialData?.collectionId || parentProfile?.collectionId || voiceCollections.find(c => c.type === 'character')?.id || '',
      name: initialData?.name || parentProfile?.name || '',
      gender: initialData?.gender || (parentId ? '' : (parentProfile?.gender || 'unspecified')),
      archetype: initialData?.archetype || '',
      arcState: initialData?.arcState || 'introduction',
      emotionalBaseline: initialData?.emotionalBaseline || 'stoic',
      coreMotivation: initialData?.coreMotivation || '',
      aliases: initialData?.aliases?.join(', ') || '',
      soulPattern: initialData?.soulPattern || '',
      cognitiveSpeech: initialData?.cognitiveSpeech || '',
      conversationalRole: initialData?.conversationalRole || '',
      signatureTraits: initialData?.signatureTraits?.join(', ') || '',
      idioms: initialData?.idioms?.join(', ') || '',
      exampleLines: initialData?.exampleLines?.map(line => ({ value: line })) || [],
      physicalTells: Array.isArray(initialData?.physicalTells) 
        ? initialData.physicalTells.map(tell => ({ value: tell })) 
        : (initialData?.physicalTells ? [{ value: initialData.physicalTells }] : []),
      internalMonologue: initialData?.internalMonologue || '',
      conflictStyle: initialData?.conflictStyle || '',
      socialDynamics: initialData?.socialDynamics || '',
      relationships: initialData?.relationships || [],
      tensionVectors: initialData?.tensionVectors || [],
      storyDay: initialData?.storyDay || 0,
      storyDate: initialData?.storyDate || { year: 2026, month: 0, day: 1 },
      isForeshadowing: initialData?.isForeshadowing || false,
      isTimelineEnabled: initialData?.isTimelineEnabled ?? (initialData ? false : true),
      isPinned: initialData?.isPinned || false,
      antiMannerisms: initialData?.antiMannerisms?.join(', ') || '',
      isEvolution: !!(initialData?.parentId || parentId || initialData?.isEvolution),
      interactionPolarity: initialData?.interactionPolarity ?? 0.5,
      crackStrategy: initialData?.crackStrategy || '',
      negativeSpace: initialData?.negativeSpace || '',
      unresolvedCoexistence: initialData?.unresolvedCoexistence || '',
      dna: initialData?.dna || parentProfile?.dna || {
        warmth: 50,
        dominance: 50,
        stability: 50,
        complexity: 50,
      },
      dnaDescriptions: initialData?.dnaDescriptions || parentProfile?.dnaDescriptions || {
        warmth: '',
        dominance: '',
        stability: '',
        complexity: '',
      },
    }
  });

  const { fields: relFields, append: appendRel, remove: removeRel } = useFieldArray({
    control: form.control,
    name: "relationships"
  });

  const { fields: tensionFields, append: appendTension, remove: removeTension } = useFieldArray({
    control: form.control,
    name: "tensionVectors"
  });

  const { fields: lineFields, append: appendLine, remove: removeLine } = useFieldArray({
    control: form.control,
    name: "exampleLines"
  });

  const { fields: tellFields, append: appendTell, remove: removeTell } = useFieldArray({
    control: form.control,
    name: "physicalTells"
  });

  const { fields: goldFields, append: appendGold, remove: removeGold } = useFieldArray({
    control: form.control,
    name: "goldStandardSnippets"
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        parentId: initialData.parentId,
        collectionId: initialData.collectionId || voiceCollections.find(c => c.type === 'character')?.id || '',
        name: initialData.name || '',
        gender: initialData.gender || (initialData.parentId ? '' : 'unspecified'),
        archetype: initialData.archetype || '',
        coreMotivation: initialData.coreMotivation || '',
        aliases: initialData.aliases?.join(', ') || '',
        soulPattern: initialData.soulPattern || '',
        cognitiveSpeech: initialData.cognitiveSpeech || '',
        conversationalRole: initialData.conversationalRole || '',
        signatureTraits: initialData.signatureTraits?.join(', ') || '',
        idioms: initialData.idioms?.join(', ') || '',
        exampleLines: initialData.exampleLines?.map(line => ({ value: line })) || [],
        physicalTells: Array.isArray(initialData.physicalTells) 
          ? initialData.physicalTells.map(tell => ({ value: tell })) 
          : (initialData.physicalTells ? [{ value: initialData.physicalTells }] : []),
        internalMonologue: initialData.internalMonologue || '',
        conflictStyle: initialData.conflictStyle || '',
        socialDynamics: initialData.socialDynamics || '',
        relationships: initialData.relationships || [],
        tensionVectors: initialData.tensionVectors || [],
        storyDay: initialData.storyDay || 0,
        storyDate: initialData.storyDate || { year: 2026, month: 0, day: 1 },
        isForeshadowing: initialData.isForeshadowing || false,
        isTimelineEnabled: initialData.isTimelineEnabled ?? false,
        isPinned: initialData.isPinned || false,
        isEvolution: !!(initialData.parentId || initialData.isEvolution),
        interactionPolarity: initialData.interactionPolarity ?? 0.5,
        crackStrategy: initialData.crackStrategy || '',
        negativeSpace: initialData.negativeSpace || '',
        unresolvedCoexistence: initialData.unresolvedCoexistence || '',
        antiMannerisms: initialData.antiMannerisms?.join(', ') || '',
        goldStandardSnippets: initialData.goldStandardSnippets || [],
        dna: initialData.dna || {
          warmth: 50,
          dominance: 50,
          stability: 50,
          complexity: 50,
        },
        dnaDescriptions: initialData.dnaDescriptions || {
          warmth: '',
          dominance: '',
          stability: '',
          complexity: '',
        },
      });
    } else {
      form.reset({
        id: undefined,
        parentId: parentId,
        collectionId: parentProfile?.collectionId || voiceCollections.find(c => c.type === 'character')?.id || '',
        name: parentProfile?.name || '',
        gender: parentId ? '' : (parentProfile?.gender || 'unspecified'),
        archetype: '',
        arcState: 'introduction',
        emotionalBaseline: 'stoic',
        coreMotivation: '',
        aliases: '',
        soulPattern: '',
        cognitiveSpeech: '',
        conversationalRole: '',
        signatureTraits: '',
        idioms: '',
        exampleLines: [],
        physicalTells: [],
        internalMonologue: '',
        conflictStyle: '',
        socialDynamics: '',
        relationships: [],
        tensionVectors: parentProfile?.tensionVectors || [],
        storyDay: 0,
        storyDate: { year: 2026, month: 0, day: 1 },
        isForeshadowing: false,
        isTimelineEnabled: true,
        isPinned: false,
        isEvolution: !!parentId,
        goldStandardSnippets: parentProfile?.goldStandardSnippets || [],
        antiMannerisms: '',
        interactionPolarity: 0.5,
        crackStrategy: '',
        negativeSpace: '',
        unresolvedCoexistence: '',
        dna: parentProfile?.dna || { warmth: 50, dominance: 50, stability: 50, complexity: 50 },
        dnaDescriptions: parentProfile?.dnaDescriptions || { warmth: '', dominance: '', stability: '', complexity: '' },
      });
    }
  }, [initialData, form, voiceCollections, parentId, parentProfile?.name, parentProfile?.gender, parentProfile?.collectionId, parentProfile?.dna, parentProfile?.dnaDescriptions, parentProfile?.goldStandardSnippets, parentProfile?.tensionVectors]);

  const dna = form.watch('dna') || { warmth: 50, dominance: 50, stability: 50, complexity: 50 };
  const isSaving = form.formState.isSubmitting;

  const onSubmit = async (data: VoiceProfileFormValues) => {
    try {
      const profile: VoiceProfile = {
        id: initialData?.id || Date.now().toString(),
        parentId: data.parentId,
        collectionId: data.collectionId,
        name: data.name,
        gender: data.gender as any,
        archetype: data.archetype || '',
        arcState: data.arcState,
        emotionalBaseline: data.emotionalBaseline,
        coreMotivation: data.coreMotivation || '',
        aliases: data.aliases ? data.aliases.split(',').map(s => s.trim()).filter(Boolean) : [],
        soulPattern: data.soulPattern || '',
        cognitiveSpeech: data.cognitiveSpeech || '',
        conversationalRole: data.conversationalRole || '',
        signatureTraits: data.signatureTraits ? data.signatureTraits.split(',').map(t => t.trim()).filter(Boolean) : [],
        idioms: data.idioms ? data.idioms.split(',').map(i => i.trim()).filter(Boolean) : [],
        exampleLines: data.exampleLines?.map(l => l.value).filter(l => l.trim()) || [],
        physicalTells: data.physicalTells?.map(t => t.value).filter(t => t.trim()) || [],
        internalMonologue: data.internalMonologue || '',
        conflictStyle: data.conflictStyle || '',
        socialDynamics: data.socialDynamics || '',
        storyDay: data.storyDay,
        storyDate: data.storyDate,
        isForeshadowing: data.isForeshadowing,
        isTimelineEnabled: data.isTimelineEnabled,
        isPinned: data.isPinned,
        isEvolution: !!data.parentId || data.isEvolution,
        goldStandardSnippets: data.goldStandardSnippets || [],
        antiMannerisms: data.antiMannerisms ? data.antiMannerisms.split(',').map(s => s.trim()).filter(Boolean) : [],
        dna: data.dna,
        dnaDescriptions: data.dnaDescriptions ? {
          warmth: data.dnaDescriptions.warmth || '',
          dominance: data.dnaDescriptions.dominance || '',
          stability: data.dnaDescriptions.stability || '',
          complexity: data.dnaDescriptions.complexity || ''
        } : undefined,
        preview: initialData?.preview || '',
        relationships: data.relationships?.filter(r => r.targetId) as Relationship[] || [],
        tensionVectors: data.tensionVectors || [],
        interactionPolarity: data.interactionPolarity,
        crackStrategy: data.crackStrategy,
        negativeSpace: data.negativeSpace,
        unresolvedCoexistence: data.unresolvedCoexistence,
        lastModified: new Date().toISOString(),
        isActive: true,
      };
      onSave(profile);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save voice profile:", error);
    }
  };

  const handlePromoteToTension = (fieldName: keyof VoiceProfileFormValues, axis: TensionVector['axis'] = 'performance') => {
    const value = form.getValues(fieldName);
    if (typeof value === 'string' && value.trim()) {
      appendTension({
        id: Date.now().toString(),
        axis: axis,
        performance: value,
        essence: '',
        driftModifier: 0.5
      });
      setActiveTab('edit');
      setStep(2);
    }
  };

  const formContent = (
    <FormProvider {...form}>
      <div className={`w-full bg-surface-container-low overflow-hidden flex flex-col ${isModal ? 'max-w-4xl max-h-[90vh] rounded-xl border border-outline-variant/20 shadow-2xl p-5' : 'h-full p-6 lg:p-10'}`}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`flex-1 flex flex-col overflow-hidden w-full ${isModal ? 'max-w-4xl mx-auto' : ''}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Mic2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
                {(parentId || initialData?.parentId) ? `Evolution: ${parentProfile?.name}` : (initialData?.name || 'New Profile')}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <button 
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`text-[9px] font-label uppercase tracking-wider px-2 py-0.5 rounded-md transition-all ${activeTab === 'edit' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant/40 hover:text-on-surface-variant'}`}
                >
                  Configuration
                </button>
                {(initialData || parentId) && (
                  <button 
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`text-[9px] font-label uppercase tracking-wider px-2 py-0.5 rounded-md transition-all ${activeTab === 'history' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant/40 hover:text-on-surface-variant'}`}
                  >
                    Timeline ({evolutions.length})
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setActiveTab('meta')}
                  className={`text-[9px] font-label uppercase tracking-wider px-2 py-0.5 rounded-md transition-all ${activeTab === 'meta' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant/40 hover:text-on-surface-variant'}`}
                >
                  Metadata
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!(parentId || initialData?.parentId) && initialData && activeTab === 'edit' && (
              <Button 
                type="button" 
                size="sm" 
                className="rounded-xl h-8 text-[9px] font-black uppercase tracking-widest bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20 border-none px-4"
                onClick={() => {
                  if (initialData?.id && onCreateEvolution) {
                    onCreateEvolution(initialData.id);
                  }
                }}
              >
                <Plus className="w-3 h-3 mr-1" /> New Page
              </Button>
            )}
            <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container-highest transition-all">
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'history' ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-4"
              >
                <div className="relative pl-8 border-l-2 border-outline-variant/20 ml-4 py-4 space-y-8">
                  <div className="relative">
                    <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-surface-container-low" />
                    <div 
                      className={`p-4 rounded-lg border transition-all cursor-pointer group ${!initialData?.parentId && !parentId ? 'bg-primary/10 border-primary/30' : 'bg-surface-container-highest/20 border-outline-variant/10 hover:border-primary/40'}`}
                      onClick={() => {
                        const targetId = initialData?.parentId || parentId;
                        if (targetId && onEditEvolution) {
                          const base = voiceProfiles.find(p => p.id === targetId);
                          if (base) onEditEvolution(base);
                        }
                        setActiveTab('edit');
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">Base Profile</h4>
                          <p className="text-xs text-on-surface-variant/60 mt-1">The original axioms of this character.</p>
                        </div>
                        {!initialData?.parentId && !parentId && <div className="text-[9px] font-black text-primary uppercase tracking-widest">Active</div>}
                      </div>
                    </div>
                  </div>
                  {evolutions.sort((a, b) => (a.storyDay || 0) - (b.storyDay || 0)).map((evo) => (
                    <div key={evo.id} className="relative">
                      <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-secondary border-4 border-surface-container-low" />
                      <div 
                        className={`p-4 rounded-lg border transition-all cursor-pointer group ${initialData?.id === evo.id ? 'bg-secondary/10 border-secondary/30' : 'bg-surface-container-highest/20 border-outline-variant/10 hover:border-secondary/40'}`}
                        onClick={() => {
                          if (onEditEvolution) onEditEvolution(evo);
                          setActiveTab('edit');
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-on-surface">Day {evo.storyDay} Evolution</h4>
                            <p className="text-xs text-on-surface-variant/60 mt-1">
                              {evo.coreMotivation ? 'Motivation Shifted' : ''} 
                              {evo.cognitiveSpeech ? ' • Voice Altered' : ''}
                              {!evo.coreMotivation && !evo.cognitiveSpeech ? 'Temporal Marker' : ''}
                            </p>
                          </div>
                          {initialData?.id === evo.id && <div className="text-[9px] font-black text-secondary uppercase tracking-widest">Active</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : activeTab === 'meta' ? (
              <motion.div
                key="meta"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full space-y-8 overflow-y-auto custom-scrollbar pr-2"
              >
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface tracking-tight flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-primary" /> Architectural Guardianship
                  </h3>
                  <p className="text-xs text-on-surface-variant/60 mt-1">System-level controls for temporal placement and semantic pinning.</p>
                </div>

                <div className="p-6 bg-surface-container-highest/30 border border-outline-variant/20 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-on-surface">Temporal Positioning</h4>
                    <label className="flex items-center gap-2 text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 cursor-pointer">
                      <input type="checkbox" {...form.register('isPinned')} className="rounded border-outline-variant/30" />
                      Semantic Pinning
                    </label>
                  </div>
                  
                  <StoryDateInput />
                  
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 cursor-pointer">
                      <input type="checkbox" {...form.register('isTimelineEnabled')} className="rounded border-outline-variant/30" />
                      Enable Timeline
                    </label>
                    <label className="flex items-center gap-2 text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 cursor-pointer">
                      <input type="checkbox" {...form.register('isForeshadowing')} className="rounded border-outline-variant/30" />
                      Foreshadowing
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Profile Metadata</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                      <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Profile ID</p>
                      <p className="text-xs font-mono mt-1">{initialData?.id || 'Unassigned'}</p>
                    </div>
                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                      <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest">Parent Source</p>
                      <p className="text-xs font-mono mt-1">{initialData?.parentId || 'Root Axiom'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full space-y-8 overflow-y-auto custom-scrollbar pr-2"
              >
              <div className="space-y-1">
                <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Name</label>
                <input 
                  {...form.register('name')}
                  placeholder={parentProfile?.name || "Untitled Character"}
                  className="w-full bg-transparent border-none text-4xl font-headline font-light text-on-surface placeholder:text-on-surface-variant/20 outline-none p-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Collection</label>
                  <select {...form.register('collectionId')} className="w-full bg-surface-container-highest/30 border border-outline-variant/20 rounded-lg p-3 text-sm">
                    {voiceCollections.filter(c => c.type === 'character').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Gender</label>
                  <Input {...form.register('gender')} placeholder={parentProfile?.gender || "e.g., Male, Female"} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-3" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Archetype</label>
                  <Input {...form.register('archetype')} placeholder={parentProfile?.archetype || "e.g., The Reluctant Hero"} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-3" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Arc State</label>
                  <select {...form.register('arcState')} className="w-full bg-surface-container-highest/30 border border-outline-variant/20 rounded-lg p-3 text-sm">
                    <option value="introduction">Introduction</option>
                    <option value="development">Development</option>
                    <option value="climax">Climax</option>
                    <option value="resolution">Resolution</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Emotional Baseline</label>
                  <select {...form.register('emotionalBaseline')} className="w-full bg-surface-container-highest/30 border border-outline-variant/20 rounded-lg p-3 text-sm">
                    <option value="stoic">Stoic</option>
                    <option value="volatile">Volatile</option>
                    <option value="melancholic">Melancholic</option>
                    <option value="optimistic">Optimistic</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Aliases</label>
                  <Input {...form.register('aliases')} placeholder={parentProfile?.aliases?.join(', ') || "Comma separated..."} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-3" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1 flex items-center justify-between">
                  Baseline Motivation {(parentId || initialData?.parentId) && <span className="text-primary/60 italic">(Leave blank to inherit)</span>}
                  <button type="button" onClick={() => handlePromoteToTension('coreMotivation')} className="text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 font-black"><PlusCircle className="w-3 h-3" /> PROMOTE</button>
                </label>
                <Textarea {...form.register('coreMotivation')} placeholder={parentProfile?.coreMotivation || "What is their default, surface-level drive?"} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[120px]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1 flex items-center justify-between">
                  Baseline Soul Pattern {(parentId || initialData?.parentId) && <span className="text-primary/60 italic">(Leave blank to inherit)</span>}
                  <button type="button" onClick={() => handlePromoteToTension('soulPattern')} className="text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 font-black"><PlusCircle className="w-3 h-3" /> PROMOTE</button>
                </label>
                <Textarea {...form.register('soulPattern')} placeholder={parentProfile?.soulPattern || "The standard 'Hard Rules' of their voice..."} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[120px]" />
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full space-y-8 overflow-y-auto custom-scrollbar pr-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface tracking-tight flex items-center gap-2">
                    <Zap className="w-5 h-5 text-secondary" /> The Kinetic Core
                  </h3>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Define the unresolved forces and internal frictions that drive this character.</p>
                </div>
                <button type="button" onClick={() => appendTension({ id: Date.now().toString(), axis: 'performance', performance: '', essence: '', driftModifier: 0.5 })} className="text-xs text-secondary font-black uppercase tracking-widest hover:text-secondary/80 transition-colors">Add Vector</button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {tensionFields.map((field, idx) => (
                  <div key={field.id} className="p-6 bg-surface-container-highest/30 border border-outline-variant/20 rounded-2xl space-y-6 relative group/tension shadow-sm">
                    <button type="button" onClick={() => removeTension(idx)} className="absolute top-4 right-4 text-on-surface-variant/20 hover:text-error transition-colors"><Trash2 className="w-5 h-5" /></button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Axis of Friction</label>
                        <select {...form.register(`tensionVectors.${idx}.axis`)} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-xs font-bold">
                          <option value="integrity">Integrity</option>
                          <option value="survival">Survival</option>
                          <option value="cognition">Cognition</option>
                          <option value="performance">Performance</option>
                          <option value="social">Social</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="flex justify-between text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">
                          Drift Modifier <span>{(form.watch(`tensionVectors.${idx}.driftModifier`) * 100).toFixed(0)}%</span>
                        </label>
                        <input type="range" min="0" max="1" step="0.01" {...form.register(`tensionVectors.${idx}.driftModifier`, { valueAsNumber: true })} className="w-full accent-secondary h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer mt-3" />
                        <p className="text-[8px] text-on-surface-variant/40 italic">Higher drift increases susceptibility to "cracking" under pressure.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Performance (Surface Behavior)</label>
                        <Textarea {...form.register(`tensionVectors.${idx}.performance`)} placeholder="What they show to the world..." className="bg-surface-container-low border-none rounded-xl p-3 text-xs min-h-[80px] leading-relaxed" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Essence (Hidden Truth)</label>
                        <Textarea {...form.register(`tensionVectors.${idx}.essence`)} placeholder="What they truly are or need..." className="bg-surface-container-low border-none rounded-xl p-3 text-xs min-h-[80px] leading-relaxed" />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 cursor-pointer hover:text-primary transition-colors">
                        <input type="checkbox" {...form.register(`tensionVectors.${idx}.isUnresolved`)} className="rounded border-outline-variant/30 text-primary focus:ring-primary" />
                        Force Coexistence (The "Unresolved" Tension)
                      </label>
                      <p className="text-[8px] text-on-surface-variant/30 mt-1 ml-6 italic">If enabled, the engine treats Performance and Essence as cohabiting states rather than a mask over a truth.</p>
                    </div>
                  </div>
                ))}

                {tensionFields.length === 0 && (
                  <div className="py-12 border-2 border-dashed border-outline-variant/20 rounded-3xl flex flex-col items-center justify-center text-center opacity-40">
                    <Zap className="w-8 h-8 text-secondary mb-3" />
                    <p className="text-sm font-bold text-on-surface">No Kinetic Vectors defined.</p>
                    <p className="text-xs text-on-surface-variant mt-1">Characters without tension may feel "consistent" but "lifeless".</p>
                    <button type="button" onClick={() => appendTension({ id: Date.now().toString(), axis: 'performance', performance: '', essence: '', driftModifier: 0.5 })} className="mt-4 text-xs text-secondary font-black uppercase tracking-widest">Ignite the Core</button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : step === 3 ? (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full space-y-8 overflow-y-auto custom-scrollbar pr-2"
            >
              <div className="flex flex-col items-center justify-center py-4">
                <VoiceDNA data={dna} color="var(--color-primary)" size={200} />
                {(parentId || initialData?.parentId) && <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mt-4">Evolutionary Drift from Base</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Object.keys(dna).map((key) => (
                  <div key={key} className="space-y-3 p-4 bg-surface-container-highest/20 rounded-xl border border-outline-variant/10">
                    <div className="flex justify-between text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60">
                      <span className="font-bold">{key}</span>
                      <span className="font-mono">{dna[key as keyof typeof dna]}%</span>
                    </div>
                    <input type="range" min="0" max="100" {...form.register(`dna.${key as keyof typeof dna}`, { valueAsNumber: true })} className="w-full accent-primary h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer" />
                    <Textarea {...form.register(`dnaDescriptions.${key as keyof typeof dna}` as any)} placeholder={parentProfile?.dnaDescriptions?.[key as keyof typeof dna] || `Describe ${key}...`} className="bg-transparent border-none p-0 min-h-[60px] resize-none text-xs italic" />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full space-y-8 overflow-y-auto custom-scrollbar pr-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-6">
                  <div className="pb-2 border-b border-outline-variant/10 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-bold text-on-surface">Interaction Physics</h3>
                  </div>
                  <div className="space-y-3 p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                    <label className="flex justify-between text-[9px] font-label uppercase tracking-widest text-secondary ml-1">
                      Interaction Polarity 
                      <span className="font-mono">{(form.watch('interactionPolarity') * 100).toFixed(0)}%</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] text-on-surface-variant/40 uppercase tracking-tighter">Pleaser</span>
                      <input type="range" min="0" max="1" step="0.01" {...form.register('interactionPolarity', { valueAsNumber: true })} className="flex-1 accent-secondary h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer" />
                      <span className="text-[8px] text-on-surface-variant/40 uppercase tracking-tighter">Seeker</span>
                    </div>
                    <p className="text-[8px] text-on-surface-variant/40 italic">Determines the character's baseline social aggression during dialogue simulation.</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Crack Strategy (Destabilization)</label>
                    <Textarea {...form.register('crackStrategy')} placeholder="How does the character react when their Performance fails? Violent outburst? Cold retreat? Nervous stutter?" className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[100px]" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="pb-2 border-b border-outline-variant/10 flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-on-surface">Negative Space & Coexistence</h3>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">The "NOT" Filter (Sovereign Safeguard)</label>
                    <Textarea {...form.register('negativeSpace')} placeholder="Anya is NOT cold... she is neutral. She is NOT predatory... she is transactional." className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[100px]" />
                    <p className="text-[8px] text-on-surface-variant/40 mt-1 italic">Define what the character is NOT to prevent automatic genre-drift or generic tropes.</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Unresolved Forces (The "Ghost" State)</label>
                    <Textarea {...form.register('unresolvedCoexistence')} placeholder="The warmth is genuine but the performer is split. Warmth and Indifference coexist without resolution." className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[100px]" />
                    <p className="text-[8px] text-on-surface-variant/40 mt-1 italic">Describe cohabiting forces that do not resolve into a single state.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-6">
                  <div className="pb-2 border-b border-outline-variant/10 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-on-surface">Cognitive Defaults</h3>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1 flex items-center justify-between">
                      Speech Patterns {(parentId || initialData?.parentId) && <span className="text-primary/60 italic">(Leave blank to inherit)</span>}
                      <button type="button" onClick={() => handlePromoteToTension('cognitiveSpeech', 'cognition')} className="text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 font-black"><PlusCircle className="w-3 h-3" /> PROMOTE</button>
                    </label>
                    <Textarea {...form.register('cognitiveSpeech')} placeholder={parentProfile?.cognitiveSpeech || "Cognitive Speech Patterns..."} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[100px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1 flex items-center justify-between">
                      Signature Traits
                      <button type="button" onClick={() => handlePromoteToTension('signatureTraits', 'social')} className="text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 font-black"><PlusCircle className="w-3 h-3" /> PROMOTE</button>
                    </label>
                    <Textarea {...form.register('signatureTraits')} placeholder={parentProfile?.signatureTraits?.join(', ') || "Signature Traits (comma separated)..."} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[100px]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-6">
                  <div className="pb-2 border-b border-outline-variant/10 flex items-center gap-2">
                    <Quote className="w-4 h-4 text-on-surface-variant" />
                    <h3 className="text-sm font-bold text-on-surface">Linguistic Flavor</h3>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Idioms & Slang</label>
                    <Textarea {...form.register('idioms')} placeholder={parentProfile?.idioms?.join(', ') || "Idioms & Slang..."} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[100px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Negative DNA (Anti-Mannerisms)</label>
                    <Textarea {...form.register('antiMannerisms')} placeholder={parentProfile?.antiMannerisms?.join(', ') || "What this character NEVER does..."} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[80px]" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="pb-2 border-b border-outline-variant/10 flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-bold text-on-surface">Secondary Socials</h3>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Conflict Style</label>
                    <Textarea {...form.register('conflictStyle')} placeholder={parentProfile?.conflictStyle || "Conflict Style..."} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[100px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Conversational Role</label>
                    <Textarea {...form.register('conversationalRole')} placeholder={parentProfile?.conversationalRole || "Conversational Role..."} className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[100px]" />
                  </div>
                </div>
              </div>

              {/* Dynamic Lists */}
              <div className="space-y-8">
                <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Gold Standard Snapshots</h4>
                  </div>
                  <button type="button" onClick={() => appendGold({ id: Date.now().toString(), label: '', snippet: '', createdAt: new Date().toISOString() })} className="text-xs text-primary font-bold">Add Snapshot</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {goldFields.map((field, idx) => (
                    <div key={field.id} className="p-5 bg-primary/5 border border-primary/10 rounded-xl space-y-4 relative group/gold">
                      <button type="button" onClick={() => removeGold(idx)} className="absolute top-4 right-4 text-on-surface-variant/20 hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                      <div className="space-y-3">
                        <Input {...form.register(`goldStandardSnippets.${idx}.label`)} placeholder="Vibe Label (e.g., Clinical Observation)" className="bg-surface-container-low rounded-xl h-10 text-xs font-bold" />
                        <Textarea {...form.register(`goldStandardSnippets.${idx}.snippet`)} placeholder="Paste your highest fidelity, author-verified prose here..." className="bg-surface-container-low rounded-xl min-h-[120px] text-xs leading-relaxed" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Physical Tells</h4>
                    <button type="button" onClick={() => appendTell({ value: '' })} className="text-xs text-primary font-bold">Add Tell</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tellFields.map((field, idx) => (
                      <div key={field.id} className="flex gap-2">
                        <Input {...form.register(`physicalTells.${idx}.value`)} placeholder="e.g., Taps fingers" className="bg-surface-container-highest/30 border-outline-variant/20 rounded-xl flex-1" />
                        <button type="button" onClick={() => removeTell(idx)} className="text-error/40 hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Example Dialogue</h4>
                    <button type="button" onClick={() => appendLine({ value: '' })} className="text-xs text-primary font-bold">Add Line</button>
                  </div>
                  <div className="space-y-3">
                    {lineFields.map((field, idx) => (
                      <div key={field.id} className="flex gap-2">
                        <Input {...form.register(`exampleLines.${idx}.value`)} placeholder='"I don&apos;t think so..."' className="bg-surface-container-highest/30 border-outline-variant/20 rounded-xl flex-1" />
                        <button type="button" onClick={() => removeLine(idx)} className="text-error/40 hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Relationships</h4>
                    <button type="button" onClick={() => appendRel({ targetId: '', type: '', tension: 3, context: '' })} className="text-xs text-primary font-bold">Add Relation</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relFields.map((field, idx) => (
                      <div key={field.id} className="p-4 bg-surface-container-highest/20 border border-outline-variant/10 rounded-xl space-y-3 relative group/rel">
                        <button type="button" onClick={() => removeRel(idx)} className="absolute top-3 right-3 text-on-surface-variant/20 hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                        <div className="grid grid-cols-2 gap-3">
                          <select {...form.register(`relationships.${idx}.targetId`)} className="bg-surface-container-low rounded-xl p-2 text-xs">
                            <option value="">Target...</option>
                            {voiceProfiles.filter(p => p.id !== initialData?.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <Input {...form.register(`relationships.${idx}.type`)} placeholder="Type" className="bg-surface-container-low rounded-xl h-8 text-xs" />
                        </div>
                        <input type="range" min="1" max="5" {...form.register(`relationships.${idx}.tension`, { valueAsNumber: true })} className="w-full accent-primary h-1" />
                        <Input {...form.register(`relationships.${idx}.context`)} placeholder="Context..." className="bg-surface-container-low rounded-xl h-8 text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-outline-variant/10 mt-8 relative">
          <AnimatePresence>
            {isSaved && (
              <motion.div 
                initial={{ opacity: 0, y: 10, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 10, x: '-50%' }}
                className="absolute -top-4 left-1/2 px-4 py-2 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 z-50 whitespace-nowrap"
              >
                <CheckIcon size={14} /> Saved to Timeline
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between w-full">
            {activeTab === 'edit' ? (
              <>
                <Button type="button" variant="ghost" onClick={step === 1 ? onClose : () => setStep(step - 1)}>
                  {step === 1 ? 'Discard' : <><ChevronLeft className="w-4 h-4 mr-2" /> Back</>}
                </Button>
                <div className="flex gap-2">
                  {step < 4 ? (
                    <Button type="button" onClick={(e) => { e.preventDefault(); setStep(step + 1); }} className="bg-primary text-on-primary rounded-full px-8">
                      Continue <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isSaving} 
                      className={`rounded-full px-8 transition-all ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary text-on-primary'}`}
                    >
                      {isSaved ? (
                        <><CheckIcon className="w-4 h-4 mr-2" /> Committed</>
                      ) : isSaving ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <><Save className="w-4 h-4 mr-2" /> Commit DNA</>
                      )}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" onClick={() => setActiveTab('edit')}>
                  Return to Edit
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving} 
                  className={`rounded-full px-8 transition-all ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary text-on-primary'}`}
                >
                  {isSaved ? (
                    <><CheckIcon className="w-4 h-4 mr-2" /> Saved</>
                  ) : isSaving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Metadata</>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
    </FormProvider>
  );

  return isModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">{formContent}</div>
  ) : formContent;
}
