import { useReducer, useRef, useEffect, useState, useCallback } from 'react';
import { draftReducer, initialDraftState } from '../components/editor/draftReducer';
import { RefinedVersion, Scene, WorkspaceTab } from '../types';
import * as db from '../services/dbService';

interface UseEditorLogicProps {
    draft: string;
    setDraft: (draft: string) => void;
    currentSceneId: string | null;
    setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
    versionHistory: RefinedVersion[];
    onAddVersion: (version: RefinedVersion) => void;
    onAcceptVersion: (version: RefinedVersion) => void;
    setActiveTab: (tab: WorkspaceTab) => void;
}

export const useEditorLogic = ({
    draft,
    setDraft,
    currentSceneId,
    setScenes,
    versionHistory,
    onAddVersion,
    onAcceptVersion,
    setActiveTab
}: UseEditorLogicProps) => {
    const [draftState, dispatchDraft] = useReducer(draftReducer, { ...initialDraftState, present: draft });
    const [prevDraft, setPrevDraft] = useState(draft);

    if (draft !== prevDraft) {
        setPrevDraft(draft);
        dispatchDraft({ type: 'EXTERNAL_UPDATE', payload: draft });
    }

    const draftRef = useRef(draftState.present);
    
    useEffect(() => {
        draftRef.current = draftState.present;
    }, [draftState.present]);

    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(0);

    const [prevPresent, setPrevPresent] = useState(draftState.present);

    if (draftState.present !== prevPresent) {
        setPrevPresent(draftState.present);
        if (draft !== draftState.present) {
            setSaveStatus('saving');
        }
    }

    const pendingSaveRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (draft === draftState.present) return;

        const saveDraft = () => {
            if (draft !== draftState.present) {
                setDraft(draftState.present);

                if (currentSceneId) {
                    setScenes(prev => {
                        const updated = prev.map(s => s.id === currentSceneId ? { ...s, content: draftState.present, lastModified: new Date().toISOString() } : s);
                        const currentScene = updated.find(s => s.id === currentSceneId);
                        if (currentScene) db.putScene(currentScene); // Single Source of Truth DB Write
                        return updated;
                    });
                }
            }
            setSaveStatus('saved');
            pendingSaveRef.current = null;
        };

        pendingSaveRef.current = saveDraft;

        const handler = setTimeout(saveDraft, 2000); // 2 second debounce
        return () => {
            clearTimeout(handler);
        };
    }, [draftState.present, setDraft, currentSceneId, draft, setScenes]);

    // Flush pending save on unmount or scene change
    useEffect(() => {
        return () => {
            if (pendingSaveRef.current) {
                pendingSaveRef.current();
            }
        };
    }, [currentSceneId]);

    useEffect(() => {
        if (saveStatus === 'saved') {
            const timer = setTimeout(() => setSaveStatus('idle'), 2000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    const handleNewVersion = useCallback((version: RefinedVersion) => {
        const versionWithId = {
            ...version,
            id: version.id || Date.now().toString(),
            timestamp: version.timestamp || new Date().toISOString()
        };
        onAddVersion(versionWithId);
        setCurrentVersionIndex(0);
        
        // If it's a full draft refinement (not surgical), switch to report tab
        if (!version.isSurgical) {
            setActiveTab('report');
        }
    }, [onAddVersion, setActiveTab]);

    const handleAcceptVersion = useCallback((version: RefinedVersion) => {
        onAcceptVersion(version);
        dispatchDraft({ type: 'EXTERNAL_UPDATE', payload: version.text });
        setActiveTab('draft');
    }, [onAcceptVersion, setActiveTab]);

    return {
        draftState,
        dispatchDraft,
        saveStatus,
        currentVersionIndex,
        setCurrentVersionIndex,
        handleNewVersion,
        handleAcceptVersion
    };
};
