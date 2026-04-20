import React, { useRef } from 'react';
import { Download, Upload, Users, Search } from 'lucide-react';
import { PanelHeader } from '../ui/PanelHeader';

interface VoiceHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleExport: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddNew: () => void;
  onClose: () => void;
}

export const VoiceHeader: React.FC<VoiceHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  handleExport,
  handleImport,
  handleAddNew,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="mb-10 shrink-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PanelHeader 
          title="Character Voices"
          description="Soul-patterns and stylistic fingerprints of character expression."
          icon={<Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
          onAdd={handleAddNew}
          addLabel="New Character Resonance"
          onClose={onClose}
        />
        
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center bg-surface-container-low/50 rounded-lg p-1 border border-white/5">
            <button 
              onClick={handleExport}
              className="p-2 md:p-3 rounded-xl hover:bg-surface-container-highest transition-all group"
              title="Export Voices"
            >
              <Download className="w-4 h-4 text-on-surface-variant/60 group-hover:text-primary transition-colors" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 md:p-3 rounded-xl hover:bg-surface-container-highest transition-all group"
              title="Import Voices"
            >
              <Upload className="w-4 h-4 text-on-surface-variant/60 group-hover:text-primary transition-colors" />
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>

      {/* Search Bar */}
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
      </div>
    </header>
  );
};
