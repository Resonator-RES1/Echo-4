/* eslint-disable react-hooks/incompatible-library */
import React from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, Fingerprint, Quote, Loader2, Plus, Trash2 } from 'lucide-react';
import { VoiceDNA } from '../../types';
import { voiceDNASchema, VoiceDNAFormValues } from '../../schemas';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { VoiceDNA as DNAViz } from '../ui/VoiceDNA';
import { StoryDateInput } from './StoryDateInput';

interface VoiceDNAFormProps {
  onClose: () => void;
  onSave: (dna: VoiceDNA) => void;
  initialData?: VoiceDNA;
  isModal?: boolean;
}

export function VoiceDNAForm({ onClose, onSave, initialData, isModal = true }: VoiceDNAFormProps) {
  const form = useForm<VoiceDNAFormValues>({
    resolver: zodResolver(voiceDNASchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      proseDNA: initialData?.proseDNA || {
        analytical: 50,
        lyrical: 50,
        visceral: 50,
        abstract: 50,
      },
      narrativeStyle: initialData?.narrativeStyle || '',
      proseStructure: initialData?.proseStructure || '',
      pacingRhythm: initialData?.pacingRhythm || '',
      vocabularyDiction: initialData?.vocabularyDiction || '',
      thematicAnchors: initialData?.thematicAnchors || '',
      exampleSnippets: initialData?.exampleSnippets?.map(s => ({ value: s })) || [{ value: '' }],
      storyDay: initialData?.storyDay || 1,
      storyDate: initialData?.storyDate || { year: 2026, month: 0, day: 1 },
      isForeshadowing: initialData?.isForeshadowing || false,
      isTimelineEnabled: initialData?.isTimelineEnabled ?? true,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exampleSnippets"
  });

  const dna = form.watch('proseDNA');
  const isSaving = form.formState.isSubmitting;
  const isTimelineEnabled = form.watch('isTimelineEnabled');

  const onSubmit = async (data: VoiceDNAFormValues) => {
    try {
      const voiceDNA: VoiceDNA = {
        id: initialData?.id || Date.now().toString(),
        name: data.name,
        proseDNA: data.proseDNA,
        narrativeStyle: data.narrativeStyle,
        proseStructure: data.proseStructure,
        pacingRhythm: data.pacingRhythm,
        vocabularyDiction: data.vocabularyDiction,
        thematicAnchors: data.thematicAnchors,
        exampleSnippets: data.exampleSnippets?.map(s => s.value).filter(Boolean) || [],
        storyDay: data.storyDay,
        storyDate: data.storyDate,
        isForeshadowing: data.isForeshadowing,
        isTimelineEnabled: data.isTimelineEnabled,
        lastModified: new Date().toISOString(),
      };
      onSave(voiceDNA);
    } catch (error) {
      console.error("Failed to save voice DNA:", error);
    }
  };

  const content = (
    <FormProvider {...form}>
    <div className={`w-full bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col ${isModal ? 'max-w-4xl max-h-[90vh] animate-in fade-in zoom-in duration-300' : 'h-full'}`}>
      <div className="flex items-center justify-between p-4 border-b border-outline-variant/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              {initialData ? 'Edit Voice DNA' : 'New Voice DNA'}
            </h2>
            <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
              Stylistic Fingerprint Builder
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-surface-container-highest transition-colors"
        >
          <X className="w-5 h-5 text-on-surface-variant" />
        </button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                  DNA Name / Label
                </label>
                <Input 
                  {...form.register('name')}
                  placeholder="e.g., The Hardboiled Detective, Ethereal Dreamer"
                  className="w-full bg-surface-container-highest/50 border-outline-variant/30 rounded-lg p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface"
                />
                {form.formState.errors.name && <p className="text-error text-xs">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                 <input 
                   type="checkbox"
                   id="isTimelineEnabled"
                   {...form.register('isTimelineEnabled')}
                   className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                 />
                 <label htmlFor="isTimelineEnabled" className="flex flex-col cursor-pointer">
                   <span className="text-xs font-headline font-bold text-on-surface leading-none">Enable Timeline</span>
                   <span className="text-[8px] font-label text-on-surface-variant uppercase tracking-wider">Show date & day offset</span>
                 </label>
               </div>
                
               {isTimelineEnabled && (
                 <>
                   <StoryDateInput />
                   <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                       <span className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/40">Day Offset</span>
                       <Input 
                         type="number"
                         {...form.register('storyDay', { valueAsNumber: true })}
                         className="bg-surface-container-highest/50 border-outline-variant/30 rounded-xl w-20 h-8 text-xs"
                       />
                     </div>
                     <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                       <input 
                         type="checkbox"
                         id="isForeshadowing"
                         {...form.register('isForeshadowing')}
                         className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                       />
                       <label htmlFor="isForeshadowing" className="flex flex-col cursor-pointer">
                         <span className="text-xs font-headline font-bold text-on-surface leading-none">Foreshadowing</span>
                         <span className="text-[8px] font-label text-on-surface-variant uppercase tracking-wider">Inform subtext only</span>
                       </label>
                     </div>
                   </div>
                 </>
               )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                  Narrative Style
                </label>
                <Textarea 
                  {...form.register('narrativeStyle')}
                  placeholder="Describe the overall tone, perspective, and narrative distance..."
                  rows={3}
                  className="w-full bg-surface-container-highest/50 border-outline-variant/30 rounded-lg p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none"
                />
              </div>
            </div>

            {/* DNA Visualization */}
            <div className="bg-surface-container-highest/30 rounded-xl p-4 flex flex-col items-center justify-center border border-outline-variant/10">
              <h3 className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/60 mb-4">Prose DNA Profile</h3>
              <DNAViz data={dna} color="var(--color-secondary)" size={180} />
              
              <div className="mt-6 w-full space-y-3">
                {Object.keys(dna).map((key) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[8px] font-label uppercase tracking-widest text-on-surface-variant/40">
                      <span>{key}</span>
                      <span>{dna[key as keyof typeof dna]}%</span>
                    </div>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      {...form.register(`proseDNA.${key as keyof typeof dna}`, { valueAsNumber: true })}
                      className="w-full accent-secondary h-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Prose Structure
              </label>
              <Textarea 
                {...form.register('proseStructure')}
                placeholder="Paragraph length, dialogue integration, description density..."
                rows={3}
                className="w-full bg-surface-container-highest/50 border-outline-variant/30 rounded-lg p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Pacing & Rhythm
              </label>
              <Textarea 
                {...form.register('pacingRhythm')}
                placeholder="Sentence variety, flow, tension building through prose..."
                rows={3}
                className="w-full bg-surface-container-highest/50 border-outline-variant/30 rounded-lg p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Vocabulary & Diction
              </label>
              <Textarea 
                {...form.register('vocabularyDiction')}
                placeholder="Word choice, complexity, specific jargon or linguistic flavor..."
                rows={3}
                className="w-full bg-surface-container-highest/50 border-outline-variant/30 rounded-lg p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Thematic Anchors
              </label>
              <Textarea 
                {...form.register('thematicAnchors')}
                placeholder="Recurring motifs, emotional undertones, core themes..."
                rows={3}
                className="w-full bg-surface-container-highest/50 border-outline-variant/30 rounded-lg p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                <Quote className="w-3.5 h-3.5" />
                Example Snippets
              </label>
              <button 
                type="button"
                onClick={() => append({ value: '' })}
                className="text-[9px] font-label uppercase tracking-widest text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Snippet
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3">
                  <Textarea 
                    {...form.register(`exampleSnippets.${index}.value`)}
                    placeholder="Paste a representative snippet of this voice..."
                    rows={2}
                    className="flex-1 bg-surface-container-highest/50 border-outline-variant/30 rounded-lg p-4 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-on-surface resize-none italic"
                  />
                  <button 
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 h-fit rounded-xl hover:bg-error/10 text-on-surface-variant/40 hover:text-error transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 shrink-0">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full font-label text-sm uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-highest transition-all"
            >
              Cancel
            </button>
            <Button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-6 bg-secondary text-secondary-foreground rounded-full font-label text-sm uppercase tracking-wider font-bold shadow-lg hover:shadow-xl hover:bg-secondary/90 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : 'Save Voice DNA'}</span>
            </Button>
          </div>
        </form>
    </div>
    </FormProvider>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
