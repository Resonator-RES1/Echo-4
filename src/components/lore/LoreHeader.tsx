import React from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { PanelHeader } from '../ui/PanelHeader';

interface LoreHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  allTags: string[];
  selectedTags: Set<string>;
  toggleTag: (tag: string) => void;
  setSelectedTags: (tags: Set<string>) => void;
  handleAddNew: () => void;
  onClose: () => void;
}

export const LoreHeader: React.FC<LoreHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  allTags,
  selectedTags,
  toggleTag,
  setSelectedTags,
  handleAddNew,
  onClose
}) => {
  return (
    <header className="mb-10 shrink-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PanelHeader 
          title="The Axioms"
          description="Fundamental truths and established world constraints."
          icon={<BookOpen className="w-5 h-5 text-primary" />}
          onAdd={handleAddNew}
          addLabel="New Axiom"
          onClose={onClose}
        />
      </div>
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-8">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/20 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search the archives..."
            className="w-full bg-surface-container-low/30 border border-white/5 rounded-lg py-4 pl-14 pr-6 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/20"
          />
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar w-full md:w-auto">
            <div className="flex items-center gap-2 shrink-0 text-[9px] font-label uppercase tracking-widest text-on-surface-variant/40 mr-2">
              <Filter className="w-3 h-3" />
              Filter:
            </div>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-medium transition-all whitespace-nowrap border ${
                  selectedTags.has(tag) 
                    ? 'bg-primary text-on-primary border-primary shadow-primary-glow' 
                    : 'bg-surface-container-highest/30 text-on-surface-variant/60 border-white/5 hover:border-primary/20'
                }`}
              >
                #{tag}
              </button>
            ))}
            {selectedTags.size > 0 && (
              <button 
                onClick={() => setSelectedTags(new Set())}
                className="text-[9px] font-label uppercase tracking-widest text-error hover:underline ml-2 whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
