/* eslint-disable react-hooks/incompatible-library */
import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, PenTool, Layout, Zap, Type, Anchor, Quote, Fingerprint, Cpu, Loader2, ChevronRight, ChevronLeft, Check as CheckIcon } from 'lucide-react';
import { AuthorVoice } from '../../types';
import { authorVoiceSchema, AuthorVoiceFormValues } from '../../schemas';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { VoiceDNA } from '../ui/VoiceDNA';
import { useLoreStore } from '../../stores/useLoreStore';
import { motion, AnimatePresence } from 'motion/react';
import { StoryDateInput } from './StoryDateInput';

interface AuthorVoiceFormProps {
  onClose: () => void;
  onSave: (voice: AuthorVoice) => void;
  initialData?: AuthorVoice;
  isModal?: boolean;
}

export function AuthorVoiceForm({ onClose, onSave, initialData, isModal = true }: AuthorVoiceFormProps) {
  const [step, setStep] = useState(1);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<AuthorVoiceFormValues>({
    resolver: zodResolver(authorVoiceSchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      category: initialData?.category || 'Narrator',
      modality: initialData?.modality || 'narrator',
      narrativeStyle: initialData?.narrativeStyle || '',
      proseStructure: initialData?.proseStructure || '',
      pacingRhythm: initialData?.pacingRhythm || '',
      vocabularyDiction: initialData?.vocabularyDiction || '',
      thematicAnchors: initialData?.thematicAnchors || '',
      sideVoicePreviewSnippet: initialData?.sideVoicePreviewSnippet || '',
      dna: initialData?.dna || {
        analytical: 50,
        lyrical: 50,
        visceral: 50,
        abstract: 50,
      },
      storyDay: initialData?.storyDay || 1,
      storyDate: initialData?.storyDate || { year: 2026, month: 0, day: 1 },
      isForeshadowing: initialData?.isForeshadowing || false,
      isTimelineEnabled: initialData?.isTimelineEnabled ?? true,
      stylisticConstraints: initialData?.stylisticConstraints?.join(', ') || '',
    }
  });

  const [isActive, setIsActive] = React.useState(initialData?.isActive || false);
  const [voicePreview, setVoicePreview] = React.useState(initialData?.voicePreview || '');
  const [sideVoicePreviewSnippet, setSideVoicePreviewSnippet] = React.useState(initialData?.sideVoicePreviewSnippet || '');
  const [stylisticConstraints, setStylisticConstraints] = React.useState(initialData?.stylisticConstraints?.join(', ') || '');

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        name: initialData.name || '',
        category: initialData.category || 'Narrator',
        modality: initialData.modality || 'narrator',
        narrativeStyle: initialData.narrativeStyle || '',
        proseStructure: initialData.proseStructure || '',
        pacingRhythm: initialData.pacingRhythm || '',
        vocabularyDiction: initialData.vocabularyDiction || '',
        thematicAnchors: initialData.thematicAnchors || '',
        sideVoicePreviewSnippet: initialData.sideVoicePreviewSnippet || '',
        dna: initialData.dna || {
          analytical: 50,
          lyrical: 50,
          visceral: 50,
          abstract: 50,
        },
        storyDay: initialData.storyDay || 1,
        storyDate: initialData.storyDate || { year: 2026, month: 0, day: 1 },
        isForeshadowing: initialData.isForeshadowing || false,
      });
      setIsActive(initialData.isActive || false);
      setVoicePreview(initialData.voicePreview || '');
      setSideVoicePreviewSnippet(initialData.sideVoicePreviewSnippet || '');
      setStylisticConstraints(initialData.stylisticConstraints?.join(', ') || '');
    } else {
      form.reset({
        id: undefined,
        name: '',
        category: 'Narrator',
        modality: 'narrator',
        narrativeStyle: '',
        proseStructure: '',
        pacingRhythm: '',
        vocabularyDiction: '',
        thematicAnchors: '',
        sideVoicePreviewSnippet: '',
        dna: { analytical: 50, lyrical: 50, visceral: 50, abstract: 50 },
        storyDay: 1,
        storyDate: { year: 2026, month: 0, day: 1 },
        isForeshadowing: false,
      });
      setIsActive(false);
      setVoicePreview('');
      setSideVoicePreviewSnippet('');
      setStylisticConstraints('');
    }
  }, [initialData, form]);

  const dna = form.watch('dna') || { analytical: 50, lyrical: 50, visceral: 50, abstract: 50 };
  const isSaving = form.formState.isSubmitting;

  const onSubmit = async (data: AuthorVoiceFormValues) => {
    try {
      const voice: AuthorVoice = {
        id: initialData?.id || Date.now().toString(),
        name: data.name,
        category: data.category || 'Narrator',
        modality: data.modality || 'narrator',
        narrativeStyle: data.narrativeStyle || '',
        proseStructure: data.proseStructure || '',
        pacingRhythm: data.pacingRhythm || '',
        vocabularyDiction: data.vocabularyDiction || '',
        thematicAnchors: data.thematicAnchors || '',
        dna: data.dna,
        storyDay: data.storyDay,
        storyDate: data.storyDate,
        isForeshadowing: data.isForeshadowing,
        stylisticConstraints: stylisticConstraints ? stylisticConstraints.split(',').map(s => s.trim()).filter(Boolean) : [],
        voicePreview,
        sideVoicePreviewSnippet,
        isActive,
        isTimelineEnabled: data.isTimelineEnabled,
        lastModified: new Date().toISOString(),
      };
      onSave(voice);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save author voice:", error);
    }
  };

  const content = (
    <FormProvider {...form}>
    <div className={`w-full bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col ${isModal ? 'max-w-4xl max-h-[90vh]' : 'h-full'} p-5`}>
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
            <PenTool className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
              {initialData?.name || 'New Voice'}
            </h2>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container-highest transition-all">
          <X className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full space-y-8 overflow-y-auto custom-scrollbar pr-2"
              >
              <input 
                {...form.register('name')}
                placeholder="Untitled Voice"
                className="w-full bg-transparent border-none text-4xl font-headline font-light text-on-surface placeholder:text-on-surface-variant/20 outline-none p-0"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Modality</label>
                  <select 
                    {...form.register('modality')}
                    onChange={(e) => {
                      const val = e.target.value;
                      form.setValue('modality', val as any);
                      const categoryMap: Record<string, string> = {
                        narrator: 'Narrator',
                        lens: 'The Lens',
                        rhythm: 'The Rhythm',
                        temporal: 'The Temporal Filter',
                        lexicon: 'The Lexicon',
                        atmosphere: 'The Atmosphere'
                      };
                      form.setValue('category', categoryMap[val] || 'Custom');
                    }}
                    className="w-full bg-surface-container-highest/30 border border-outline-variant/20 rounded-lg p-3 text-sm"
                  >
                    <option value="narrator">Narrator</option>
                    <option value="lens">The Lens</option>
                    <option value="rhythm">The Rhythm</option>
                    <option value="temporal">The Temporal Filter</option>
                    <option value="lexicon">The Lexicon</option>
                    <option value="atmosphere">The Atmosphere</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Category Label</label>
                  <Input {...form.register('category')} placeholder="e.g., The Lens" className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-3" />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-outline-variant text-secondary focus:ring-secondary/20"
                />
                <label htmlFor="isActive" className="flex flex-col cursor-pointer">
                  <span className="text-sm font-headline font-bold text-on-surface">Active Master Voice</span>
                  <span className="text-[9px] text-on-surface-variant/60 uppercase tracking-widest mt-1">Set as the primary narrative filter</span>
                </label>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full space-y-8 overflow-y-auto custom-scrollbar pr-2"
            >
              <div className="flex flex-col items-center justify-center py-4">
                <VoiceDNA data={dna} color="var(--color-secondary)" size={220} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(dna).map((key) => (
                  <div key={key} className="space-y-3 p-4 bg-surface-container-highest/20 rounded-xl border border-outline-variant/10">
                    <div className="flex justify-between text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60">
                      <span className="font-bold">{key}</span>
                      <span className="font-mono">{dna[key as keyof typeof dna]}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      {...form.register(`dna.${key as keyof typeof dna}`, { valueAsNumber: true })} 
                      className="w-full accent-secondary h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer" 
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full space-y-8 overflow-y-auto custom-scrollbar pr-2"
            >
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-6">
                  <div className="pb-2 border-b border-outline-variant/10 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-on-surface">Narrative Filter</h3>
                  </div>
                  <Textarea {...form.register('narrativeStyle')} placeholder="Narrative Style: tone, perspective, distance..." className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[100px]" />
                  <div className="space-y-2">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Voice Preview</label>
                    <Textarea value={voicePreview} onChange={(e) => setVoicePreview(e.target.value)} placeholder="Main voice snippet..." className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[80px] italic" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Side Voice Preview</label>
                    <Textarea value={sideVoicePreviewSnippet} onChange={(e) => setSideVoicePreviewSnippet(e.target.value)} placeholder="Secondary voice snippet..." className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[80px] italic" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="pb-2 border-b border-outline-variant/10 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-bold text-on-surface">Prose Architecture</h3>
                  </div>
                  <Textarea {...form.register('proseStructure')} placeholder="Prose Structure: paragraphs, dialogue..." className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[80px]" />
                  <Textarea {...form.register('pacingRhythm')} placeholder="Pacing & Rhythm..." className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[80px]" />
                  <Textarea {...form.register('vocabularyDiction')} placeholder="Vocabulary & Diction..." className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[80px]" />
                  <Textarea {...form.register('thematicAnchors')} placeholder="Thematic Anchors..." className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-4 min-h-[80px]" />
                  <div className="space-y-1">
                    <label className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 ml-1">Stylistic Constraints</label>
                    <Input 
                      value={stylisticConstraints}
                      onChange={(e) => setStylisticConstraints(e.target.value)}
                      placeholder="e.g., No adverbs, short sentences..." 
                      className="bg-surface-container-highest/30 border-outline-variant/20 rounded-lg p-3" 
                    />
                  </div>
                  <div className="p-4 bg-surface-container-highest/30 border border-outline-variant/20 rounded-lg space-y-4">
                    <StoryDateInput />
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60">
                        <input type="checkbox" {...form.register('isTimelineEnabled')} className="rounded border-outline-variant/30" />
                        Enable Timeline
                      </label>
                      <Input type="number" {...form.register('storyDay', { valueAsNumber: true })} placeholder="Day" className="w-20 bg-surface-container-low" />
                      <label className="flex items-center gap-2 text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60">
                        <input type="checkbox" {...form.register('isForeshadowing')} className="rounded border-outline-variant/30" />
                        Foreshadowing
                      </label>
                    </div>
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
                <CheckIcon size={14} /> Committed
              </motion.div>
            )}
          </AnimatePresence>
          <Button type="button" variant="ghost" onClick={step === 1 ? onClose : () => setStep(step - 1)}>
            {step === 1 ? 'Discard' : <><ChevronLeft className="w-4 h-4 mr-2" /> Back</>}
          </Button>
          <div className="flex gap-2">
            {step < 3 ? (
              <Button type="button" onClick={(e) => { e.preventDefault(); setStep(step + 1); }} className="bg-secondary text-secondary-foreground rounded-full px-8">
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSaving} 
                className={`rounded-full px-8 transition-all ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-secondary text-secondary-foreground'}`}
              >
                {isSaved ? (
                  <><CheckIcon className="w-4 h-4 mr-2" /> Committed</>
                ) : isSaving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Commit Prose</>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
    </FormProvider>
  );

  return isModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">{content}</div>
  ) : content;
}
