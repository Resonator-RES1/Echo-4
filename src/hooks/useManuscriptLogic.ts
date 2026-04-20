import { useMemo } from 'react';
import * as db from '../services/dbService';
import { Scene, SceneMetadata, WritingGoal } from '../types';

export const useManuscriptLogic = (
  scenes: SceneMetadata[],
  setScenes: (scenes: SceneMetadata[]) => void,
  goal: WritingGoal,
  setGoal: (goal: WritingGoal) => void,
  showToast: (message: string) => void
) => {
  const totalWordCount = useMemo(() => {
    return scenes.reduce((acc, scene) => {
      return acc + (scene.wordCount || 0);
    }, 0);
  }, [scenes]);

  const progress = Math.min(100, Math.round((totalWordCount / goal.targetWords) * 100));

  const handleExport = async () => {
    const fullScenes = await db.getScenes();
    const fullConstruct = fullScenes
      .sort((a, b) => a.order - b.order)
      .map(s => `# ${s.title}\n\n${s.content}`)
      .join('\n\n---\n\n');
    
    const blob = new Blob([fullConstruct], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `construct-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Construct exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const parts = content.split('\n\n---\n\n');
      const newScenes: Scene[] = parts.map((part, index) => {
        const lines = part.split('\n');
        let title = `Imported Scene ${index + 1}`;
        let sceneContent = part;

        if (lines[0].startsWith('# ')) {
          title = lines[0].replace('# ', '').trim();
          sceneContent = lines.slice(1).join('\n').trim();
        }

        const wordCount = sceneContent.trim().split(/\s+/).length;

        return {
          id: `${Date.now()}-${index}`,
          title,
          content: sceneContent,
          order: scenes.length + index,
          lastModified: new Date().toISOString(),
          wordCount
        };
      });

      const updatedScenes = [...scenes, ...newScenes.map(({ content, ...rest }) => rest)];
      setScenes(updatedScenes);
      await db.db.scenes.bulkPut(newScenes);
      showToast(`${newScenes.length} scenes imported`);
    };
    reader.readAsText(file);
  };

  const handleSaveGoal = (newGoal: WritingGoal) => {
    setGoal(newGoal);
    localStorage.setItem('echo-writing-goal', JSON.stringify(newGoal));
    showToast('Writing goals updated');
  };

  return {
    totalWordCount,
    progress,
    handleExport,
    handleImport,
    handleSaveGoal
  };
};
