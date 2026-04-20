import { useState, useCallback } from 'react';
import { Scene, SceneMetadata, Chapter, StoryDate } from '../types';
import * as db from '../services/dbService';
import { DropResult } from '@hello-pangea/dnd';
import { calculateAbsoluteDay } from '../utils/calendar';
import { useManuscriptStore } from '../stores/useManuscriptStore';
import { useProjectStore } from '../stores/useProjectStore';
import { useLoreStore } from '../stores/useLoreStore';

interface UseSceneManagerLogicProps {
  showToast: (message: string) => void;
}

export const useSceneManagerLogic = ({
  showToast
}: UseSceneManagerLogicProps) => {
  const {
    scenes,
    chapters,
    currentSceneId,
    draft,
    setScenes,
    setChapters,
    setCurrentSceneId,
    setDraft
  } = useManuscriptStore();

  const { projectName, setProjectName } = useProjectStore();
  const calendarConfig = useLoreStore(state => state.calendarConfig);

  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingMetadataId, setEditingMetadataId] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editProjectName, setEditProjectName] = useState(projectName);
  const [editDay, setEditDay] = useState<number>(0);
  const [editDate, setEditDate] = useState<StoryDate | undefined>(undefined);
  const [editTime, setEditTime] = useState('');
  const [editDraftStage, setEditDraftStage] = useState<SceneMetadata['draftStage']>('prose');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const toggleChapter = useCallback((chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  }, []);

  const handleAddChapter = async () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: `Chapter ${chapters.length + 1}`,
      order: chapters.length,
      sceneIds: [],
    };
    setChapters([...chapters, newChapter]);
    await db.putChapter(newChapter);
    showToast('New chapter added');
    
    setExpandedChapters(prev => new Set(prev).add(newChapter.id));
  };

  const handleAddScene = async (chapterId?: string) => {
    const newScene: Scene = {
      id: Date.now().toString(),
      chapterId: chapterId,
      title: `Scene ${scenes.length + 1}`,
      content: '',
      order: scenes.filter(s => s.chapterId === chapterId).length,
      lastModified: new Date().toISOString(),
      wordCount: 0,
      absoluteDay: 0
    };
    
    const { content, ...metadata } = newScene;
    setScenes([...scenes, metadata]);
    setCurrentSceneId(newScene.id);
    setDraft('');
    await db.putScene(newScene);
    showToast('New scene added');
    
    if (chapterId) {
      setExpandedChapters(prev => new Set(prev).add(chapterId));
    }
  };

  const handleDeleteScene = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (scenes.length <= 1) {
      showToast('Cannot delete the last scene');
      return;
    }
    
    const newScenes = scenes.filter(s => s.id !== id);
    setScenes(newScenes);
    await db.deleteScene(id);
    
    if (currentSceneId === id) {
      const nextSceneId = newScenes[0].id;
      setCurrentSceneId(nextSceneId);
      const nextScene = await db.getScene(nextSceneId);
      setDraft(nextScene?.content || '');
    }
    showToast('Scene deleted');
  };

  const handleDeleteChapter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const unassignedCount = scenes.filter(s => !s.chapterId).length;
    let orderOffset = 0;

    const updatedScenes = scenes.map(s => {
      if (s.chapterId === id) {
        const updatedScene = { ...s, chapterId: undefined, order: unassignedCount + orderOffset };
        orderOffset++;
        return updatedScene;
      }
      return s;
    });
    
    setScenes(updatedScenes);
    
    const movedScenesMetadata = updatedScenes.filter(s => s.chapterId === undefined && scenes.find(os => os.id === s.id)?.chapterId === id);
    if (movedScenesMetadata.length > 0) {
        for (const meta of movedScenesMetadata) {
          const full = await db.getScene(meta.id);
          if (full) {
            await db.putScene({ ...full, ...meta });
          }
        }
    }

    const newChapters = chapters.filter(c => c.id !== id);
    setChapters(newChapters);
    await db.deleteChapter(id);
    showToast('Chapter deleted');
  };

  const handleSelectScene = async (id: string) => {
    if (id === currentSceneId) return;
    
    if (currentSceneId) {
      const currentSceneMeta = scenes.find(s => s.id === currentSceneId);
      if (currentSceneMeta && draft !== undefined) {
        const full = await db.getScene(currentSceneId);
        if (full) {
          const wordCount = draft.trim().split(/\s+/).length;
          const updatedScene = { ...full, content: draft, lastModified: new Date().toISOString(), wordCount };
          await db.putScene(updatedScene);
          const { content, ...metadata } = updatedScene;
          setScenes(prev => (Array.isArray(prev) ? prev.map(s => s.id === currentSceneId ? metadata : s) : prev));
        }
      }
    }
    
    const scene = await db.getScene(id);
    if (scene) {
      setCurrentSceneId(id);
      setDraft(scene.content);
    }
  };

  const handleExportChapterToEditor = async (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const chapterScenesMeta = scenes
      .filter(s => s.chapterId === chapterId)
      .sort((a, b) => a.order - b.order);

    if (chapterScenesMeta.length === 0) {
      showToast('Chapter has no scenes to export');
      return;
    }

    const fullScenes = await Promise.all(chapterScenesMeta.map(m => db.getScene(m.id)));
    const compiledContent = fullScenes
      .map(s => {
        if (!s) return '';
        return s.id === currentSceneId && draft !== undefined ? draft : s.content;
      })
      .filter(content => content && content.trim().length > 0)
      .join('\n\n***\n\n');

    if (!compiledContent.trim()) {
      showToast('Chapter scenes are empty');
      return;
    }

    const newScene: Scene = {
      id: Date.now().toString(),
      chapterId: undefined,
      title: `Compiled: ${chapter.title}`,
      content: compiledContent,
      order: scenes.filter(s => !s.chapterId).length,
      lastModified: new Date().toISOString(),
      wordCount: compiledContent.trim().split(/\s+/).length,
      absoluteDay: 0
    };

    const { content, ...metadata } = newScene;
    setScenes([...scenes, metadata]);
    setCurrentSceneId(newScene.id);
    setDraft(compiledContent);
    await db.putScene(newScene);

    showToast(`Exported ${chapter.title} to new scene`);
  };

  const startEditingScene = useCallback((scene: SceneMetadata, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSceneId(scene.id);
    setEditingMetadataId(null);
    setEditingChapterId(null);
    setEditTitle(scene.title);
  }, []);

  const startEditingMetadata = useCallback((scene: SceneMetadata, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMetadataId(scene.id);
    setEditingSceneId(null);
    setEditingChapterId(null);
    setEditDay(scene.storyDay || 0);
    setEditDate(scene.storyDate || { year: 0, month: 0, day: 1 });
    setEditTime(scene.storyTime || '');
    setEditDraftStage(scene.draftStage || 'prose');
  }, []);

  const handleSaveMetadata = async (sceneId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const sceneMeta = scenes.find(s => s.id === sceneId);
    if (sceneMeta) {
      const absoluteDay = calculateAbsoluteDay(editDate, calendarConfig);
      const updatedMeta = { 
        ...sceneMeta, 
        storyDay: editDay, 
        storyDate: editDate,
        storyTime: editTime,
        draftStage: editDraftStage,
        absoluteDay
      };
      setScenes(prev => (Array.isArray(prev) ? prev.map(s => s.id === sceneId ? updatedMeta : s) : prev));
      
      const full = await db.getScene(sceneId);
      if (full) {
        await db.putScene({ ...full, ...updatedMeta });
      }
      setEditingMetadataId(null);
      showToast('Scene metadata updated');
    }
  };

  const startEditingChapter = useCallback((chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChapterId(chapter.id);
    setEditingSceneId(null);
    setEditTitle(chapter.title);
  }, []);

  const saveEditScene = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editTitle.trim()) {
      cancelEdit();
      return;
    }
    
    const updatedScenes = scenes.map(s => 
      s.id === id ? { ...s, title: editTitle.trim(), lastModified: new Date().toISOString() } : s
    );
    setScenes(updatedScenes);
    setEditingSceneId(null);
    
    const full = await db.getScene(id);
    if (full) {
      await db.putScene({ ...full, title: editTitle.trim(), lastModified: new Date().toISOString() });
    }
  };

  const saveEditChapter = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editTitle.trim()) {
      cancelEdit();
      return;
    }
    
    const updatedChapters = chapters.map(c => 
      c.id === id ? { ...c, title: editTitle.trim() } : c
    );
    setChapters(updatedChapters);
    setEditingChapterId(null);
    
    const updatedChapter = updatedChapters.find(c => c.id === id);
    if (updatedChapter) {
      await db.putChapter(updatedChapter);
    }
  };

  const startEditingProject = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingProjectName(true);
    setEditProjectName(projectName);
  }, [projectName]);

  const saveProjectName = async () => {
    if (editProjectName.trim() && editProjectName !== projectName) {
      await setProjectName(editProjectName.trim());
      showToast('Project renamed');
    }
    setIsEditingProjectName(false);
  };

  const cancelEdit = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSceneId(null);
    setEditingChapterId(null);
    setEditingMetadataId(null);
    setIsEditingProjectName(false);
    setEditTitle('');
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'chapter') {
      const newChapters = Array.from(chapters).sort((a, b) => a.order - b.order);
      const [reorderedItem] = newChapters.splice(source.index, 1);
      newChapters.splice(destination.index, 0, reorderedItem);
      const updatedChapters = newChapters.map((chapter, index) => ({ ...chapter, order: index }));
      setChapters(updatedChapters);
      await db.bulkPutChapters(updatedChapters);
      return;
    }

    if (type === 'scene') {
      const sourceChapterId = source.droppableId === 'unassigned' ? undefined : source.droppableId;
      const destChapterId = destination.droppableId === 'unassigned' ? undefined : destination.droppableId;

      const sourceScenes = scenes.filter(s => s.chapterId === sourceChapterId).sort((a, b) => a.order - b.order);
      const destScenes = sourceChapterId === destChapterId ? sourceScenes : scenes.filter(s => s.chapterId === destChapterId).sort((a, b) => a.order - b.order);

      const [movedScene] = sourceScenes.splice(source.index, 1);
      movedScene.chapterId = destChapterId;
      destScenes.splice(destination.index, 0, movedScene);

      const updatedSourceScenes = sourceScenes.map((s, idx) => ({ ...s, order: idx }));
      const updatedDestScenes = destScenes.map((s, idx) => ({ ...s, order: idx }));

      let newScenes = [...scenes];
      newScenes = newScenes.filter(s => s.chapterId !== sourceChapterId && s.chapterId !== destChapterId);
      if (sourceChapterId === destChapterId) {
          newScenes = [...newScenes, ...updatedDestScenes];
      } else {
          newScenes = [...newScenes, ...updatedSourceScenes, ...updatedDestScenes];
      }

      setScenes(newScenes);
      
      const movedMetas = sourceChapterId === destChapterId ? updatedDestScenes : [...updatedSourceScenes, ...updatedDestScenes];
      for (const meta of movedMetas) {
        const full = await db.getScene(meta.id);
        if (full) {
          await db.putScene({ ...full, ...meta });
        }
      }
    }
  };

  return {
    state: {
      editingSceneId,
      editingMetadataId,
      editingChapterId,
      isEditingProjectName,
      editTitle,
      editProjectName,
      editDay,
      editDate,
      editTime,
      editDraftStage,
      expandedChapters
    },
    actions: {
      setEditTitle,
      setEditProjectName,
      setEditDay,
      setEditDate,
      setEditTime,
      setEditDraftStage,
      toggleChapter,
      handleAddChapter,
      handleAddScene,
      handleDeleteScene,
      handleDeleteChapter,
      handleSelectScene,
      handleExportChapterToEditor,
      startEditingScene,
      startEditingMetadata,
      handleSaveMetadata,
      startEditingChapter,
      saveEditScene,
      saveEditChapter,
      startEditingProject,
      saveProjectName,
      cancelEdit,
      onDragEnd
    }
  };
};
