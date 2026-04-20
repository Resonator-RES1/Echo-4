import { useEffect } from 'react';
import * as db from '../services/dbService';
import { useProjectStore } from '../stores/useProjectStore';
import { useLoreStore } from '../stores/useLoreStore';
import { useManuscriptStore } from '../stores/useManuscriptStore';
import { usePromptStore } from '../stores/usePromptStore';
import { Scene } from '../types';
import { reconcileManuscriptState } from '../utils/reconciliation';

export function useAppDataLoader() {
  const loadInitialData = useProjectStore(state => state.loadInitialData);
  const loadLoreData = useLoreStore(state => state.loadData);
  const loadPromptFragments = usePromptStore(state => state.loadFragments);
  
  const setScenes = useManuscriptStore(state => state.setScenes);
  const setChapters = useManuscriptStore(state => state.setChapters);
  const setCurrentSceneId = useManuscriptStore(state => state.setCurrentSceneId);
  const setDraft = useManuscriptStore(state => state.setDraft);
  const setVersionHistory = useManuscriptStore(state => state.setVersionHistory);
  const setIsAppLoaded = useManuscriptStore(state => state.setIsAppLoaded);
  const setWritingGoal = useManuscriptStore(state => state.setWritingGoal);

  useEffect(() => {
    // Load writing goal from localStorage
    const savedGoal = localStorage.getItem('echo-writing-goal');
    if (savedGoal) {
      try {
        setWritingGoal(JSON.parse(savedGoal));
      } catch (e) {
        console.error('Failed to parse writing goal', e);
      }
    }

    const loadData = async () => {
      try {
        await loadInitialData();
        await loadLoreData();
        await loadPromptFragments();

        const [loadedEchoes, loadedScenes, loadedChapters, lastSceneId, lastDraft] = await Promise.all([
          db.getEchoes(),
          db.getScenesMetadata(),
          db.getChapters(),
          db.getSetting('current_scene_id'),
          db.getSetting('current_draft')
        ]);
        
        const firstSceneId = loadedScenes.length > 0 ? loadedScenes[0].id : null;
        let needsEchoUpdate = false;
        const migratedEchoes = loadedEchoes.map(e => {
            if (!e.sceneId && firstSceneId) {
                needsEchoUpdate = true;
                return { ...e, sceneId: firstSceneId };
            }
            return e;
        });
        
        if (needsEchoUpdate) {
            await db.setAllEchoes(migratedEchoes);
        }
        setVersionHistory(migratedEchoes);
        
        if (loadedChapters.length > 0) {
            setChapters(loadedChapters);
        }

        if (loadedScenes.length > 0) {
            setScenes(loadedScenes);
            
            // Restore last active scene or default to the first one
            const sceneToRestore = lastSceneId && loadedScenes.find(s => s.id === lastSceneId) 
              ? loadedScenes.find(s => s.id === lastSceneId) 
              : loadedScenes[0];
            
            if (sceneToRestore) {
              setCurrentSceneId(sceneToRestore.id);
              // If we have a saved draft for this scene, use it; otherwise use the scene's content
              if (lastSceneId === sceneToRestore.id && lastDraft !== undefined) {
                setDraft(lastDraft);
              } else {
                try {
                  const fullScene = await db.getScene(sceneToRestore.id);
                  setDraft(fullScene?.content || '');
                } catch (err) {
                  console.error("Failed to load active scene content", err);
                  setDraft('');
                }
              }
            }
        } else {
            // Create a default scene
            const defaultScene: Scene = {
                id: Date.now().toString(),
                title: 'Chapter 1',
                content: '',
                order: 0,
                lastModified: new Date().toISOString()
            };
            setScenes([defaultScene]);
            setCurrentSceneId(defaultScene.id);
            await db.putScene(defaultScene);
        }
        await reconcileManuscriptState();
      } catch (e) {
        console.error("Failed to load data from DB", e);
      } finally {
        setIsAppLoaded(true);
      }
    };
    
    loadData();

    const handleSyncComplete = () => {
      loadData();
    };

    window.addEventListener('sync-complete', handleSyncComplete);
    return () => window.removeEventListener('sync-complete', handleSyncComplete);
  }, [
    loadInitialData, 
    loadLoreData, 
    loadPromptFragments,
    setScenes, 
    setChapters, 
    setCurrentSceneId, 
    setDraft, 
    setVersionHistory, 
    setIsAppLoaded, 
    setWritingGoal
  ]);
}
