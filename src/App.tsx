/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { 
    FileText, 
    BookOpen, 
    Home,
    Mic2,
    Layout,
    Loader2,
    Fingerprint
} from 'lucide-react';
import { motion } from 'motion/react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toast } from './components/Toast';
import { WelcomeScreen } from './components/panels/WelcomeScreen';
import { SettingsScreen } from './components/panels/SettingsScreen';
import Editor from './components/panels/EditorView';
import SuiteBuilderView from './components/panels/SuiteBuilderView';
import { LoreScreen } from './components/panels/LoreView';
import { CharacterVoicesScreen } from './components/panels/CharacterVoicesView';
import ManuscriptPanel from './components/panels/ManuscriptView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { GoalsModal } from './components/GoalsModal';
import { SovereignErrorBoundary } from './components/SovereignErrorBoundary';
import { WritingGoal } from './types';
import { useLoreStore } from './stores/useLoreStore';
import { useProjectStore } from './stores/useProjectStore';
import { useManuscriptStore } from './stores/useManuscriptStore';
import { useAppDataLoader } from './hooks/useAppDataLoader';
import { useAppEventListeners } from './hooks/useAppEventListeners';
import { runMigrations } from './services/dbMigrationService';

import { TimelineView } from './components/panels/TimelineView';

const LoadingState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
      <Loader2 className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">
      Synchronizing Echoes...
    </p>
  </div>
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const isZenMode = useProjectStore(state => state.isZenMode);

  const {
    scenes,
    writingGoal,
    isAppLoaded,
    setCurrentSceneId,
  } = useManuscriptStore();

  const [toast, setToast] = useState<{ message: string, id: number } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showGoals, setShowGoals] = useState(false);

  useAppDataLoader();
  useAppEventListeners(setIsSearchOpen, () => {});

  const isLoreLoaded = useLoreStore(state => state.isLoaded);
  
  useEffect(() => {
    runMigrations();
  }, []);

  const isLoaded = isAppLoaded && isLoreLoaded;

  const showToast = useCallback((message: string) => {
    setToast({ message, id: Date.now() });
  }, []);

  const totalWordCount = useMemo(() => {
    return scenes.reduce((total, scene) => {
      return total + (scene.wordCount || 0);
    }, 0);
  }, [scenes]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-on-surface gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-label text-xs uppercase tracking-widest animate-pulse">Initializing Echo Engine...</p>
      </div>
    );
  }

  const renderScreen = () => {
    return (
      <Routes>
        <Route path="/" element={
          <WelcomeScreen 
            onEnterWorkspace={() => navigate('/workspace')} 
            onViewManuscript={() => navigate('/manuscript')}
            wordCount={totalWordCount}
            goal={writingGoal}
            scenes={scenes}
            onJumpToScene={(id) => {
              setCurrentSceneId(id);
              navigate('/workspace');
            }}
          />
        } />
        <Route path="/settings" element={
          <SettingsScreen 
            showToast={showToast}
            onClose={() => navigate(-1)}
          />
        } />
        <Route path="/manuscript" element={
          <ManuscriptPanel 
            showToast={showToast}
            onViewReport={(version) => {
              navigate('/workspace');
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('view-report', { detail: version }));
              }, 100);
            }}
          />
        } />
        <Route path="/timeline" element={
          <TimelineView 
            setActiveHUD={(hud) => {
              if (hud === 'manuscript') navigate('/manuscript');
              else if (hud === 'lore' || hud === 'voices') {
                navigate('/workspace');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('open-hud', { detail: hud }));
                }, 100);
              }
            }}
          />
        } />
        <Route path="/workspace" element={
          <Editor 
              showToast={showToast}
          />
        } />
        <Route path="/lore" element={
          <LoreScreen onClose={() => navigate('/workspace')} />
        } />
        <Route path="/voices" element={
          <CharacterVoicesScreen onClose={() => navigate('/workspace')} />
        } />
        <Route path="/suite" element={
          <SuiteBuilderView onClose={() => navigate('/workspace')} />
        } />
      </Routes>
    );
  };

  return (
    <div className={`h-[100dvh] bg-surface text-on-surface flex flex-col font-body overflow-hidden ${isZenMode ? 'is-zen' : ''}`}>
      <div className="texture-overlay" />
      {toast && <Toast key={toast.id} message={toast.message} onClose={() => setToast(null)} />}
      
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        showToast={showToast}
      />

      <GoalsModal 
        isOpen={showGoals} 
        onClose={() => setShowGoals(false)} 
        showToast={showToast}
      />
      
      <main className={`flex-1 min-h-0 flex flex-col overflow-hidden relative z-10 ${location.pathname === '/' ? '' : 'pt-0'}`}>
        <SovereignErrorBoundary>
          <Suspense fallback={<LoadingState />}>
            {renderScreen()}
          </Suspense>
        </SovereignErrorBoundary>
      </main>
    </div>
  );
}
