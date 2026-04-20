import React from 'react';
import { Fingerprint, Download, Upload } from 'lucide-react';
import { Scene, WritingGoal } from '../../types';
import { formatStoryDate } from '../../utils/calendar';

interface ProjectHeaderProps {
  projectName: string;
  exportProject: () => Promise<void>;
  importProject: (file: File) => Promise<void>;
  isImporting: boolean;
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectName,
  exportProject,
  importProject,
  isImporting,
  onImportFile,
  fileInputRef
}) => {
  return (
    <div className="flex flex-col md:flex-row items-end justify-between gap-5 border-b border-white/5 pb-12">
      <div className="space-y-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
            <Fingerprint className="w-6 h-6 text-primary" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">Sovereign Command</span>
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-light tracking-tighter leading-none">
          {projectName}<span className="text-primary">.</span>
        </h1>
        <p className="font-headline text-lg text-on-surface-variant/40 italic max-w-xl leading-relaxed">
          "Reveal the author—clearly, faithfully, and without distortion."
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={exportProject}
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-surface-container-highest/50 text-on-surface-variant font-label text-[9px] uppercase tracking-widest border border-outline-variant/10 hover:bg-surface-container-high hover:text-primary transition-all group shadow-sm"
        >
          <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Export Ledger
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="flex items-center gap-3 px-6 py-3 rounded-full bg-surface-container-highest/50 text-on-surface-variant font-label text-[9px] uppercase tracking-widest border border-outline-variant/10 hover:bg-surface-container-high hover:text-primary transition-all disabled:opacity-50 group shadow-sm"
        >
          <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {isImporting ? 'Importing...' : 'Import Archive'}
        </button>
        <input type="file" ref={fileInputRef} onChange={onImportFile} accept=".echo,.json" className="hidden" />
      </div>
    </div>
  );
};
