import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { 
  RefinedVersion, 
  LoreEntry, 
  VoiceProfile, 
  AuthorVoice, 
  Scene, 
  WorkspaceTab, 
  Chapter, 
  DisplayPrefs, 
  EditorProps, 
  ContinuityIssue, 
  ScannerInstances 
} from '../types';
import { createScanner } from '../utils/contextScanner';
import { useLoreStore } from '../stores/useLoreStore';
import { useProjectStore } from '../stores/useProjectStore';
import { useManuscriptStore } from '../stores/useManuscriptStore';
import { useUIStore } from '../stores/useUIStore';
import { useEditorUIStore } from '../stores/useEditorUIStore';
import { useDisplayStore } from '../stores/useDisplayStore';
import { useSpectralStore } from '../stores/useSpectralStore';
import { useEditorLogic } from './useEditorLogic';
import { useEditorActions } from './useEditorActions';
import * as db from '../services/dbService';

export const useEditorState = (showToast: (message: string) => void) => {
  const { 
    draft, 
    setDraft, 
    scenes, 
    chapters, 
    currentSceneId, 
    setScenes, 
    versionHistory, 
    addVersion: onAddVersion, 
    acceptVersion: onAcceptVersion, 
    handleVersionHistoryChange,
    setCurrentSceneId,
    setChapters,
    clearVersionHistory: onClearVersionHistory,
    deleteVersion: onDeleteVersion,
    updateVersion: onUpdateVersion
  } = useManuscriptStore();

  const { isRefining, setIsRefining } = useUIStore();

  const { 
    isZenMode, 
    setIsZenMode, 
    isUIVisible, 
    setIsUIVisible, 
    activeTab, 
    setActiveTab, 
    activeHUD, 
    setActiveHUD 
  } = useEditorUIStore();

  const projectName = useProjectStore(state => state.projectName);
  const setProjectName = useProjectStore(state => state.setProjectName);
  
  const workbenchDraft = useUIStore(state => state.workbenchDraft);
  const setWorkbenchDraft = useUIStore(state => state.setWorkbenchDraft);

  const loreEntries = useLoreStore(state => state.loreEntries);
  const voiceProfiles = useLoreStore(state => state.voiceProfiles);
  const authorVoices = useLoreStore(state => state.authorVoices);
  const addLoreEntry = useLoreStore(state => state.addLoreEntry);
  const deleteLoreEntry = useLoreStore(state => state.deleteLoreEntry);
  const addVoiceProfile = useLoreStore(state => state.addVoiceProfile);
  const deleteVoiceProfile = useLoreStore(state => state.deleteVoiceProfile);
  const addAuthorVoice = useLoreStore(state => state.addAuthorVoice);
  const deleteAuthorVoice = useLoreStore(state => state.deleteAuthorVoice);
  const voiceSuites = useLoreStore(state => state.voiceSuites);
  const voiceDNAs = useLoreStore(state => state.voiceDNAs);
  const setActiveAuthorContext = useLoreStore(state => state.setActiveAuthorContext);
  const calendarConfig = useLoreStore(state => state.calendarConfig);

  const [selection, setSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  const [surgicalSelection, setSurgicalSelection] = useState<{ text: string; start: number; end: number } | null>(null);
  const [activeReviewVersion, setActiveReviewVersion] = useState<RefinedVersion | null>(null);
  const [editorMode, setEditorMode] = useState<'polishing' | 'drafting'>('polishing');
  const [showComparison, setShowComparison] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showLoreRevert, setShowLoreRevert] = useState(false);
  const [continuityIssues, setContinuityIssues] = useState<ContinuityIssue[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState<ScannerInstances | null>(null);
  const { isSpectralHUDEnabled, setSpectra, setSuggestions } = useSpectralStore();

  const { displayPrefs, setDisplayPrefs } = useDisplayStore();

  const editorRef = useRef<any>(null);

  const {
    draftState,
    dispatchDraft,
    saveStatus,
    currentVersionIndex,
    setCurrentVersionIndex,
    handleNewVersion,
    handleAcceptVersion
  } = useEditorLogic({
    draft,
    setDraft,
    currentSceneId,
    setScenes,
    versionHistory,
    onAddVersion,
    onAcceptVersion,
    setActiveTab
  });

  const draftRef = useRef(draftState.present);
  useEffect(() => {
    draftRef.current = draftState.present;
  }, [draftState.present]);

  const {
    onAddLoreEntry: onAddLoreEntryAction,
    onAddVoiceProfile: onAddVoiceProfileAction,
    onAddAuthorVoice: onAddAuthorVoiceAction,
    onDeleteLoreEntry: onDeleteLoreEntryAction,
    onDeleteVoiceProfile: onDeleteVoiceProfileAction,
    onDeleteAuthorVoice: onDeleteAuthorVoiceAction,
    onDeleteVoiceSuite: onDeleteVoiceSuiteAction,
    handleContinuityFix,
    handleCommitPart,
  } = useEditorActions(
    showToast,
    versionHistory,
    currentVersionIndex,
    handleVersionHistoryChange,
    dispatchDraft,
    draftRef,
    editorRef
  );

  const [prevZenMode, setPrevZenMode] = useState(isZenMode);

  if (isZenMode !== prevZenMode) {
    setPrevZenMode(isZenMode);
    if (isZenMode) {
      setActiveTab('draft');
      setActiveHUD(null);
      setIsUIVisible(true);
    }
  }

  const currentScene = useMemo(() => 
    scenes.find(s => s.id === currentSceneId),
  [scenes, currentSceneId]);

  const currentChapter = useMemo(() => 
    chapters.find(c => c.id === currentScene?.chapterId),
  [chapters, currentScene?.chapterId]);

  useEffect(() => {
    const initScanner = async () => {
      setIsIndexing(true);
      const s = await createScanner(loreEntries, voiceProfiles, currentScene?.projectId || 'default');
      setScanner(s);
      setIsIndexing(false);
    };
    initScanner();
  }, [loreEntries, voiceProfiles, currentScene?.projectId]);

  const [debouncedDraft, setDebouncedDraft] = useState(draftState.present);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDraft(draftState.present);
    }, 800);
    return () => clearTimeout(timer);
  }, [draftState.present, setDebouncedDraft]);

  // Spectral Focus Engine: Reactive Analysis
  useEffect(() => {
    if (isSpectralHUDEnabled && debouncedDraft) {
      import('../engines/SpectralEngine').then(({ scanDraftSpectrum }) => {
        const { ranges, suggestions } = scanDraftSpectrum(debouncedDraft);
        setSpectra(ranges);
        setSuggestions(suggestions);
      });
    } else if (!isSpectralHUDEnabled) {
      setSpectra([]);
      setSuggestions([]);
    }
  }, [debouncedDraft, isSpectralHUDEnabled, setSpectra, setSuggestions]);

  const handleShowComparison = useCallback(() => {
    setShowComparison(true);
    setActiveTab('report');
  }, [setActiveTab]);

  useEffect(() => {
    const handleViewReport = (e: Event) => {
        const customEvent = e as CustomEvent<RefinedVersion>;
        const version = customEvent.detail;
        if (version) {
            const index = versionHistory.findIndex(v => v.id === version.id);
            if (index !== -1) {
                setCurrentVersionIndex(index);
                setActiveTab('report');
            }
        }
    };
    window.addEventListener('view-report', handleViewReport);
    return () => window.removeEventListener('view-report', handleViewReport);
  }, [versionHistory, setCurrentVersionIndex, setActiveTab]);

  const currentVersion: RefinedVersion = useMemo(() => 
    versionHistory[currentVersionIndex] || { id: 'initial', text: '', timestamp: new Date().toISOString(), conflicts: [] },
  [versionHistory, currentVersionIndex]);

  const wordCount = useMemo(() => {
      const text = (draftState.present || '').trim();
      if (!text) return 0;
      const matches = text.match(/\S+/g); 
      return matches ? matches.length : 0;
  }, [draftState.present]);

  const handleSelectArchiveVersion = useCallback((index: number) => {
      setCurrentVersionIndex(index);
  }, [setCurrentVersionIndex]);

  const handleActivateLore = useCallback((id: string) => {
    const entry = loreEntries.find(e => e.id === id);
    if (entry) {
        onAddLoreEntryAction({ ...entry, isActive: true });
    }
  }, [loreEntries, onAddLoreEntryAction]);

  const handleActivateVoice = useCallback((id: string) => {
    const profile = voiceProfiles.find(v => v.id === id);
    if (profile) {
        onAddVoiceProfileAction({ ...profile, isActive: true });
    }
  }, [voiceProfiles, onAddVoiceProfileAction]);

  const handleProceedToRefinement = useCallback(() => {
      setActiveTab('refine');
      showToast('Transitioning to AI Refinement suite');
  }, [setActiveTab, showToast]);

  const handleRevertLore = useCallback(() => {
      if (!currentVersion.loreCorrections || currentVersion.loreCorrections.length === 0) {
          showToast("No lore corrections detected in this version.");
          return;
      }
      setShowLoreRevert(true);
  }, [currentVersion, showToast]);

  const handleRevertSpecificLore = useCallback((correction: any) => {
      const newHistory = [...versionHistory];
      const version = { ...newHistory[currentVersionIndex] };
      const escapedRefined = correction.refined.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
      const regex = new RegExp(escapedRefined, 'g');
      version.text = version.text.replace(regex, correction.original);
      version.loreCorrections = version.loreCorrections?.filter((c: any) => c !== correction);
      newHistory[currentVersionIndex] = version;
      handleVersionHistoryChange(newHistory, currentSceneId);
      showToast(`Reverted "${correction.refined}" to "${correction.original}"`);
      if (version.loreCorrections?.length === 0) {
          setShowLoreRevert(false);
      }
  }, [versionHistory, currentVersionIndex, handleVersionHistoryChange, currentSceneId, showToast]);

  const handleRevertSelfCorrection = useCallback((correction: any) => {
      if (!correction.originalSnippet || !correction.correctedSnippet) return;
      const newHistory = [...versionHistory];
      const version = { ...newHistory[currentVersionIndex] };
      const escapedCorrected = correction.correctedSnippet.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
      const regex = new RegExp(escapedCorrected, 'g');
      const newText = version.text.replace(regex, correction.originalSnippet);
      if (newText === version.text) {
          showToast("Could not find the snippet to revert in the current text.");
          return;
      }
      version.text = newText;
      version.selfCorrections = version.selfCorrections?.filter((c: any) => c !== correction);
      newHistory[currentVersionIndex] = version;
      handleVersionHistoryChange(newHistory, currentSceneId);
      showToast(`Reverted self-correction: ${correction.issueDetected.substring(0, 30)}...`);
  }, [versionHistory, currentVersionIndex, handleVersionHistoryChange, currentSceneId, showToast]);

  const handleAcceptChanges = useCallback(() => {
      setEditorMode('drafting');
      showToast("Changes accepted and saved to draft.");
  }, [showToast]);

  const handleViewLore = useCallback((id: string) => {
      setActiveTab('context');
  }, [setActiveTab]);

  const handleIssueClick = useCallback((issue: ContinuityIssue) => {
      setActiveTab('draft');
      showToast(`Focusing on: ${issue.message}`);
  }, [setActiveTab, showToast]);

  const handleRevisionClick = useCallback((snippet: any) => {
      setActiveTab('archive');
      showToast('Viewing revision snippet');
  }, [setActiveTab, showToast]);

  const goal = useMemo(() => {
    const saved = localStorage.getItem('echo-writing-goal');
    return saved ? JSON.parse(saved) : { targetWords: 50000 };
  }, []);

  const progress = Math.min(100, Math.round((wordCount / (goal.dailyTarget || 2000)) * 100));

  const progressIndex = useMemo(() => {
    const stages = ['draft', 'workbench', 'context', 'refine', 'report', 'archive'];
    return stages.indexOf(activeTab);
  }, [activeTab]);

  const handleGutterClick = useCallback((e: React.MouseEvent) => {
    if (!isZenMode) return;
    if (e.target === e.currentTarget) {
      setIsUIVisible(!isUIVisible);
    }
  }, [isZenMode, isUIVisible, setIsUIVisible]);

  return useMemo(() => ({
    // State
    isZenMode, setIsZenMode,
    isUIVisible, setIsUIVisible,
    activeTab, setActiveTab,
    activeHUD, setActiveHUD,
    projectName, setProjectName,
    workbenchDraft, setWorkbenchDraft,
    loreEntries, voiceProfiles, authorVoices,
    voiceSuites, voiceDNAs,
    calendarConfig,
    selection, setSelection,
    surgicalSelection, setSurgicalSelection,
    activeReviewVersion, setActiveReviewVersion,
    editorMode, setEditorMode,
    showComparison, setShowComparison,
    showConflicts, setShowConflicts,
    showLoreRevert, setShowLoreRevert,
    continuityIssues, setContinuityIssues,
    isIndexing, isScanning, setIsScanning,
    scanner,
    displayPrefs, setDisplayPrefs,
    editorRef,
    draftState, dispatchDraft,
    saveStatus,
    currentVersionIndex, setCurrentVersionIndex,
    currentScene, currentChapter, currentVersion,
    wordCount, goal, progress,
    debouncedDraft,
    isRefining, setIsRefining,
    
    // Handlers
    onRefreshManuscript: () => {
      window.dispatchEvent(new CustomEvent('sync-complete'));
    },
    onSelectVersion: setCurrentVersionIndex,
    handleShowComparison,
    handleSelectArchiveVersion,
    handleActivateLore,
    handleActivateVoice,
    handleProceedToRefinement,
    handleRevertLore,
    handleRevertSpecificLore,
    handleRevertSelfCorrection,
    handleAcceptChanges,
    handleViewLore,
    handleIssueClick,
    handleRevisionClick,
    handleGutterClick,
    handleNewVersion,
    handleAcceptVersion,
    
    // Actions
    onAddLoreEntry: onAddLoreEntryAction,
    onAddVoiceProfile: onAddVoiceProfileAction,
    onAddAuthorVoice: onAddAuthorVoiceAction,
    onDeleteLoreEntry: onDeleteLoreEntryAction,
    onDeleteVoiceProfile: onDeleteVoiceProfileAction,
    onDeleteAuthorVoice: onDeleteAuthorVoiceAction,
    onDeleteVoiceSuite: onDeleteVoiceSuiteAction,
    handleContinuityFix,
    handleCommitPart,
    
    // Props passthrough
    scenes, chapters, currentSceneId, setCurrentSceneId, setScenes, setChapters, setDraft, showToast, versionHistory, onVersionHistoryChange: handleVersionHistoryChange, onAddVersion, onClearHistory: onClearVersionHistory, onDeleteVersion, onUpdateVersion, onAcceptVersion
  }), [
    isZenMode, setIsZenMode, isUIVisible, setIsUIVisible, activeTab, setActiveTab, activeHUD, setActiveHUD,
    projectName, setProjectName, workbenchDraft, setWorkbenchDraft, loreEntries, voiceProfiles, authorVoices,
    voiceSuites, voiceDNAs, calendarConfig, selection, setSelection, surgicalSelection, setSurgicalSelection,
    activeReviewVersion, setActiveReviewVersion, editorMode, setEditorMode, showComparison, setShowComparison,
    showConflicts, setShowConflicts, showLoreRevert, setShowLoreRevert, continuityIssues, setContinuityIssues,
    isIndexing, isScanning, setIsScanning, scanner, displayPrefs, setDisplayPrefs, editorRef, draftState,
    dispatchDraft, saveStatus, currentVersionIndex, setCurrentVersionIndex, currentScene, currentChapter,
    currentVersion, wordCount, goal, progress, debouncedDraft, isRefining, setIsRefining, handleShowComparison,
    handleSelectArchiveVersion, handleActivateLore, handleActivateVoice, handleProceedToRefinement, handleRevertLore,
    handleRevertSpecificLore, handleRevertSelfCorrection, handleAcceptChanges, handleViewLore, handleIssueClick,
    handleRevisionClick, handleGutterClick, handleNewVersion, handleAcceptVersion, onAddLoreEntryAction, onAddVoiceProfileAction,
    onAddAuthorVoiceAction, onDeleteLoreEntryAction, onDeleteVoiceProfileAction, onDeleteAuthorVoiceAction,
    onDeleteVoiceSuiteAction, handleContinuityFix, handleCommitPart, scenes, chapters, currentSceneId,
    setCurrentSceneId, setScenes, setChapters, setDraft, showToast, versionHistory, handleVersionHistoryChange,
    onAddVersion, onClearVersionHistory, onDeleteVersion, onUpdateVersion, onAcceptVersion
  ]);
};

export type EditorState = ReturnType<typeof useEditorState>;
