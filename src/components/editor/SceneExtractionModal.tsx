import React, { useState, useEffect, useCallback } from 'react';
import { X, Clapperboard, FolderPlus, Plus, Calendar, Clock, Save, Scissors } from 'lucide-react';
import { Chapter, Scene } from '../../types';
import { getChapters, putChapter, putScene } from '../../services/dbService';

interface SceneExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onExtracted: (mode: 'copy' | 'cut') => void;
  showToast: (message: string) => void;
}

export const SceneExtractionModal: React.FC<SceneExtractionModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  onExtracted,
  showToast
}) => {
  const [title, setTitle] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [storyDay, setStoryDay] = useState<number | undefined>(undefined);
  const [storyTime, setStoryTime] = useState('');

  const loadChapters = useCallback(async () => {
    const allChapters = await getChapters();
    setChapters(allChapters);
    if (allChapters.length > 0) {
      setSelectedChapterId(allChapters[0].id);
    } else {
      setIsCreatingChapter(true);
    }
  }, []);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      loadChapters();
      // Suggest title from first few words
      const words = selectedText.trim().split(/\s+/).slice(0, 5).join(' ');
      setTitle(words ? `${words}...` : 'New Scene');
    }
  }

  const handleExtract = async (mode: 'copy' | 'cut') => {
    if (!title.trim()) {
      showToast('Please enter a scene title');
      return;
    }

    let chapterId = selectedChapterId;

    if (isCreatingChapter) {
      if (!newChapterTitle.trim()) {
        showToast('Please enter a chapter title');
        return;
      }
      const newChapter: Chapter = {
        id: crypto.randomUUID(),
        title: newChapterTitle,
        order: chapters.length,
        sceneIds: []
      };
      await putChapter(newChapter);
      chapterId = newChapter.id;
    }

    const newScene: Scene = {
      id: crypto.randomUUID(),
      title,
      content: selectedText,
      chapterId,
      order: 0, // Will be sorted by ManuscriptView
      lastModified: new Date().toISOString(),
      storyDay,
      storyTime
    };

    await putScene(newScene);
    
    // Update chapter's sceneIds
    const targetChapter = isCreatingChapter 
      ? { id: chapterId, title: newChapterTitle, order: chapters.length, sceneIds: [] } as Chapter
      : chapters.find(c => c.id === chapterId);
      
    if (targetChapter) {
      const updatedChapter = {
        ...targetChapter,
        sceneIds: [...targetChapter.sceneIds, newScene.id]
      };
      await putChapter(updatedChapter);
    }

    showToast(`Scene "${title}" extracted to ${isCreatingChapter ? newChapterTitle : 'chapter'}`);
    onExtracted(mode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface-container-low border border-white/10 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-container-high/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Surgical Scene Extraction</h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">Promote selection to structured scene</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
          
          {/* Scene Title */}
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Scene Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter scene title..."
              className="w-full bg-surface-container-highest/50 border border-white/5 rounded-lg px-6 py-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Chapter Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">Target Chapter</label>
              <button 
                onClick={() => setIsCreatingChapter(!isCreatingChapter)}
                className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
              >
                {isCreatingChapter ? <FolderPlus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {isCreatingChapter ? "Select Existing" : "Create New Chapter"}
              </button>
            </div>

            {isCreatingChapter ? (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <input 
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="New chapter title (e.g. Chapter One)"
                  className="w-full bg-primary/5 border border-primary/20 rounded-lg px-6 py-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
              </div>
            ) : (
              <select 
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full bg-surface-container-highest/50 border border-white/5 rounded-lg px-6 py-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
              >
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
                ))}
                {chapters.length === 0 && <option disabled>No chapters found</option>}
              </select>
            )}
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Story Day
              </label>
              <input 
                type="number"
                value={storyDay || ''}
                onChange={(e) => setStoryDay(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Day #"
                className="w-full bg-surface-container-highest/50 border border-white/5 rounded-lg px-6 py-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Story Time
              </label>
              <input 
                type="text"
                value={storyTime}
                onChange={(e) => setStoryTime(e.target.value)}
                placeholder="e.g. Dusk"
                className="w-full bg-surface-container-highest/50 border border-white/5 rounded-lg px-6 py-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-1">Content Preview</label>
            <div className="bg-surface-container-highest/30 rounded-lg p-4 border border-white/5 max-h-32 overflow-y-auto custom-scrollbar italic text-sm text-on-surface-variant leading-relaxed">
              {selectedText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 bg-surface-container-high/30 flex gap-4">
          <button 
            onClick={() => handleExtract('copy')}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-surface-container-highest text-on-surface rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all"
          >
            <Save className="w-4 h-4" />
            Extract (Copy)
          </button>
          <button 
            onClick={() => handleExtract('cut')}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-primary text-on-primary rounded-lg font-bold uppercase tracking-widest text-[9px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Scissors className="w-4 h-4" />
            Extract (Cut)
          </button>
        </div>
      </div>
    </div>
  );
};
