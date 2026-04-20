import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Chapter, SceneMetadata, RefinedVersion, StoryDate, CalendarConfig } from '../../../types';
import { ChapterItem } from './ChapterItem';

interface ChaptersListProps {
  chapters: Chapter[];
  scenes: SceneMetadata[];
  currentSceneId: string | null;
  variant: 'full' | 'mini';
  editingSceneId: string | null;
  editingMetadataId: string | null;
  editingChapterId: string | null;
  editTitle: string;
  editDay: number;
  editDate: StoryDate | undefined;
  editTime: string;
  editDraftStage: SceneMetadata['draftStage'];
  calendarConfig: CalendarConfig;
  versionHistory: RefinedVersion[];
  expandedChapters: Set<string>;
  onToggleChapter: (id: string) => void;
  onExportChapter: (id: string, e: React.MouseEvent) => void;
  onAddScene: (id: string) => void;
  onStartEditChapter: (chapter: Chapter, e: React.MouseEvent) => void;
  onDeleteChapter: (id: string, e: React.MouseEvent) => void;
  onSelectScene: (id: string) => void;
  onStartEditSceneTitle: (scene: SceneMetadata, e: React.MouseEvent) => void;
  onStartEditSceneMetadata: (scene: SceneMetadata, e: React.MouseEvent) => void;
  onSaveSceneTitle: (id: string, e?: React.MouseEvent) => void;
  onSaveSceneMetadata: (id: string, e?: React.MouseEvent) => void;
  onSaveChapterTitle: (id: string, e?: React.MouseEvent) => void;
  onCancelEdit: (e?: React.MouseEvent) => void;
  onDeleteScene: (id: string, e: React.MouseEvent) => void;
  setEditTitle: (title: string) => void;
  setEditDay: (day: number) => void;
  setEditDate: (date: StoryDate | undefined) => void;
  setEditTime: (time: string) => void;
  setEditDraftStage: (stage: SceneMetadata['draftStage']) => void;
}

export const ChaptersList: React.FC<ChaptersListProps> = ({
  chapters,
  scenes,
  currentSceneId,
  variant,
  editingSceneId,
  editingMetadataId,
  editingChapterId,
  editTitle,
  editDay,
  editDate,
  editTime,
  editDraftStage,
  calendarConfig,
  versionHistory,
  expandedChapters,
  onToggleChapter,
  onExportChapter,
  onAddScene,
  onStartEditChapter,
  onDeleteChapter,
  onSelectScene,
  onStartEditSceneTitle,
  onStartEditSceneMetadata,
  onSaveSceneTitle,
  onSaveSceneMetadata,
  onSaveChapterTitle,
  onCancelEdit,
  onDeleteScene,
  setEditTitle,
  setEditDay,
  setEditDate,
  setEditTime,
  setEditDraftStage
}) => {
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  return (
    <Droppable droppableId="chapters-list" type="chapter">
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
          {sortedChapters.map((chapter, index) => (
            <ChapterItem 
              key={chapter.id}
              chapter={chapter}
              index={index}
              scenes={scenes}
              isExpanded={expandedChapters.has(chapter.id)}
              onToggle={onToggleChapter}
              onExport={onExportChapter}
              onAddScene={onAddScene}
              onStartEdit={onStartEditChapter}
              onDelete={onDeleteChapter}
              currentSceneId={currentSceneId}
              variant={variant}
              editingSceneId={editingSceneId}
              editingMetadataId={editingMetadataId}
              editingChapterId={editingChapterId}
              editTitle={editTitle}
              editDay={editDay}
              editDate={editDate}
              editTime={editTime}
              calendarConfig={calendarConfig}
              versionHistory={versionHistory}
              onSelectScene={onSelectScene}
              onStartEditSceneTitle={onStartEditSceneTitle}
              onStartEditSceneMetadata={onStartEditSceneMetadata}
              onSaveSceneTitle={onSaveSceneTitle}
              onSaveSceneMetadata={onSaveSceneMetadata}
              onSaveChapterTitle={onSaveChapterTitle}
              onCancelEdit={onCancelEdit}
              onDeleteScene={onDeleteScene}
              setEditTitle={setEditTitle}
              setEditDay={setEditDay}
              setEditDate={setEditDate}
              setEditTime={setEditTime}
            />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
