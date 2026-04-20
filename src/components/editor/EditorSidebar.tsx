import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SceneManager } from './SceneManager';
import { Scene, Chapter, RefinedVersion } from '../../types';

interface EditorSidebarProps {
  activeHUD: 'sceneManager' | null;
  setActiveHUD: (hud: 'sceneManager' | null) => void;
  scenes: Scene[];
  chapters: Chapter[];
  currentSceneId: string | null;
  setCurrentSceneId: (id: string | null) => void;
  setScenes: (scenes: Scene[]) => void;
  setChapters: (chapters: Chapter[]) => void;
  setDraft: (draft: string) => void;
  draft: string;
  showToast: (message: string) => void;
  versionHistory: RefinedVersion[];
  projectName: string;
  setProjectName: (name: string) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = React.memo(({
  activeHUD,
  setActiveHUD,
  scenes,
  chapters,
  currentSceneId,
  setCurrentSceneId,
  setScenes,
  setChapters,
  setDraft,
  draft,
  showToast,
  versionHistory,
  projectName,
  setProjectName
}) => {
  return (
    <AnimatePresence>
      {activeHUD === 'sceneManager' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-0 md:top-4 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-[800px] max-w-full z-50 bg-surface-container-low/90 md:bg-surface-container-low/80 backdrop-blur-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-white/[0.03] md:rounded-xl overflow-hidden h-full md:h-[80vh]"
        >
          <SceneManager 
            scenes={scenes}
            chapters={chapters}
            currentSceneId={currentSceneId}
            setCurrentSceneId={setCurrentSceneId}
            setScenes={setScenes}
            setChapters={setChapters}
            setDraft={setDraft}
            draft={draft}
            showToast={showToast}
            versionHistory={versionHistory}
            projectName={projectName}
            setProjectName={setProjectName}
            onBackToWorkspace={() => setActiveHUD(null)}
            variant="full"
            onCollapse={() => setActiveHUD(null)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
