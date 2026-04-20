import React from 'react';
import { ArrowLeft, Upload, Download, Book, CheckCircle2, Target } from 'lucide-react';

interface ManuscriptHeaderProps {
  activeTab: 'scenes' | 'accepted' | 'goals';
  setActiveTab: (tab: 'scenes' | 'accepted' | 'goals') => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExport: () => void;
}

export const ManuscriptHeader: React.FC<ManuscriptHeaderProps> = ({
  activeTab,
  setActiveTab,
  handleImport,
  handleExport
}) => {
  return (
    <div className="px-8 pt-10 pb-6 border-b border-white/5 bg-surface-container-low/40 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'workspace' }))} 
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
          </button>
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-primary shadow-primary-glow animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">The Architect's Table</span>
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface text-glow">Construct</h1>
            <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Structural mapping and narrative assembly.</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <label className="flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group shadow-xl">
            <Upload className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">Import</span>
            <input type="file" accept=".md,.txt" onChange={handleImport} className="hidden" />
          </label>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-3 px-8 py-3 rounded-lg bg-primary text-surface font-black uppercase tracking-widest text-[9px] hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Export Construct</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-black/20 backdrop-blur-xl rounded-lg border border-white/5 w-fit max-w-full overflow-x-auto scrollbar-none">
        {[
          { id: 'scenes', label: 'Structural Blocks', icon: Book },
          { id: 'accepted', label: 'The Ledger', icon: CheckCircle2 },
          { id: 'goals', label: 'Architect\'s Blueprint', icon: Target }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.id 
              ? 'bg-primary text-surface shadow-lg shadow-primary/20' 
              : 'text-on-surface-variant/40 hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
