import React from 'react';
import { EditorProps } from '../../types';
import { EditorModals } from '../editor/EditorModals';
import { EditorSidebar } from '../editor/EditorSidebar';
import { EditorMain } from '../editor/EditorMain';
import { EditorToolbar } from '../editor/EditorToolbar';
import { EditorFlowRail } from '../editor/EditorFlowRail';
import { useEditorState } from '../../hooks/useEditorState';
import { useEditorShortcuts } from '../../hooks/useEditorShortcuts';

// Main Editor View Component
export const Editor: React.FC<{ showToast: (msg: string) => void }> = ({ showToast }) => {
  const state = useEditorState(showToast);
  
  useEditorShortcuts({
    selection: state.selection,
    showToast: state.showToast,
    setActiveTab: state.setActiveTab
  });

  return (
    <div 
      onClick={state.handleGutterClick}
      className={`flex flex-col h-full w-full overflow-hidden bg-surface-container-lowest text-on-surface ${state.isZenMode ? 'is-zen' : ''} ${state.isZenMode && !state.isUIVisible ? 'cursor-none' : ''}`}
    >
      <EditorModals 
        showComparison={state.showComparison}
        showConflicts={state.showConflicts}
        showLoreRevert={state.showLoreRevert}
        currentVersion={state.currentVersion}
        originalDraft={state.draftState.present}
        conflicts={state.currentVersion?.conflicts || []}
        loreCorrections={state.currentVersion?.loreCorrections || []}
        setShowComparison={state.setShowComparison}
        setShowConflicts={state.setShowConflicts}
        setShowLoreRevert={state.setShowLoreRevert}
        onRevertLore={state.handleRevertLore}
        onRevertSpecificLore={state.handleRevertSpecificLore}
        onAcceptVersion={state.handleAcceptVersion}
        setActiveTab={state.setActiveTab}
      />

      <EditorToolbar 
        isZenMode={state.isZenMode}
        activeTab={state.activeTab}
        activeHUD={state.activeHUD}
        projectName={state.projectName}
        currentChapter={state.currentChapter}
        scenes={state.scenes}
        wordCount={state.wordCount}
        progress={state.progress}
        goal={state.goal}
        setActiveTab={state.setActiveTab}
        setActiveHUD={state.setActiveHUD}
      />

      {/* Workspace */}
      <div className="flex-1 flex flex-row min-h-0 relative gap-5 p-4 md:p-5 pt-4">
        <EditorSidebar 
          activeHUD={state.activeHUD}
          setActiveHUD={state.setActiveHUD}
          scenes={state.scenes}
          chapters={state.chapters}
          currentSceneId={state.currentSceneId}
          setCurrentSceneId={state.setCurrentSceneId}
          setScenes={state.setScenes}
          setChapters={state.setChapters}
          setDraft={state.setDraft}
          draft={state.draftState.present}
          showToast={state.showToast}
          versionHistory={state.versionHistory}
          projectName={state.projectName}
          setProjectName={state.setProjectName}
        />

        {/* Center Sanctuary */}
        <main className={`flex-1 flex flex-col min-h-0 overflow-hidden relative bg-transparent`}>
          <div className="flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden">
            <EditorMain state={state} />
          </div>
        </main>
      </div>

      <EditorFlowRail 
        isZenMode={state.isZenMode}
        setIsZenMode={state.setIsZenMode}
        activeTab={state.activeTab}
        setActiveTab={state.setActiveTab}
        saveStatus={state.saveStatus}
        isIndexing={state.isIndexing}
        isScanning={state.isScanning}
      />
    </div>
  );
};

export default Editor;
