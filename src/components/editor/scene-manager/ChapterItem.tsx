import React from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { GripVertical, Folder, Sparkles, Plus, Edit2, Trash2, ChevronDown, Check as CheckIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Chapter, SceneMetadata, RefinedVersion, StoryDate, CalendarConfig } from '../../../types';
import { SceneItem } from './SceneItem';

interface ChapterItemProps {
  chapter: Chapter;
  index: number;
  scenes: SceneMetadata[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onExport: (id: string, e: React.MouseEvent) => void;
  onAddScene: (id: string) => void;
  onStartEdit: (chapter: Chapter, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  
  // Scene related props
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

export const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  index,
  scenes,
  isExpanded,
  onToggle,
  onExport,
  onAddScene,
  onStartEdit,
  onDelete,
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
  const chapterScenes = scenes.filter(s => s.chapterId === chapter.id).sort((a, b) => a.order - b.order);
  const totalWords = chapterScenes.reduce((acc, s) => acc + (s.wordCount || 0), 0);

  const getLatestVersion = (sceneId: string) => {
    return versionHistory.filter(v => v.sceneId === sceneId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  const hasAcceptedVersion = (sceneId: string) => {
    return versionHistory.some(v => v.sceneId === sceneId && v.isAccepted);
  };

  return (
    <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-lg overflow-hidden transition-all border ${
            snapshot.isDragging 
              ? 'shadow-2xl bg-surface-container-highest/90 backdrop-blur-2xl border-primary/50 scale-[1.02] z-50' 
              : 'bg-white/[0.02] border-white/5 hover:border-white/10 shadow-xl'
          }`}
        >
          <div 
            className={`flex items-center justify-between p-5 transition-all group cursor-pointer ${isExpanded ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]'}`}
            onClick={() => onToggle(chapter.id)}
          >
            {editingChapterId === chapter.id ? (
              <div className="flex items-center w-full gap-3" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onSaveChapterTitle(chapter.id);
                    if (e.key === 'Escape') onCancelEdit();
                  }}
                  className="flex-1 bg-black/40 border border-primary/50 rounded-xl px-4 py-2 text-sm outline-none text-on-surface font-bold shadow-inner"
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  <button onClick={(e) => onSaveChapterTitle(chapter.id, e)} className="w-9 h-9 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 rounded-full transition-colors">
                    <CheckIcon size={18} />
                  </button>
                  <button onClick={onCancelEdit} className="w-9 h-9 flex items-center justify-center text-error hover:bg-error/10 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-on-surface-variant/20 hover:text-primary cursor-grab active:cursor-grabbing transition-colors" onClick={e => e.stopPropagation()}>
                    <GripVertical size={16} />
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                    <Folder size={18} className={isExpanded ? 'text-surface' : 'text-on-surface-variant/40'} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className={`text-base font-black tracking-tight truncate ${isExpanded ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                      {chapter.title}
                    </h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30">
                      {chapterScenes.length} Fragments • {totalWords} words
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center mr-2" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={(e) => onExport(chapter.id, e)}
                      className="w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                      title="Export Chapter to Editor"
                    >
                      <Sparkles size={18} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAddScene(chapter.id); }}
                      className="w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                      title="Add Scene to Chapter"
                    >
                      <Plus size={18} />
                    </button>
                    <button 
                      onClick={(e) => onStartEdit(chapter, e)}
                      className="w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                      title="Rename Chapter"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => onDelete(chapter.id, e)}
                      className="w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                      title="Delete Chapter"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${isExpanded ? 'rotate-180 bg-primary/10 text-primary' : 'text-on-surface-variant/40'}`}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <Droppable droppableId={chapter.id} type="scene">
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={`p-4 min-h-[50px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                    >
                      {chapterScenes.map((scene, idx) => (
                        <SceneItem 
                          key={scene.id}
                          scene={scene}
                          index={idx}
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
                          onStartEditTitle={onStartEditSceneTitle}
                          onStartEditMetadata={onStartEditSceneMetadata}
                          onSaveTitle={onSaveSceneTitle}
                          onSaveMetadata={onSaveSceneMetadata}
                          onCancelEdit={onCancelEdit}
                          onDelete={onDeleteScene}
                          setEditTitle={setEditTitle}
                          setEditDay={setEditDay}
                          setEditDate={setEditDate}
                          setEditTime={setEditTime}
                          setEditDraftStage={setEditDraftStage}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Draggable>
  );
};
