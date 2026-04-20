import React, { useMemo } from 'react';
import { EditorCanvas } from './EditorCanvas';
import { WorkbenchView } from '../panels/WorkbenchView';
import { ContextPanel } from './ContextPanel';
import { RefinePanel } from './RefinePanel';
import { ArchivePanel } from './ArchivePanel';
import { ReportPanel } from '../flowrail/ReportPanel';
import { PolishedView } from './PolishedView';
import { SovereignErrorBoundary } from '../SovereignErrorBoundary';
import { EditorState } from '../../hooks/useEditorState';
import { motion } from 'motion/react';

interface EditorMainProps {
  state: EditorState;
}

const TabPanel: React.FC<{ active: boolean; children: React.ReactNode }> = ({ active, children }) => {
  return (
    <motion.div
      initial={false}
      animate={{ 
        opacity: active ? 1 : 0,
        scale: active ? 1 : 0.995,
        y: active ? 0 : 2,
        pointerEvents: active ? 'auto' : 'none',
        visibility: active ? 'visible' : 'hidden'
      }}
      transition={{ 
        duration: 0.15, 
        ease: [0.23, 1, 0.32, 1] 
      }}
      className="absolute inset-0 w-full h-full overflow-hidden flex flex-col"
    >
      {children}
    </motion.div>
  );
};

export const EditorMain: React.FC<EditorMainProps> = React.memo(({ state }) => {
  const { activeTab } = state;

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden">
      {/* Persistent Panel Stack for 60fps Transitions */}
      
      <TabPanel active={activeTab === 'draft'}>
        <EditorCanvas
          editorRef={state.editorRef}
          editorMode={state.editorMode}
          setEditorMode={state.setEditorMode}
          dispatchDraft={state.dispatchDraft}
          draftState={state.draftState}
          selection={state.selection}
          surgicalSelection={state.surgicalSelection}
          setSurgicalSelection={state.setSurgicalSelection}
          setSelection={state.setSelection}
          handleAcceptChanges={state.handleAcceptChanges}
          onCommitPart={state.handleCommitPart}
          saveStatus={state.saveStatus}
          wordCount={state.wordCount}
          showToast={state.showToast}
          loreTerms={state.loreEntries.filter(e => e.isActive).flatMap(e => [e.title, ...(e.aliases || [])])}
          onLoreTermClick={(term) => {
              const entry = state.loreEntries.find(e => e.title.toLowerCase() === term.toLowerCase() || e.aliases?.some(a => a.toLowerCase() === term.toLowerCase()));
              if (entry) {
                  state.setActiveTab('context');
                  state.showToast(`Opened context for ${entry.title}`);
              }
          }}
          onRefreshManuscript={state.onRefreshManuscript}
        />
      </TabPanel>

      <TabPanel active={activeTab === 'workbench'}>
        <SovereignErrorBoundary>
          <WorkbenchView 
            currentDraft={state.workbenchDraft || state.draftState.present}
            draft={state.debouncedDraft}
            activeReviewVersion={state.activeReviewVersion}
            setActiveReviewVersion={state.setActiveReviewVersion}
            dispatchDraft={state.dispatchDraft}
            showToast={state.showToast}
          />
        </SovereignErrorBoundary>
      </TabPanel>

      <TabPanel active={activeTab === 'context'}>
        <ContextPanel 
          continuityIssues={state.continuityIssues}
          showToast={state.showToast}
        />
      </TabPanel>

      <TabPanel active={activeTab === 'refine'}>
        <RefinePanel 
          draft={state.workbenchDraft || state.draftState.present}
          isRefining={state.isRefining}
          setIsRefining={state.setIsRefining}
          showToast={state.showToast}
          onNewVersion={state.handleNewVersion}
          selection={state.selection}
          editorRef={state.editorRef}
          setActiveTab={state.setActiveTab}
          localWarnings={state.continuityIssues}
        />
      </TabPanel>

      <TabPanel active={activeTab === 'archive'}>
        <ArchivePanel 
          showToast={state.showToast}
          versionHistory={state.versionHistory}
          currentVersionIndex={state.currentVersionIndex}
          originalDraft={state.draftState.present}
          onSelectVersion={state.setCurrentVersionIndex}
          onDeleteVersion={state.onDeleteVersion}
          onUpdateVersion={state.onUpdateVersion}
          onClearHistory={() => state.onClearVersionHistory(state.currentSceneId)}
          setActiveTab={state.setActiveTab}
          setActiveReviewVersion={state.setActiveReviewVersion}
        />
      </TabPanel>

      <TabPanel active={activeTab === 'report'}>
        <SovereignErrorBoundary>
          <ReportPanel 
            version={state.currentVersion}
            original={state.draftState.present}
            onAccept={state.handleAcceptVersion}
            onRevertLore={state.handleRevertLore}
            onRevertSpecificLore={state.handleRevertSpecificLore}
            onRevertSelfCorrection={state.handleRevertSelfCorrection}
            showToast={state.showToast}
            setActiveReviewVersion={state.setActiveReviewVersion}
          />
        </SovereignErrorBoundary>
      </TabPanel>

      <TabPanel active={activeTab === 'polished'}>
        {state.currentVersion && (
          <PolishedView 
            version={state.currentVersion}
            onBack={() => state.setActiveTab('archive')}
            showToast={state.showToast}
          />
        )}
      </TabPanel>
    </div>
  );
});
