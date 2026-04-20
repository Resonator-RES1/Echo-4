import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { LoreEntry, LoreCategory } from '../../types';

interface LoreCategoryAccordionProps {
  loreCategories: LoreCategory[];
  entriesByCategory: Record<string, LoreEntry[]>;
  expandedCategories: Set<string>;
  toggleCategory: (id: string) => void;
  categoryLimits: Record<string, number>;
  setCategoryLimits: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleEditEntry: (entry: LoreEntry) => void;
  deleteLoreEntry: (id: string) => void;
  searchQuery: string;
  selectedTags: Set<string>;
  editingEntry?: LoreEntry | null;
}

export const LoreCategoryAccordion: React.FC<LoreCategoryAccordionProps> = ({
  loreCategories,
  entriesByCategory,
  expandedCategories,
  toggleCategory,
  categoryLimits,
  setCategoryLimits,
  handleEditEntry,
  deleteLoreEntry,
  searchQuery,
  selectedTags,
  editingEntry
}) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {loreCategories.map(cat => {
        const entries = entriesByCategory[cat.id] || [];
        if ((searchQuery || selectedTags.size > 0) && entries.length === 0) return null;
        const isExpanded = expandedCategories.has(cat.id);
        const limit = categoryLimits[cat.id] || 10;
        const visibleEntries = entries.slice(0, limit);
        const hasMore = entries.length > limit;

        return (
          <div key={cat.id} className="group/cat">
            <button 
              onClick={() => toggleCategory(cat.id)}
              className={`w-full p-4 rounded-lg flex items-center justify-between group transition-all border ${isExpanded ? 'bg-surface-container-low/50 border-white/10' : 'bg-transparent border-transparent hover:bg-surface-container-low/20'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-1.5 h-6 rounded-full transition-all ${entries.length > 0 ? (CATEGORY_COLORS[cat.name] || CATEGORY_COLORS['Default']) : 'bg-outline-variant/10'} ${isExpanded ? 'scale-y-110 shadow-primary-glow' : ''}`} />
                <h3 className={`font-headline text-lg font-light transition-colors ${isExpanded ? 'text-on-surface' : 'text-on-surface/40 group-hover:text-on-surface/70'}`}>
                  {cat.name}
                </h3>
                <span className="text-[9px] font-mono text-on-surface-variant/20 tracking-tighter">[{entries.length}]</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-on-surface-variant/20 transition-transform duration-500 ${isExpanded ? 'rotate-90 text-primary/40' : ''}`} />
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-2 pt-0 space-y-1">
                    {entries.length === 0 ? (
                      <p className="text-[9px] text-on-surface-variant/40 italic pl-10 py-4">No entries matching filters.</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 gap-3">
                          {visibleEntries.map(entry => (
                            <div 
                              key={entry.id}
                              onClick={() => handleEditEntry(entry)}
                              className={`p-5 rounded-lg border transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                                editingEntry?.id === entry.id 
                                  ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' 
                                  : 'bg-surface-container-low/20 border-white/5 hover:border-primary/20 hover:bg-primary/5'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3 relative z-10">
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${cat.color || 'bg-primary/30'}`} />
                                  <span className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant/40">
                                    {cat.name}
                                  </span>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); deleteLoreEntry(entry.id); }}
                                  className="text-on-surface-variant/40 hover:text-error transition-colors p-3 -mr-3 -mt-3"
                                  title="Purge Axiom"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-headline text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">{entry.title}</h4>
                                {entry.tags && entry.tags.length > 0 && (
                                  <div className="flex gap-1 overflow-hidden">
                                    {entry.tags.slice(0, 1).map(tag => (
                                      <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full whitespace-nowrap">#{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <p className="font-body text-[9px] text-on-surface-variant/60 line-clamp-2 leading-relaxed">
                                {entry.description || "No description defined."}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        {hasMore && (
                          <div className="pl-8 pt-4 pb-8">
                            <button 
                              onClick={() => setCategoryLimits(prev => ({ ...prev, [cat.id]: limit + 20 }))}
                              className="w-full py-3 rounded-lg border border-dashed border-white/10 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:bg-white/5 hover:text-primary transition-all"
                            >
                              Show More ({entries.length - limit} remaining)
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
