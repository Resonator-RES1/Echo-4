import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, goal: number) => void;
}

export const NewProjectModal = ({ isOpen, onClose, onCreate }: NewProjectModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-surface-container-low rounded-xl p-5 border border-outline-variant/20 shadow-2xl space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-headline text-2xl font-bold">New Project</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-highest">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Project Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 outline-none focus:border-primary"
          />
          <textarea 
            placeholder="Description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 outline-none focus:border-primary h-32"
          />
          <input 
            type="number" 
            placeholder="Word Count Goal (Optional)" 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-4 rounded-xl bg-surface-container-highest/50 border border-outline-variant/10 outline-none focus:border-primary"
          />
        </div>

        <button 
          onClick={() => onCreate(name, description, parseInt(goal) || 0)}
          className="w-full py-4 rounded-full bg-primary text-on-primary font-label uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
        >
          Create Project <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
