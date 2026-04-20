import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, Sparkles, Type, Wind, MessageSquare, Plus, Trash2, Loader2 } from 'lucide-react';
import { MasterVoice } from '../../types';
import { masterVoiceSchema, MasterVoiceFormValues } from '../../schemas';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

interface MasterVoiceFormProps {
  onClose: () => void;
  onSave: (voice: MasterVoice) => void;
  initialData?: MasterVoice;
}

export function MasterVoiceForm({ onClose, onSave, initialData }: MasterVoiceFormProps) {
  const form = useForm<MasterVoiceFormValues>({
    resolver: zodResolver(masterVoiceSchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name || '',
      narrativeStyle: initialData?.narrativeStyle || 'Third Person Limited',
      tone: initialData?.tone || 'Atmospheric & Melancholic',
      vocabularyLevel: initialData?.vocabularyLevel || 'Sophisticated',
      pacingPreference: initialData?.pacingPreference || 'Balanced',
      description: initialData?.description || '',
      signaturePhrases: initialData?.signaturePhrases?.map(p => ({ value: p })) || [{ value: '' }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "signaturePhrases"
  });

  const [isActive, setIsActive] = React.useState(initialData?.isActive ?? true);
  const isSaving = form.formState.isSubmitting;

  const [newId] = React.useState(() => Date.now().toString());

  const onSubmit = async (data: MasterVoiceFormValues) => {
    try {
      const voice: MasterVoice = {
        id: initialData?.id || newId,
        name: data.name,
        narrativeStyle: data.narrativeStyle,
        tone: data.tone,
        vocabularyLevel: data.vocabularyLevel,
        pacingPreference: data.pacingPreference,
        description: data.description,
        signaturePhrases: data.signaturePhrases?.map(p => p.value).filter(p => p.trim()) || [],
        lastModified: new Date().toISOString(),
        isActive,
      };
      onSave(voice);
    } catch (error) {
      console.error("Failed to save master voice:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {initialData ? 'Edit Master Narrative Voice' : 'New Master Narrative Voice'}
              </h2>
              <p className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
                Global Narrative Style
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Voice Name
              </label>
              <Input 
                {...form.register('name')}
                placeholder="e.g., The Chronicler"
                className="w-full bg-surface-container-highest/50 border-outline-variant/30 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
              />
              {form.formState.errors.name && <p className="text-error text-xs">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                Narrative Style
              </label>
              <Input 
                {...form.register('narrativeStyle')}
                placeholder="e.g., Third Person Omniscient"
                className="w-full bg-surface-container-highest/50 border-outline-variant/30 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
              />
              {form.formState.errors.narrativeStyle && <p className="text-error text-xs">{form.formState.errors.narrativeStyle.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Tone</label>
              <Input {...form.register('tone')} className="bg-surface-container-highest/50 border-outline-variant/30 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Vocabulary</label>
              <Input {...form.register('vocabularyLevel')} className="bg-surface-container-highest/50 border-outline-variant/30 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">Pacing</label>
              <Input {...form.register('pacingPreference')} className="bg-surface-container-highest/50 border-outline-variant/30 rounded-lg" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
              Voice Essence (Description)
            </label>
            <Textarea 
              {...form.register('description')}
              placeholder="Describe the overarching feel and rules of this narrative voice..."
              rows={3}
              className="w-full bg-surface-container-highest/50 border-outline-variant/30 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant ml-1">
                <MessageSquare className="w-3.5 h-3.5" />
                Signature Narrative Phrases
              </label>
              <button type="button" onClick={() => append({ value: '' })} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input 
                    {...form.register(`signaturePhrases.${index}.value`)}
                    placeholder="e.g., 'The shadows lengthened as if reaching for...'"
                    className="flex-1 bg-surface-container-highest/50 border-outline-variant/30 rounded-xl"
                  />
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="p-3 rounded-xl text-error hover:bg-error/10 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <input 
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20"
            />
            <label htmlFor="isActive" className="flex flex-col cursor-pointer">
              <span className="text-sm font-headline font-bold text-on-surface">Set as Active Narrative Voice</span>
              <span className="text-[9px] font-label text-on-surface-variant uppercase tracking-wider">Only one Master Voice can be active at a time</span>
            </label>
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
              className="flex items-center gap-2 px-8 py-6 bg-primary text-on-primary-fixed rounded-full font-label text-sm uppercase tracking-wider font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Saving...' : 'Save Narrative Voice'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
