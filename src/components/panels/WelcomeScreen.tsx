import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NewProjectModal } from '../NewProjectModal';
import * as Icons from 'lucide-react';
import { Wand2, ArrowRight, BookOpen, Mic2, BarChart3, ChevronRight, X, Download, Upload, ChevronDown, Info, Fingerprint, Layout, Play, Zap, Plus, Database, Clock, Sparkles, Activity, Target, History } from 'lucide-react';
import { ProjectHeader } from '../welcome/ProjectHeader';
import { ProjectStats } from '../welcome/ProjectStats';
import { HeroAction } from '../welcome/HeroAction';
import { FeatureHighlights } from '../welcome/FeatureHighlights';
import { QuickAudit } from '../welcome/QuickAudit';
import { GUIDE_SECTIONS } from '../../constants';
import { useWorkbenchStore } from '../../stores/useWorkbenchStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { WritingGoal, Scene } from '../../types';

interface WelcomeScreenProps {
  onEnterWorkspace: () => void;
  onViewManuscript: () => void;
  wordCount: number;
  goal: WritingGoal;
  scenes: Scene[];
  onJumpToScene: (id: string) => void;
}

export function WelcomeScreen({ onEnterWorkspace, onViewManuscript, wordCount, goal, scenes, onJumpToScene }: WelcomeScreenProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeTab, setActiveTab] = useState<'handbook' | 'codex' | 'playground'>('handbook');
  const [activeSection, setActiveSection] = useState(GUIDE_SECTIONS[0].id);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [visitedSections, setVisitedSections] = useState<Set<string>>(new Set([GUIDE_SECTIONS[0].id]));
  
  const { 
    playgroundInput, 
    setPlaygroundInput, 
    playgroundResult, 
    isRefining, 
    streamingText, 
    refinePlayground,
    error 
  } = useWorkbenchStore();

  const projectName = useProjectStore(state => state.projectName);
  const exportProject = useProjectStore(state => state.exportProject);
  const importProject = useProjectStore(state => state.importProject);
  const isImporting = useProjectStore(state => state.isImporting);

  const calendarConfig = useLoreStore(state => state.calendarConfig);
  const loreEntries = useLoreStore(state => state.loreEntries);
  const voiceProfiles = useLoreStore(state => state.voiceProfiles);
  const voiceDNAs = useLoreStore(state => state.voiceDNAs);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseLoreCount = loreEntries.filter(e => !e.parentId && !e.isEvolution).length;
  const loreEvolutionCount = loreEntries.filter(e => e.parentId || e.isEvolution).length;
  
  // Pivot to VoiceDNA as the primary metric for "Voice DNA" count
  const baseVoiceCount = voiceDNAs.filter(v => !v.parentId && !v.isEvolution).length;
  const voiceEvolutionCount = voiceDNAs.filter(v => v.parentId || v.isEvolution).length;

  // If VoiceDNAs are empty (new project), fallback to VoiceProfiles
  const displayVoiceCount = baseVoiceCount || voiceProfiles.filter(v => !v.parentId && !v.isEvolution).length;
  const displayVoiceEvolution = voiceEvolutionCount || voiceProfiles.filter(v => v.parentId || v.isEvolution).length;

  const writingProgress = Math.min(100, Math.round((wordCount / goal.targetWords) * 100));

  // Find the most recently modified scene
  const latestScene = [...scenes].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0];
  const recentScenes = [...scenes].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).slice(0, 3);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importProject(file);
        window.location.reload();
      } catch (error: any) {
        console.error('Import failed:', error);
      }
    }
  };

  return (
    <div className="h-full w-full relative overflow-y-auto scrollbar-none bg-surface">
      <div className="min-h-full w-full flex flex-col items-center justify-start relative pt-12 pb-12 px-6 md:px-12">
        {/* Background Textures */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <AnimatePresence mode="wait">
        {!showGuide ? (
          <motion.div
            key="sovereign-command"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[1400px] relative z-10 space-y-12"
          >
            <ProjectHeader 
              projectName={projectName}
              exportProject={exportProject}
              importProject={importProject}
              isImporting={isImporting}
              onImportFile={handleFileChange}
              fileInputRef={fileInputRef}
            />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: The Archive (Stats & History) */}
              <div className="lg:col-span-3 space-y-8">
                <ProjectStats 
                  wordCount={wordCount}
                  goal={goal}
                  writingProgress={writingProgress}
                  loreCount={baseLoreCount}
                  loreEvolutionCount={loreEvolutionCount}
                  voiceCount={displayVoiceCount}
                  voiceEvolutionCount={displayVoiceEvolution}
                  recentScenes={recentScenes}
                  calendarConfig={calendarConfig}
                  onJumpToScene={onJumpToScene}
                />
              </div>

              {/* Center Column: The Command (Main Actions) */}
              <div className="lg:col-span-6 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-primary/60">Active Focus</span>
                  </div>

                  <HeroAction 
                    latestScene={latestScene}
                    onEnterWorkspace={onEnterWorkspace}
                    onJumpToScene={onJumpToScene}
                    setShowNewProject={setShowNewProject}
                    setShowGuide={setShowGuide}
                  />

                  <FeatureHighlights />
                </div>
              </div>

              {/* Right Column: The Mirror (Quick Audit) */}
              <div className="lg:col-span-3 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-primary/60">The Mirror</span>
                  </div>

                  <QuickAudit 
                    playgroundInput={playgroundInput}
                    setPlaygroundInput={setPlaygroundInput}
                    playgroundResult={playgroundResult}
                    isRefining={isRefining}
                    streamingText={streamingText}
                    error={error}
                    refinePlayground={refinePlayground}
                  />
                </div>
              </div>

            </div>

            <NewProjectModal 
              isOpen={showNewProject} 
              onClose={() => setShowNewProject(false)} 
              onCreate={(name, desc, goal) => {
                setShowNewProject(false);
                onEnterWorkspace();
              }}
            />
          </motion.div>
        ) : (
          <div />
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
