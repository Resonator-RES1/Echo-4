import React, { useState } from 'react';
import { LoreEntry } from '../../types';
import { BookOpen, CheckCircle2, PlusCircle, X, Sparkles, Trash2 } from 'lucide-react';
import { LoreEntryForm } from '../forms/LoreEntryForm';
import { motion, AnimatePresence } from 'motion/react';
import { useLoreStore } from '../../stores/useLoreStore';

interface LoreContextManagerProps {
  loreEntries: LoreEntry[];
  onAddLoreEntry: (entry: LoreEntry) => void;
  onDeleteLoreEntry: (id: string) => void;
}

export const LoreContextManager: React.FC<LoreContextManagerProps> = ({ loreEntries, onAddLoreEntry, onDeleteLoreEntry }) => {
  const { loreCategories } = useLoreStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLoreId, setSelectedLoreId] = useState<string>('');
  const activeEntries = loreEntries.filter(e => e.isActive);

  const handleToggleActive = (id: string) => {
    const entry = loreEntries.find(e => e.id === id);
    if (entry) {
      onAddLoreEntry({ ...entry, isActive: !entry.isActive });
      setSelectedLoreId('');
    }
  };

  return (
    <div className="pt-6 border-t border-white/10 space-y-6 relative z-10">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-wider text-on-surface/40">
          <BookOpen className="w-3.5 h-3.5 text-accent-teal" />
          World Axioms
        </label>
        {activeEntries.length > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-teal/10 border border-accent-teal/20 shadow-accent-teal-glow">
            <div className="w-1 h-1 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-accent-teal text-[8px] font-bold tracking-widest uppercase">{activeEntries.length} ACTIVE</span>
          </div>
        )}
      </div>

      <div className="min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {activeEntries.length > 0 ? (
            <div className="space-y-3">
              {activeEntries.map(entry => {
                const category = loreCategories.find(c => c.id === entry.categoryId);
                return (
                  <motion.div 
                    key={entry.id} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 bg-white/5 border border-accent-teal/30 rounded-lg flex items-center justify-between shadow-xl group/lore relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-teal/5 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-3 overflow-hidden relative z-10">
                      <div className="w-8 h-8 rounded-md bg-accent-teal/10 border border-accent-teal/20 flex items-center justify-center flex-shrink-0 group-hover/lore:scale-110 transition-transform">
                        <CheckCircle2 className="w-4 h-4 text-accent-teal" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold text-on-surface truncate tracking-tight group-hover/lore:text-accent-teal transition-colors">
                          {entry.title}
                        </span>
                        <span className="text-[8px] text-on-surface-variant/40 uppercase font-bold tracking-wider">
                          {category?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 relative z-10">
                      <button 
                        onClick={() => handleToggleActive(entry.id)} 
                        className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant/40 hover:text-accent-rose hover:bg-accent-rose/10 hover:border-accent-rose/20 transition-all active:scale-90"
                        title="Deactivate Lore"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onDeleteLoreEntry(entry.id)}
                        className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant/40 hover:text-error hover:bg-error/10 hover:border-error/20 transition-all active:scale-90"
                        title="Delete Lore Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-xl text-center space-y-2 group/empty hover:border-accent-teal/20 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto group-hover/empty:scale-110 group-hover/empty:bg-accent-teal/5 transition-all">
                <Sparkles className="w-5 h-5 text-on-surface-variant/20 group-hover/empty:text-accent-teal/40 transition-colors" />
              </div>
              <p className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-wider leading-relaxed">No active lore context.<br/>Add entries below to ground your prose.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center gap-2">
          <div className="relative group/select flex-1">
            <select 
              value={selectedLoreId}
              onChange={(e) => setSelectedLoreId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-on-surface focus:ring-4 focus:ring-accent-teal/10 focus:border-accent-teal/50 transition-all font-bold appearance-none pr-10 shadow-inner"
            >
              <option value="" className="bg-surface-container-highest text-on-surface">-- Add lore entry --</option>
              {loreEntries.filter(e => !e.isActive).map(e => (
                <option key={e.id} value={e.id} className="bg-surface-container-highest text-on-surface">{e.title}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/20 group-focus-within/select:text-accent-teal transition-colors">
              <PlusCircle className="w-4 h-4" />
            </div>
          </div>
          {selectedLoreId && (
            <button 
              onClick={() => {
                onDeleteLoreEntry(selectedLoreId);
                setSelectedLoreId('');
              }}
              className="p-3 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-all"
              title="Delete Lore Entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <button 
          onClick={() => handleToggleActive(selectedLoreId)}
          disabled={!selectedLoreId}
          className="w-full py-3 bg-accent-teal hover:bg-accent-teal/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-surface font-bold uppercase tracking-wider text-[9px] shadow-2xl shadow-accent-teal/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group/btn relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
          <PlusCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span>Anchor Axiom</span>
        </button>
      </div>
      
      <button 
        onClick={() => setIsFormOpen(true)}
        className="w-full py-3 border border-dashed border-white/10 rounded-lg text-[9px] font-bold text-on-surface/40 hover:text-accent-teal hover:bg-accent-teal/5 hover:border-accent-teal/20 transition-all uppercase tracking-wider group/create"
      >
        <span className="group-hover:scale-110 transition-transform inline-block">+ Create New Lore Entry</span>
      </button>

      {isFormOpen && (
        <LoreEntryForm 
          onClose={() => setIsFormOpen(false)}
          onSave={(entry) => {
            onAddLoreEntry(entry);
            setIsFormOpen(false);
          }}
        />
      )}
    </div>
  );
};
