import React from 'react';
import { SceneMetadata, Chapter, RefinedVersion } from '../../types';
import { DragDropContext } from '@hello-pangea/dnd';
import { useLoreStore } from '../../stores/useLoreStore';
import { useManuscriptStore } from '../../stores/useManuscriptStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { SceneManagerHeader } from './scene-manager/SceneManagerHeader';
import { UnassignedScenes } from './scene-manager/UnassignedScenes';
import { ChaptersList } from './scene-manager/ChaptersList';
import { useSceneManagerLogic } from '../../hooks/useSceneManagerLogic';

interface SceneManagerProps {
  onBackToWorkspace?: () => void;
  variant?: 'full' | 'mini';
  onCollapse?: () => void;
  showToast: (message: string) => void;
}

export const SceneManager: React.FC<SceneManagerProps> = React.memo(({
  onBackToWorkspace,
  variant = 'full',
  showToast
}) => {
  const { scenes, chapters, currentSceneId, versionHistory } = useManuscriptStore();
  const projectName = useProjectStore(state => state.projectName);
  const calendarConfig = useLoreStore(state => state.calendarConfig);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { state, actions } = useSceneManagerLogic({
    showToast
  });

  const unassignedScenes = scenes.filter(s => !s.chapterId).sort((a, b) => a.order - b.order);

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <SceneManagerHeader 
        projectName={projectName}
        isEditingProjectName={state.isEditingProjectName}
        editProjectName={state.editProjectName}
        onBackToWorkspace={onBackToWorkspace}
        onStartEditingProject={actions.startEditingProject}
        onSaveProjectName={actions.saveProjectName}
        onCancelEditingProject={() => actions.cancelEdit()}
        setEditProjectName={actions.setEditProjectName}
        onAddChapter={actions.handleAddChapter}
        onAddScene={() => actions.handleAddScene()}
      />
      
      <div 
        className="flex-1 p-4 overflow-y-auto custom-scrollbar"
        ref={containerRef}
      >
        <DragDropContext onDragEnd={actions.onDragEnd}>
          <UnassignedScenes 
            scenes={unassignedScenes}
            currentSceneId={currentSceneId}
            variant={variant}
            editingSceneId={state.editingSceneId}
            editingMetadataId={state.editingMetadataId}
            editTitle={state.editTitle}
            editDay={state.editDay}
            editDate={state.editDate}
            editTime={state.editTime}
            calendarConfig={calendarConfig}
            versionHistory={versionHistory}
            onSelectScene={actions.handleSelectScene}
            onStartEditTitle={actions.startEditingScene}
            onStartEditMetadata={actions.startEditingMetadata}
            onSaveTitle={actions.saveEditScene}
            onSaveMetadata={actions.handleSaveMetadata}
            onCancelEdit={actions.cancelEdit}
            onDelete={actions.handleDeleteScene}
            setEditTitle={actions.setEditTitle}
            setEditDay={actions.setEditDay}
            setEditDate={actions.setEditDate}
            setEditTime={actions.setEditTime}
          />

          <ChaptersList 
            chapters={chapters}
            scenes={scenes}
            currentSceneId={currentSceneId}
            variant={variant}
            editingSceneId={state.editingSceneId}
            editingMetadataId={state.editingMetadataId}
            editingChapterId={state.editingChapterId}
            editTitle={state.editTitle}
            editDay={state.editDay}
            editDate={state.editDate}
            editTime={state.editTime}
            calendarConfig={calendarConfig}
            versionHistory={versionHistory}
            expandedChapters={state.expandedChapters}
            onToggleChapter={actions.toggleChapter}
            onExportChapter={actions.handleExportChapterToEditor}
            onAddScene={actions.handleAddScene}
            onStartEditChapter={actions.startEditingChapter}
            onDeleteChapter={actions.handleDeleteChapter}
            onSelectScene={actions.handleSelectScene}
            onStartEditSceneTitle={actions.startEditingScene}
            onStartEditSceneMetadata={actions.startEditingMetadata}
            onSaveSceneTitle={actions.saveEditScene}
            onSaveSceneMetadata={actions.handleSaveMetadata}
            onSaveChapterTitle={actions.saveEditChapter}
            onCancelEdit={actions.cancelEdit}
            onDeleteScene={actions.handleDeleteScene}
            setEditTitle={actions.setEditTitle}
            setEditDay={actions.setEditDay}
            setEditDate={actions.setEditDate}
            setEditTime={actions.setEditTime}
          />
        </DragDropContext>
      </div>
    </div>
  );
});
