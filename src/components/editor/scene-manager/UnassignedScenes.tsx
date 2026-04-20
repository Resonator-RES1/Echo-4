import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Sparkles, FileText } from 'lucide-react';
import { SceneMetadata, RefinedVersion, StoryDate, CalendarConfig } from '../../../types';
import { SceneItem } from './SceneItem';

interface UnassignedScenesProps {
  scenes: SceneMetadata[];
  currentSceneId: string | null;
  variant: 'full' | 'mini';
  editingSceneId: string | null;
  editingMetadataId: string | null;
  editTitle: string;
  editDay: number;
  editDate: StoryDate | undefined;
  editTime: string;
  editDraftStage: SceneMetadata['draftStage'];
  calendarConfig: CalendarConfig;
  versionHistory: RefinedVersion[];
  onSelectScene: (id: string) => void;
  onStartEditTitle: (scene: SceneMetadata, e: React.MouseEvent) => void;
  onStartEditMetadata: (scene: SceneMetadata, e: React.MouseEvent) => void;
  onSaveTitle: (id: string, e?: React.MouseEvent) => void;
  onSaveMetadata: (id: string, e?: React.MouseEvent) => void;
  onCancelEdit: (e?: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  setEditTitle: (title: string) => void;
  setEditDay: (day: number) => void;
  setEditDate: (date: StoryDate | undefined) => void;
  setEditTime: (time: string) => void;
  setEditDraftStage: (stage: SceneMetadata['draftStage']) => void;
}

export const UnassignedScenes: React.FC<UnassignedScenesProps> = ({
  scenes,
  currentSceneId,
  variant,
  editingSceneId,
  editingMetadataId,
  editTitle,
  editDay,
  editDate,
  editTime,
  editDraftStage,
  calendarConfig,
  versionHistory,
  onSelectScene,
  onStartEditTitle,
  onStartEditMetadata,
  onSaveTitle,
  onSaveMetadata,
  onCancelEdit,
  onDelete,
  setEditTitle,
  setEditDay,
  setEditDate,
  setEditTime,
  setEditDraftStage
}) => {
  const getLatestVersion = (sceneId: string) => {
    return versionHistory.filter(v => v.sceneId === sceneId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  const hasAcceptedVersion = (sceneId: string) => {
    return versionHistory.some(v => v.sceneId === sceneId && v.isAccepted);
  };

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
          <Sparkles size={14} className="text-primary" />
        </div>
        <h3 className="font-black text-[9px] uppercase tracking-widest text-primary/60">Unassigned Fragments</h3>
      </div>
      <Droppable droppableId="unassigned" type="scene">
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef} 
            {...provided.droppableProps}
            className={`min-h-[80px] p-4 rounded-xl transition-all border-2 border-dashed ${
              snapshot.isDraggingOver 
                ? 'bg-primary/10 border-primary/40 shadow-2xl shadow-primary/5 scale-[1.01]' 
                : 'bg-white/[0.01] border-white/5 hover:border-white/10'
            }`}
          >
            {scenes.map((scene, index) => (
              <SceneItem 
                key={scene.id}
                scene={scene}
                index={index}
                isSelected={currentSceneId === scene.id}
                variant={variant}
                editingSceneId={editingSceneId}
                editingMetadataId={editingMetadataId}
                editTitle={editTitle}
                editDay={editDay}
                editDate={editDate}
                editTime={editTime}
                editDraftStage={editDraftStage}
                calendarConfig={calendarConfig}
                latestVersion={getLatestVersion(scene.id)}
                hasAcceptedVersion={hasAcceptedVersion(scene.id)}
                onSelect={onSelectScene}
                onStartEditTitle={onStartEditTitle}
                onStartEditMetadata={onStartEditMetadata}
                onSaveTitle={onSaveTitle}
                onSaveMetadata={onSaveMetadata}
                onCancelEdit={onCancelEdit}
                onDelete={onDelete}
                setEditTitle={setEditTitle}
                setEditDay={setEditDay}
                setEditDate={setEditDate}
                setEditTime={setEditTime}
                setEditDraftStage={setEditDraftStage}
              />
            ))}
            {provided.placeholder}
            {scenes.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/10 group/empty">
                <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4 group-hover/empty:scale-110 transition-transform duration-500">
                  <FileText size={32} className="opacity-20" />
                </div>
                <p className="text-[9px] font-black uppercase tracking-wider italic opacity-40">No unassigned fragments</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
