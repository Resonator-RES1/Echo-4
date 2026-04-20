import React from 'react';
import { ChevronLeft, Folder, Plus, Edit2, Check as CheckIcon, X } from 'lucide-react';

interface SceneManagerHeaderProps {
  projectName: string;
  isEditingProjectName: boolean;
  editProjectName: string;
  onBackToWorkspace?: () => void;
  onStartEditingProject: (e: React.MouseEvent) => void;
  onSaveProjectName: () => void;
  onCancelEditingProject: () => void;
  setEditProjectName: (name: string) => void;
  onAddChapter: () => void;
  onAddScene: () => void;
}

export const SceneManagerHeader: React.FC<SceneManagerHeaderProps> = ({
  projectName,
  isEditingProjectName,
  editProjectName,
  onBackToWorkspace,
  onStartEditingProject,
  onSaveProjectName,
  onCancelEditingProject,
  setEditProjectName,
  onAddChapter,
  onAddScene
}) => {
  return (
    <div className="p-4 md:p-4 flex flex-col gap-4 md:gap-4 border-b border-white/5 bg-surface-container-low/20 backdrop-blur-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div className="flex items-center gap-4 flex-1 min-w-0 w-full md:w-auto">
          {onBackToWorkspace && (
            <button 
              onClick={onBackToWorkspace}
              className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all group shrink-0"
              title="Back to Workspace"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-primary-glow" />
              <h2 className="font-black text-[9px] uppercase tracking-widest text-primary/60">Surgical Manifest</h2>
            </div>
            {isEditingProjectName ? (
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editProjectName}
                  onChange={e => setEditProjectName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onSaveProjectName();
                    if (e.key === 'Escape') onCancelEditingProject();
                  }}
                  className="flex-1 bg-black/40 border border-primary/50 rounded-xl px-4 py-2 text-sm outline-none text-on-surface font-bold shadow-inner min-w-0"
                  autoFocus
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={onSaveProjectName} className="w-9 h-9 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 rounded-full transition-colors">
                    <CheckIcon size={18} />
                  </button>
                  <button onClick={onCancelEditingProject} className="w-9 h-9 flex items-center justify-center text-error hover:bg-error/10 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center gap-3 group/project cursor-pointer"
                onDoubleClick={onStartEditingProject}
              >
                <h1 className="text-xl md:text-2xl font-bold text-on-surface truncate tracking-tight text-glow">{projectName}</h1>
                <button 
                  onClick={onStartEditingProject}
                  className="opacity-0 group-hover/project:opacity-100 w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg text-on-surface-variant hover:text-primary transition-all shrink-0"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-0 md:ml-4 w-full md:w-auto overflow-x-auto scrollbar-none pb-2 md:pb-0">
          <button 
            onClick={onAddChapter}
            className="flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all group shadow-xl shrink-0"
            title="Add Chapter"
          >
            <Folder size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">Add Chapter</span>
          </button>
          <button 
            onClick={onAddScene}
            className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 rounded-lg bg-primary text-surface font-black uppercase tracking-widest text-[9px] hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 group relative overflow-hidden shrink-0"
            title="Add Scene"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Plus size={16} className="group-hover:scale-110 transition-transform" />
            <span>New Scene</span>
          </button>
        </div>
      </div>
    </div>
  );
};
