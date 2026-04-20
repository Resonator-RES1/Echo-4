import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Scene } from '../../types';

interface HeroActionProps {
  latestScene: Scene | undefined;
  onEnterWorkspace: () => void;
  onJumpToScene: (id: string) => void;
  setShowNewProject: (show: boolean) => void;
  setShowGuide: (show: boolean) => void;
}

export const HeroAction: React.FC<HeroActionProps> = ({
  latestScene,
  onEnterWorkspace,
  onJumpToScene,
  setShowNewProject,
  setShowGuide
}) => {
  return (
    <div className="relative p-4 rounded-lg bg-surface-container-low border border-white/5 shadow-2xl overflow-hidden group min-h-[400px] flex flex-col justify-center items-center text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
      
      <div className="relative z-10 space-y-8 max-w-md">
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-xl shadow-primary/10 group-hover:scale-110 transition-transform duration-500">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-headline text-4xl font-light tracking-tight text-on-surface">
            {latestScene ? `Return to "${latestScene.title}"` : 'Begin Your Narrative'}
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed italic">
            {latestScene 
              ? `Last edited ${new Date(latestScene.lastModified).toLocaleDateString()}. Your sovereign voice awaits.`
              : 'The archive is empty. Initialize your first project to begin the audit.'}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => latestScene ? onJumpToScene(latestScene.id) : setShowNewProject(true)}
            className="group relative w-full py-6 rounded-full bg-primary text-surface font-label text-xs uppercase tracking-widest font-black overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/30"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <span className="relative flex items-center justify-center gap-3">
              {latestScene ? 'Enter Manuscript' : 'Create New Project'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </span>
          </button>

          <div className="flex gap-4">
            <button
              onClick={onEnterWorkspace}
              className="flex-1 py-4 rounded-full bg-surface-container-highest/50 text-on-surface font-label text-[9px] uppercase tracking-widest border border-outline-variant/10 hover:bg-surface-container-high transition-all hover:scale-105 active:scale-95"
            >
              Workspace
            </button>
            <button
              onClick={() => setShowGuide(true)}
              className="flex-1 py-4 rounded-full bg-surface-container-highest/50 text-on-surface font-label text-[9px] uppercase tracking-widest border border-outline-variant/10 hover:bg-surface-container-high transition-all hover:scale-105 active:scale-95"
            >
              The Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
