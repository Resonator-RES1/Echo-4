import React, { useState, useRef } from 'react';
import { useProjectStore } from '../stores/useProjectStore';
import { Download, Upload, Edit2, Check, X, FileJson } from 'lucide-react';

interface ProjectManagerProps {
  showToast: (message: string) => void;
}

export function ProjectManager({ showToast }: ProjectManagerProps) {
  const { projectName, setProjectName, exportProject, importProject, isImporting, importError } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRename = () => {
    if (tempName.trim() && tempName !== projectName) {
      setProjectName(tempName.trim());
      showToast(`Project renamed to "${tempName.trim()}"`);
    }
    setIsEditing(false);
  };

  const handleExport = async () => {
    await exportProject();
    showToast("Project exported successfully.");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importProject(file);
        showToast("Project imported successfully.");
        // Reload to refresh all states
        window.location.reload();
      } catch (error: any) {
        showToast(`Import failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 md:gap-4 overflow-visible">
      <div className="flex items-center gap-2 bg-surface-container-highest/50 rounded-full px-3 py-1.5 border border-outline-variant/10">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs md:text-sm font-medium w-24 md:w-40"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            <button onClick={handleRename} className="text-primary hover:text-primary/80">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { setIsEditing(false); setTempName(projectName); }} className="text-on-surface-variant hover:text-on-surface">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <FileJson className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs md:text-sm font-medium max-w-[100px] md:max-w-[200px] truncate">{projectName}</span>
            <button onClick={() => setIsEditing(true)} className="text-on-surface-variant hover:text-primary transition-colors">
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-[9px] md:text-xs font-label uppercase tracking-wider"
          title="Export Project (.echo)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export</span>
        </button>

        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-highest hover:bg-surface-container-high transition-colors text-[9px] md:text-xs font-label uppercase tracking-wider disabled:opacity-50"
          title="Import Project (.echo)"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isImporting ? 'Importing...' : 'Import'}</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".echo,.json"
          className="hidden"
        />
      </div>

      {importError && (
        <div className="absolute top-full mt-2 right-0 bg-error/10 text-error text-[9px] px-2 py-1 rounded border border-error/20">
          {importError}
        </div>
      )}
    </div>
  );
}
