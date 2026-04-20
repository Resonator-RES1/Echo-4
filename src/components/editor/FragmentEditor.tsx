import React from 'react';
import { Save, Trash2, X, Sparkles } from 'lucide-react';
import { PromptFragment } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface FragmentEditorProps {
  editingFragment: PromptFragment;
  setEditingFragment: (fragment: PromptFragment) => void;
  deleteFragment: (id: string) => void;
  handleSaveFragment: () => void;
}

export const FragmentEditor = ({
  editingFragment,
  setEditingFragment,
  deleteFragment,
  handleSaveFragment,
}: FragmentEditorProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center border border-secondary/20 shadow-lg">
            <Sparkles className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h3 className="text-2xl font-headline font-black text-on-surface tracking-tight">
              {editingFragment.id ? 'Edit Fragment' : 'New Fragment'}
            </h3>
            <p className="text-xs text-on-surface-variant/60 font-label uppercase tracking-widest">
              Prompt Fragment Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => deleteFragment(editingFragment.id)}
            className="text-error/60 hover:text-error hover:bg-error/10 rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button 
            onClick={handleSaveFragment}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl shadow-lg shadow-secondary/20 px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Fragment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant/60 ml-1">
              Fragment Name
            </label>
            <Input 
              value={editingFragment.name}
              onChange={(e) => setEditingFragment({ ...editingFragment, name: e.target.value })}
              placeholder="e.g., Visceral Combat Style"
              className="bg-surface-container-low/40 border-white/5 rounded-xl h-12 focus:ring-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant/60 ml-1">
              Category
            </label>
            <select 
              value={editingFragment.category}
              onChange={(e) => setEditingFragment({ ...editingFragment, category: e.target.value as any })}
              className="w-full bg-surface-container-low/40 border border-white/5 rounded-xl h-12 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all appearance-none"
            >
              <option value="style">Style Guide</option>
              <option value="constraint">Constraint</option>
              <option value="directive">Directive</option>
              <option value="character">Character Logic</option>
              <option value="world">World Rule</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant/60 ml-1">
              Description
            </label>
            <Textarea 
              value={editingFragment.description}
              onChange={(e) => setEditingFragment({ ...editingFragment, description: e.target.value })}
              placeholder="Briefly describe what this fragment achieves..."
              className="bg-surface-container-low/40 border-white/5 rounded-xl min-h-[100px] focus:ring-secondary/50"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant/60 ml-1">
              Prompt Content
            </label>
            <Textarea 
              value={editingFragment.content}
              onChange={(e) => setEditingFragment({ ...editingFragment, content: e.target.value })}
              placeholder="Enter the actual prompt instructions here..."
              className="bg-surface-container-low/40 border-white/5 rounded-xl min-h-[300px] font-mono text-sm focus:ring-secondary/50 leading-relaxed"
            />
            <p className="text-[9px] text-on-surface-variant/40 italic ml-1">
              This content will be injected directly into the LLM system instructions when active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
