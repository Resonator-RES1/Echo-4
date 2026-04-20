/* eslint-disable react-hooks/incompatible-library */
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Fingerprint, Cpu, Users, Plus, Trash2, Loader2, Tag, ChevronRight, ChevronLeft, ChevronDown, Check as CheckIcon } from 'lucide-react';
import { LoreEntry, Relationship } from '../../types';
import { loreEntrySchema, LoreEntryFormValues } from '../../schemas';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useLoreStore } from '../../stores/useLoreStore';
import { StoryDateInput } from './StoryDateInput';
import { DOMAIN_FIELD_CONFIG } from '../../constants/domainConfig';

interface LoreEntryFormProps {
  onClose: () => void;
  onSave: (entry: LoreEntry) => void;
  initialData?: LoreEntry;
  isModal?: boolean;
  loreEntries?: LoreEntry[];
  parentId?: string;
  onCreateEvolution?: (parentId: string) => void;
  onEditEvolution?: (entry: LoreEntry) => void;
}

export function LoreEntryForm({ onClose, onSave, initialData, isModal = true, loreEntries = [], parentId, onCreateEvolution, onEditEvolution }: LoreEntryFormProps) {
  const { loreCategories } = useLoreStore();
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'edit' | 'history'>('edit');
  const [isSaved, setIsSaved] = useState(false);

  const parentEntry = parentId ? loreEntries.find(e => e.id === parentId) : null;
  const evolutions = loreEntries.filter(e => e.parentId === (initialData?.parentId || initialData?.id || parentId));

  const form = useForm<LoreEntryFormValues>({
    resolver: zodResolver(loreEntrySchema),
    defaultValues: {
      id: initialData?.id,
      parentId: initialData?.parentId || parentId,
      title: initialData?.title || parentEntry?.title || '',
      categoryId: initialData?.categoryId || parentEntry?.categoryId || loreCategories[0]?.id || '',
      tags: initialData?.tags?.join(', ') || '',
      description: initialData?.description || '',
      aliases: initialData?.aliases?.join(', ') || '',
      gender: initialData?.gender || (parentId ? '' : 'unspecified'),
      sensoryPalette: initialData?.sensoryPalette || '',
      relations: initialData?.relations || '',
      storyDay: initialData?.storyDay || 0,
      storyDate: initialData?.storyDate || { year: 2026, month: 0, day: 1 },
      isForeshadowing: initialData?.isForeshadowing || false,
      isTimelineEnabled: initialData?.isTimelineEnabled ?? (initialData ? false : true), // Default to true for new, false for existing that didn't have it
      isPinned: initialData?.isPinned || false,
      axiomLevel: initialData?.axiomLevel || 'malleable',
      isEvolution: !!(initialData?.parentId || parentId || initialData?.isEvolution),
      narrativeWeight: initialData?.narrativeWeight || 'background',
      foundationalTruths: initialData?.foundationalTruths?.join('\n') || '',
      secretSubtext: initialData?.secretSubtext || '',
      domainData: initialData?.domainData || {},
      relationships: initialData?.relationships || [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "relationships"
  });

  const categoryId = form.watch('categoryId');
  const selectedCategory = loreCategories.find(c => c.id === categoryId);
  const isSaving = form.formState.isSubmitting;
  
  const domainFields = DOMAIN_FIELD_CONFIG[categoryId] || DOMAIN_FIELD_CONFIG['cat-other'] || [];

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        parentId: initialData.parentId,
        title: initialData.title || '',
        categoryId: initialData.categoryId || loreCategories[0]?.id || '',
        tags: initialData.tags?.join(', ') || '',
        description: initialData.description || '',
        foundationalTruths: initialData.foundationalTruths?.join('\n') || '',
        secretSubtext: initialData.secretSubtext || '',
        domainData: initialData.domainData || {},
        narrativeWeight: initialData.narrativeWeight || 'background',
        aliases: initialData.aliases?.join(', ') || '',
        gender: initialData.gender || (initialData.parentId ? '' : 'unspecified'),
        sensoryPalette: initialData.sensoryPalette || '',
        relations: initialData.relations || '',
        storyDay: initialData.storyDay || 0,
        storyDate: initialData.storyDate || { year: 2026, month: 0, day: 1 },
        isForeshadowing: initialData.isForeshadowing || false,
        isTimelineEnabled: initialData.isTimelineEnabled ?? false,
        isPinned: initialData.isPinned || false,
        isEvolution: !!(initialData.parentId || initialData.isEvolution),
        axiomLevel: initialData.axiomLevel || 'malleable',
        relationships: initialData.relationships || [],
      });
    } else {
      form.reset({
        id: undefined,
        parentId: parentId,
        title: parentEntry?.title || '',
        categoryId: parentEntry?.categoryId || loreCategories[0]?.id || '',
        tags: '',
        description: '',
        foundationalTruths: '',
        secretSubtext: '',
        domainData: {},
        aliases: '',
        gender: parentId ? '' : 'unspecified',
        sensoryPalette: '',
        relations: '',
        storyDay: 0,
        storyDate: { year: 2026, month: 0, day: 1 },
        isForeshadowing: false,
        isTimelineEnabled: true,
        isPinned: false,
        isEvolution: !!parentId,
        axiomLevel: 'malleable',
        narrativeWeight: 'background',
        relationships: [],
      });
    }
  }, [initialData, form, loreCategories, parentId, parentEntry?.title, parentEntry?.categoryId]);

  const onSubmit = async (data: LoreEntryFormValues) => {
    try {
      const aliasList = data.aliases ? data.aliases.split(',').map(a => a.trim()).filter(a => a !== '') : [];
      const tagList = data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t !== '') : [];
      
      const entry: LoreEntry = {
        id: initialData?.id || Date.now().toString(),
        parentId: data.parentId,
        title: data.title,
        categoryId: data.categoryId,
        tags: tagList,
        description: data.description || '',
        foundationalTruths: data.foundationalTruths ? data.foundationalTruths.split('\n').map(t => t.trim()).filter(t => t !== '') : [],
        secretSubtext: data.secretSubtext || '',
        domainData: data.domainData || {},
        narrativeWeight: data.narrativeWeight,
        aliases: aliasList,
        gender: data.gender || undefined,
        sensoryPalette: data.sensoryPalette,
        relations: data.relations || undefined,
        relationships: data.relationships?.filter(r => r.targetId) as Relationship[] || [],
        storyDay: data.storyDay,
        storyDate: data.storyDate,
        isForeshadowing: data.isForeshadowing,
        isTimelineEnabled: data.isTimelineEnabled,
        isPinned: data.isPinned,
        isEvolution: !!data.parentId || data.isEvolution,
        axiomLevel: data.axiomLevel,
        linkedEntityIds: initialData?.linkedEntityIds || [],
        lastModified: new Date().toISOString()
      };
      
      onSave(entry);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save lore entry:", error);
    }
  };

  const formContent = (
    <FormProvider {...form}>
      <div className={`w-full bg-surface-container-low overflow-hidden flex flex-col ${isModal ? 'max-w-3xl max-h-[90vh] rounded-xl border border-outline-variant/10 shadow-2xl p-5' : 'h-full p-6 lg:p-10'}`}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`flex-1 flex flex-col overflow-hidden w-full ${isModal ? 'max-w-3xl mx-auto' : ''}`}>
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-headline font-bold text-on-surface">
              {(parentId || initialData?.parentId) ? `Evolution: ${parentEntry?.title}` : (initialData?.title || 'New Entry')}
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
              <Plus className="w-5 h-5 text-on-surface-variant rotate-45" />
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
                          const base = loreEntries.find(e => e.id === targetId);
                          if (base) onEditEvolution(base);
                        }
                        setActiveTab('edit');
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-on-surface">Base Entry</h4>
                          <p className="text-xs text-on-surface-variant/60 mt-1">The original axioms of this lore entry.</p>
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
                              {evo.description ? 'Description Updated' : 'Temporal Shift'}
                            </p>
                          </div>
                          {initialData?.id === evo.id && <div className="text-[9px] font-black text-secondary uppercase tracking-widest">Active</div>}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Identity Manifestation</label>
                  <Input 
                    {...form.register('title')}
                    placeholder={parentEntry?.title || "Noble Designation..."}
                    className="w-full bg-transparent border-none text-4xl font-headline font-bold p-0 outline-none placeholder:text-on-surface-variant/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1">Lore Domain</label>
                    <div className="relative group">
                      <select 
                        {...form.register('categoryId')}
                        className="w-full bg-surface-container-highest/30 border border-white/5 hover:border-white/10 rounded-xl p-4 text-sm appearance-none transition-all outline-none"
                      >
                        {loreCategories.map(cat => <option key={cat.id} value={cat.id} className="bg-surface-container-high">{cat.name}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1">Narrative Significance</label>
                    <div className="relative group">
                      <select 
                        {...form.register('narrativeWeight')}
                        className="w-full bg-surface-container-highest/30 border border-white/5 hover:border-white/10 rounded-xl p-4 text-sm appearance-none transition-all outline-none"
                      >
                        <option value="background" className="bg-surface-container-high">Background (Ambient context)</option>
                        <option value="active" className="bg-surface-container-high">Active (Frequent narrative anchor)</option>
                        <option value="pivotal" className="bg-surface-container-high">Pivotal (Foundational to the plot)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">Foundational Truths (Axioms)</label>
                    <span className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">ONE PER LINE • UNBREAKABLE RULES</span>
                  </div>
                  <Textarea 
                    {...form.register('foundationalTruths')}
                    placeholder="E.g.\nThe Great Spire never falls.\nThe King always speaks in riddles."
                    className="w-full bg-surface-container-highest/20 border-white/5 focus:border-primary/20 rounded-xl p-4 min-h-[120px] font-mono text-xs leading-relaxed transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1">The Overview</label>
                  <Textarea 
                    {...form.register('description')}
                    placeholder="Describe the essence of this entry..."
                    className="w-full bg-surface-container-highest/20 border-white/5 focus:border-primary/20 rounded-xl p-4 min-h-[160px] leading-relaxed transition-all"
                  />
                </div>

                {domainFields.length > 0 && (
                  <div className="pt-6 mt-6 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="w-8 h-[1px] bg-primary/30"></span>
                       <h3 className="text-[10px] font-black tracking-widest uppercase text-primary/60">Domain Specifications</h3>
                       <span className="flex-1 h-[1px] bg-white/5"></span>
                    </div>
                    {domainFields.map(field => (
                      <div key={field.id} className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <Textarea 
                            {...form.register(`domainData.${field.id}`)} 
                            placeholder={field.placeholder} 
                            className="w-full bg-surface-container-highest/20 border-white/5 focus:border-primary/20 rounded-xl p-4 min-h-[100px] leading-relaxed transition-all" 
                          />
                        ) : (
                          <Input 
                            {...form.register(`domainData.${field.id}`)} 
                            placeholder={field.placeholder} 
                            className="w-full bg-surface-container-highest/20 border-white/5 focus:border-primary/20 rounded-xl h-12 px-4 transition-all" 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
          ) : (
            <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full space-y-8 overflow-y-auto custom-scrollbar pr-2"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1">Semantic Clusters (Tags)</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/30" />
                      <Input {...form.register('tags')} placeholder="myth, legend, ancient" className="pl-10 bg-surface-container-highest/30 border-white/5 rounded-xl h-12" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1">Alternate Designations (Aliases)</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/30" />
                      <Input {...form.register('aliases')} placeholder="The Forgotten One, Old Ghost" className="pl-10 bg-surface-container-highest/30 border-white/5 rounded-xl h-12" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 ml-1">Sensory Palette</label>
                  <div className="relative">
                     <Fingerprint className="absolute left-4 top-4 w-3.5 h-3.5 text-on-surface-variant/30" />
                     <Textarea {...form.register('sensoryPalette')} placeholder="Textures, smells, recurring sounds associated with this lore..." className="pl-10 bg-surface-container-highest/20 border-white/5 rounded-xl min-h-[80px]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">The Unseen (Secret Subtext)</label>
                    <span className="text-[8px] font-bold text-secondary/40 uppercase tracking-widest">FOR SYSTEM EYES ONLY</span>
                  </div>
                  <Textarea 
                    {...form.register('secretSubtext')}
                    placeholder="Hidden truths, future reveals, or subtext intended for AI reasoning..."
                    className="w-full bg-surface-container-highest/10 border-white/5 focus:border-secondary/20 rounded-xl p-4 min-h-[100px] text-xs italic opacity-70"
                  />
                </div>
                
                <div className="p-6 bg-surface-container-highest/20 border border-white/5 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary/60" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-on-surface">Architectural Guardianship</h4>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/60 cursor-pointer hover:text-on-surface transition-colors">
                        <input type="checkbox" {...form.register('isPinned')} className="rounded border-white/10 bg-black/20" />
                        SEMANTIC PINNING
                      </label>
                      <select 
                        {...form.register('axiomLevel')}
                        className="bg-primary/10 border-none text-[8px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 text-primary"
                      >
                        <option value="malleable" className="bg-surface-container-high">Flavor Lore (Suggestible)</option>
                        <option value="absolute" className="bg-surface-container-high">Immutable Axiom (Strict)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <StoryDateInput />
                    <div className="flex items-center gap-6 pb-2">
                      <label className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/60 cursor-pointer hover:text-on-surface transition-colors">
                        <input type="checkbox" {...form.register('isTimelineEnabled')} className="rounded border-white/10 bg-black/20" />
                        CHRONOS SYNC
                      </label>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/60 cursor-pointer hover:text-on-surface transition-colors">
                        <input type="checkbox" {...form.register('isForeshadowing')} className="rounded border-white/10 bg-black/20" />
                        FORESHADOWING
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface">Living Threads (Relationships)</h4>
                    <Button variant="ghost" size="sm" type="button" onClick={() => append({ targetId: '', type: '', tension: 3, context: '' })} className="h-6 text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 text-primary">Manifest Link</Button>
                  </div>
                  <div className="space-y-3">
                    {fields.map((field, idx) => (
                      <div key={field.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 transition-all duration-300">
                        <select {...form.register(`relationships.${idx}.targetId`)} className="flex-1 bg-surface-container-highest/30 border border-white/5 rounded-xl px-4 py-2 text-xs outline-none focus:border-primary/30">
                          {loreEntries.filter(p => p.id !== initialData?.id).map(p => <option key={p.id} value={p.id} className="bg-surface-container-high">{p.title}</option>)}
                        </select>
                        <Input {...form.register(`relationships.${idx}.type`)} placeholder="Nature of Link" className="w-40 bg-surface-container-highest/30 border-white/5 rounded-xl" />
                        <button type="button" onClick={() => remove(idx)} className="p-2.5 rounded-xl hover:bg-error/10 text-on-surface-variant/40 hover:text-error transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
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

          <Button type="button" variant="ghost" onClick={step === 1 ? onClose : () => setStep(1)}>
            {step === 1 ? 'Discard' : <><ChevronLeft className="w-4 h-4 mr-2" /> Back</>}
          </Button>
          <Button 
            type={step === 1 ? 'button' : 'submit'} 
            onClick={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : undefined} 
            className={`rounded-full px-8 transition-all ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary text-on-primary'}`}
          >
            {step === 1 ? (
              <><ChevronRight className="w-4 h-4 ml-2" /> Continue</>
            ) : isSaved ? (
              <><CheckIcon className="w-4 h-4 mr-2" /> Committed</>
            ) : isSaving ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Commit'
            )}
          </Button>
        </div>
      </form>
    </div>
    </FormProvider>
  );

  return isModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">{formContent}</div>
  ) : formContent;
}
