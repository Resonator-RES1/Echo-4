import React, { useState, useMemo } from 'react';
import { SceneMetadata, RefinedVersion, WritingGoal, Chapter } from '../../types';
import { SceneManager } from '../editor/SceneManager';
import { motion, AnimatePresence } from 'motion/react';
import { useSwipe } from '../../hooks/useSwipe';
import { useManuscriptLogic } from '../../hooks/useManuscriptLogic';
import { useManuscriptStore } from '../../stores/useManuscriptStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { DesktopPanelLayout } from '../ui/DesktopPanelLayout';
import { LedgerView } from '../manuscript/LedgerView';
import { BlueprintView } from '../manuscript/BlueprintView';
import { BookOpen, CheckCircle, Target, FileText, Layout, Plus, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ManuscriptPanelProps {
  onViewReport: (version: RefinedVersion) => void;
  showToast: (message: string) => void;
}

export const ManuscriptPanel: React.FC<ManuscriptPanelProps> = ({
  onViewReport,
  showToast
}) => {
  const navigate = useNavigate();
  const { 
    scenes, 
    chapters, 
    currentSceneId, 
    versionHistory,
    setScenes,
    writingGoal: goal,
    setWritingGoal: setGoal,
    clearAcceptedVersions: onClearAcceptedVersions,
    deleteVersion: onDeleteVersion,
    setDraft,
    setCurrentSceneId
  } = useManuscriptStore();

  const { projectName } = useProjectStore();
  const [activeTab, setActiveTab] = useState<'scenes' | 'accepted' | 'goals'>('scenes');

  const {
    totalWordCount,
    progress,
    handleExport,
    handleImport,
    handleSaveGoal
  } = useManuscriptLogic(scenes, setScenes, goal, setGoal, showToast);

  const categories = [
    { id: 'scenes', label: 'Scenes', icon: BookOpen },
    { id: 'accepted', label: 'Ledger', icon: CheckCircle },
    { id: 'goals', label: 'Blueprint', icon: Target },
  ];

  const middleColumn = (
    <div className="p-4 flex flex-col gap-3">
      {activeTab === 'scenes' && (
        <>
          <div className="px-2 py-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Manuscript Structure</h3>
          </div>
          {scenes.map(scene => (
            <button
              key={scene.id}
              onClick={() => {
                setCurrentSceneId(scene.id);
                // In this layout, we might want to stay in the panel or jump to editor
              }}
              className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${
                currentSceneId === scene.id 
                  ? 'bg-primary/10 border-primary/30 shadow-primary-glow/10' 
                  : 'bg-surface-container-low/40 border-white/5 hover:border-white/10 hover:bg-surface-container-highest/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                  currentSceneId === scene.id ? 'bg-primary/20 border-primary/30' : 'bg-surface-container-highest border-white/5'
                }`}>
                  <FileText className={`w-4 h-4 ${currentSceneId === scene.id ? 'text-primary' : 'text-on-surface-variant/40'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold tracking-tight truncate ${currentSceneId === scene.id ? 'text-primary' : 'text-on-surface'}`}>
                    {scene.title}
                  </h4>
                  <p className="text-[9px] font-medium text-on-surface-variant/60 uppercase tracking-wider truncate">
                    {scene.wordCount || 0} Words
                  </p>
                </div>
              </div>
            </button>
          ))}
        </>
      )}

      {activeTab === 'accepted' && (
        <div className="px-2 py-10 text-center opacity-40">
          <p className="text-[10px] font-black uppercase tracking-widest">Select from Ledger</p>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="px-2 py-10 text-center opacity-40">
          <p className="text-[10px] font-black uppercase tracking-widest">Blueprint Configuration</p>
        </div>
      )}
    </div>
  );

  const rightColumn = (
    <div className="h-full">
      {activeTab === 'scenes' && (
        <div className="h-full flex flex-col p-6 lg:p-10 max-w-5xl mx-auto">
          <div className="flex-1 bg-white/[0.02] rounded-2xl border border-white/5 shadow-inner overflow-hidden">
            <SceneManager 
              showToast={showToast}
            />
          </div>
        </div>
      )}

      {activeTab === 'accepted' && (
        <div className="h-full overflow-y-auto custom-scrollbar">
          <LedgerView 
            versionHistory={versionHistory}
            onClearAcceptedVersions={onClearAcceptedVersions}
            onDeleteVersion={onDeleteVersion}
            setDraft={setDraft}
            showToast={showToast}
            onViewReport={onViewReport}
          />
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 lg:p-10">
          <BlueprintView 
            goal={goal}
            setGoal={setGoal}
            totalWordCount={totalWordCount}
            progress={progress}
            handleSaveGoal={handleSaveGoal}
          />
        </div>
      )}
    </div>
  );

  return (
    <DesktopPanelLayout
      title="Manuscript Construct"
      subtitle={`Orchestrating the narrative architecture of ${projectName || 'Untitled Project'}.`}
      icon={<Layout className="w-5 h-5 text-primary" />}
      onClose={() => navigate('/workspace')}
      onCreate={() => {}} // SceneManager handles creation
      createLabel="New Scene"
      categories={categories}
      activeCategory={activeTab}
      onCategoryChange={(id: any) => setActiveTab(id)}
      middleColumn={middleColumn}
      rightColumn={rightColumn}
      isMobile={false}
    />
  );
};

export default ManuscriptPanel;

