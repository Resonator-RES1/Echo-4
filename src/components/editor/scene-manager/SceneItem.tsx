import React, { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, FileText, Clock, Settings, Edit2, Trash2, CheckCircle2, Check as CheckIcon, X } from 'lucide-react';
import { SceneMetadata, RefinedVersion, StoryDate, CalendarConfig } from '../../../types';
import { VibeStrip } from './VibeStrip';
import { formatStoryDate, calculateAbsoluteDay, absoluteDayToDate } from '../../../utils/calendar';
import { StoryDateSelector } from '../../forms/StoryDateSelector';

interface SceneItemProps {
  scene: SceneMetadata;
  index: number;
  isSelected: boolean;
  variant: 'full' | 'mini';
  editingSceneId: string | null;
  editingMetadataId: string | null;
  editTitle: string;
  editDay: number;
  editDate: StoryDate | undefined;
  editTime: string;
  calendarConfig: CalendarConfig;
  latestVersion?: RefinedVersion;
  hasAcceptedVersion: boolean;
  onSelect: (id: string) => void;
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
  editDraftStage: SceneMetadata['draftStage'];
  setEditDraftStage: (stage: SceneMetadata['draftStage']) => void;
}

export const SceneItem: React.FC<SceneItemProps> = ({
  scene,
  index,
  isSelected,
  variant,
  editingSceneId,
  editingMetadataId,
  editTitle,
  editDay,
  editDate,
  editTime,
  editDraftStage,
  calendarConfig,
  latestVersion,
  hasAcceptedVersion,
  onSelect,
  onStartEditTitle,
  onStartEditMetadata,
  onSaveTitle,
  onSaveMetadata,
  onCancelEdit,
  onDelete,
  setEditTitle,
  setEditDate,
  setEditTime,
  setEditDraftStage
}) => {
  return (
    <Draggable key={scene.id} draggableId={scene.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onSelect(scene.id)}
          className={`group flex items-center justify-between rounded-lg cursor-pointer transition-all mb-2 overflow-hidden border ${
            isSelected 
              ? 'bg-primary/15 border-primary/30 text-primary shadow-lg shadow-primary/5' 
              : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-on-surface-variant hover:text-on-surface'
          } ${snapshot.isDragging ? 'shadow-2xl bg-surface-container-highest/90 backdrop-blur-xl border-primary/50 scale-[1.02] z-50' : ''}`}
          style={{ contentVisibility: 'auto', containIntrinsicSize: '0 56px', ...provided.draggableProps.style }}
        >
          <VibeStrip version={latestVersion} />
          <div className={`flex-1 flex items-center justify-between ${variant === 'mini' ? 'p-2' : 'p-3'}`}>
            {editingSceneId === scene.id ? (
              <div className="flex items-center w-full gap-2" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onSaveTitle(scene.id);
                    if (e.key === 'Escape') onCancelEdit();
                  }}
                  className="flex-1 bg-black/40 border border-primary/50 rounded-xl px-3 py-1.5 text-sm outline-none text-on-surface font-bold"
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  <button onClick={(e) => onSaveTitle(scene.id, e)} className="w-8 h-8 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 rounded-full transition-colors">
                    <CheckIcon size={16} />
                  </button>
                  <button onClick={onCancelEdit} className="w-8 h-8 flex items-center justify-center text-error hover:bg-error/10 rounded-full transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : editingMetadataId === scene.id ? (
              <div className="flex flex-col w-full gap-4 p-4 bg-black/20 rounded-lg border border-white/5" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col lg:flex-row gap-4">
                  {calendarConfig.useCustomCalendar ? (
                    <div className="flex-1">
                      <StoryDateSelector 
                        value={editDate}
                        onChange={(newDate) => {
                          setEditDate(newDate);
                          // Sync storyDay automatically
                          const absDay = calculateAbsoluteDay(newDate, calendarConfig);
                          setEditDay(absDay);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">Story Day</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={editDay === 0 && editDay !== undefined ? '0' : (editDay ?? '')}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '' || /^\d*$/.test(val)) {
                            const num = val === '' ? 0 : parseInt(val);
                            setEditDay(num);
                            // Sync storyDate automatically
                            const newDate = absoluteDayToDate(num, calendarConfig);
                            setEditDate(newDate);
                          }
                        }}
                        placeholder="Day 0"
                        className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface font-bold focus:border-primary/50 transition-colors"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 lg:flex gap-4">
                    <div className="flex flex-col gap-1 w-full lg:w-24">
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">Time</span>
                      <input
                        type="text"
                        value={editTime}
                        onChange={e => setEditTime(e.target.value)}
                        placeholder="e.g. Morning"
                        className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface font-bold focus:border-primary/50 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1 w-full lg:w-28">
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">Stage</span>
                      <select
                        value={editDraftStage || 'prose'}
                        onChange={e => setEditDraftStage(e.target.value as any)}
                        className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs outline-none text-on-surface font-bold focus:border-primary/50 transition-colors appearance-none"
                      >
                        <option value="outline">Outline</option>
                        <option value="draft-zero">Draft Zero</option>
                        <option value="script">Script</option>
                        <option value="prose">Prose</option>
                        <option value="polished">Polished</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={onCancelEdit}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => onSaveMetadata(scene.id, e)}
                    className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className="p-3 text-on-surface-variant/40 hover:text-primary cursor-grab active:cursor-grabbing transition-colors">
                    <GripVertical size={18} />
                  </div>
                  {variant === 'full' && (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <FileText size={18} className={isSelected ? 'text-primary' : 'text-on-surface-variant/40'} />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm truncate select-none font-bold tracking-tight ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{scene.title}</span>
                      {scene.draftStage && scene.draftStage !== 'prose' && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-white/5 text-on-surface-variant/60 border border-white/10">
                          {scene.draftStage.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                    {variant === 'full' && (scene.storyDate || scene.storyDay !== undefined || scene.storyTime) && (
                      <div className="flex items-center gap-2 text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-0.5">
                        <Clock size={10} className="text-primary/60" />
                        <span>
                          {scene.storyDate ? formatStoryDate(scene.storyDate, calendarConfig) : (scene.storyDay !== undefined ? `Day ${scene.storyDay}` : '')}
                          {(scene.storyDate || scene.storyDay !== undefined) && scene.storyTime ? ' • ' : ''}
                          {scene.storyTime || ''}
                        </span>
                      </div>
                    )}
                  </div>
                  {(scene.hasEcho || hasAcceptedVersion) && (
                    <div className="flex-shrink-0 flex items-center ml-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 size={12} className="text-emerald-400" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30 mr-3">{scene.wordCount || 0}w</span>
                  <div className="flex items-center">
                    {variant === 'full' && (
                      <button 
                        onClick={(e) => onStartEditMetadata(scene, e)}
                        className="w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        title="Edit Metadata"
                      >
                        <Settings size={16} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => onStartEditTitle(scene, e)}
                      className="w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                      title="Rename Scene"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => onDelete(scene.id, e)}
                      className="w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                      title="Delete Scene"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
