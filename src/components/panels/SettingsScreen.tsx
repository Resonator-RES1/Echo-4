import React, { useState, useEffect } from 'react';
import { ProjectManager } from '../ProjectManager';
import { ThemeManager } from '../ThemeManager';
import { CalendarSettings } from '../CalendarSettings';
import { Settings, Shield, Database, Info, LogOut, Key, Palette, X, Calendar, Sparkles, Trash2, BrainCircuit, Loader2 } from 'lucide-react';
import * as db from '../../services/dbService';
import { motion } from 'motion/react';
import { useSeedingEngine } from '../../hooks/useSeedingEngine';
import { synthesizeDynamicMemory } from '../../engines/gemini/edm';

interface SettingsScreenProps {
  showToast: (message: string) => void;
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ showToast, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const { seed, scrub } = useSeedingEngine();
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [axiomCount, setAxiomCount] = useState<number>(0);

  useEffect(() => {
    const loadApiKey = async () => {
      const savedKey = await db.getSetting('api_key');
      if (savedKey) setApiKey(savedKey);
    };
    const loadAxiomCount = async () => {
      const axioms = await db.getMemoryAxioms();
      setAxiomCount(axioms.length);
    };
    loadApiKey();
    loadAxiomCount();
  }, []);

  const handleApiKeyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    await db.putSetting('api_key', newKey);
    showToast('API Key updated successfully.');
  };

  const handleSynthesizeEDM = async () => {
    try {
      setIsSynthesizing(true);
      showToast('Initiating EDM Synthesis. This may take a minute...');
      
      const loreEntries = await db.getActiveLoreEntries();
      const voiceProfiles = await db.getVoiceProfiles();
      const timelineEvents = await db.getActiveTimelineEvents();
      const characterArcs = await db.getCharacterArcs();
      
      const synthesizedAxioms = await synthesizeDynamicMemory(loreEntries, voiceProfiles, timelineEvents, characterArcs);
      
      if (synthesizedAxioms.length > 0) {
        await db.setAllMemoryAxioms(synthesizedAxioms);
        setAxiomCount(synthesizedAxioms.length);
        showToast(`Synthesis Complete: ${synthesizedAxioms.length} Axioms extracted.`);
      } else {
        showToast('Synthesis yielded no new axioms or failed.');
      }
    } catch (error) {
      console.error(error);
      showToast('Error during EDM Synthesis.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-[50]"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90vw] md:max-w-4xl md:h-[85vh] bg-surface-container-lowest/95 backdrop-blur-xl shadow-2xl border border-outline-variant/20 rounded-xl z-[60] flex flex-col overflow-hidden"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-8 p-2 rounded-full hover:bg-surface-container-highest transition-colors z-20"
        >
          <X className="w-6 h-6 text-on-surface-variant" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-4">
          <div className="max-w-3xl mx-auto space-y-12 pb-12">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-4 bg-primary/10 rounded-lg">
                <Settings className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="font-headline text-4xl text-on-surface font-light tracking-tight">Settings</h1>
                <p className="text-on-surface-variant font-headline italic">Manage your project and application preferences</p>
              </div>
            </div>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
                <Key className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-xl text-on-surface">API Configuration</h2>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={handleApiKeyChange}
                      placeholder="Enter your Gemini API key..."
                      className="w-full p-4 rounded-xl bg-surface-container-highest/20 border border-outline-variant/20 focus:border-primary/50 outline-none transition-all font-mono text-sm"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30 pointer-events-none">
                      Project Specific
                    </div>
                  </div>
                  <p className="text-[9px] text-on-surface-variant/50 leading-relaxed">
                    Your API key is stored locally in your browser and never sent to our servers. It is used only for refinement requests.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-xl text-on-surface">Temporal Logic</h2>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm">
                <CalendarSettings />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
                <Palette className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-xl text-on-surface">Appearance</h2>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm">
                <p className="text-sm text-on-surface-variant mb-6">
                  Choose the visual atmosphere that best suits your current writing session.
                </p>
                <ThemeManager />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-xl text-on-surface">Echo Dynamic Memory (EDM)</h2>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 shadow-sm space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-on-surface">Axiom Synthesis Engine</h3>
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-label uppercase tracking-widest">
                      {axiomCount} Axioms Active
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    The EDM Engine utilizes **Gemini 2.5 Pro** to perform a deep-scan of your entire active Lore and Voice library. It synthesizes verbose text into strict, actionable "Axioms"—improving Pre-Flight accuracy and lowering token over-head.
                  </p>
                </div>
                
                <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between">
                    <p className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest font-black max-w-[60%]">
                      Sovereign execution. Run this when you have made significant Lore updates.
                    </p>
                    <button
                      onClick={handleSynthesizeEDM}
                      disabled={isSynthesizing}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-label text-[10px] uppercase tracking-[0.1em] font-black shadow-lg shadow-primary/20"
                    >
                      {isSynthesizing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Synthesizing...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-4 h-4" />
                          Sync Memory
                        </>
                      )}
                    </button>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
                <Sparkles className="w-5 h-5 text-accent-emerald" />
                <h2 className="font-headline text-xl text-on-surface">Project Crucible</h2>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="font-medium text-on-surface">Seeding Engine (Alpha)</h3>
                  <p className="text-sm text-on-surface-variant">
                    Inject high-fidelity Gothic Sci-Fi dummy data (Lore, Voices, Manuscript) to stress-test your current environment.
                  </p>
                </div>
                
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={async () => { await seed(); showToast("Crucible data injected."); onClose(); }}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent-emerald text-white hover:scale-[1.02] transition-all font-label text-[10px] uppercase tracking-[0.2em] font-black shadow-lg shadow-accent-emerald/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    Seed Crucible
                  </button>
                  <button
                    onClick={async () => { await scrub(); showToast("Crucible data scrubbed."); onClose(); }}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-surface-container-highest text-on-surface hover:bg-error/10 hover:text-error transition-all font-label text-[10px] uppercase tracking-[0.2em] font-black border border-outline-variant/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Scrub Engine
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
                <Database className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-xl text-on-surface">Project Management</h2>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm">
                <p className="text-sm text-on-surface-variant mb-6">
                  Export your entire project including lore, voices, and manuscript scenes to a single file for backup or sharing.
                </p>
                <ProjectManager showToast={showToast} />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-xl text-on-surface">Privacy & Security</h2>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-on-surface">Local Storage Only</h3>
                    <p className="text-sm text-on-surface-variant">Your data is stored locally in your browser's IndexedDB.</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-label uppercase tracking-widest">Active</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-on-surface">AI Processing</h3>
                    <p className="text-sm text-on-surface-variant">Drafts are sent to Google Gemini for refinement. No data is used for training.</p>
                  </div>
                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-label uppercase tracking-widest">Standard</div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-2">
                <Info className="w-5 h-5 text-primary" />
                <h2 className="font-headline text-xl text-on-surface">About Echo</h2>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Version</span>
                    <span className="text-on-surface font-mono">1.0.42-beta</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Build Date</span>
                    <span className="text-on-surface font-mono">March 2026</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/5">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Echo is a narrative intelligence suite designed to help authors maintain consistency, enhance sensory depth, and refine their narrative voice through advanced AI analysis.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-12 flex justify-center">
              <button 
                onClick={async () => {
                  await db.clearProjectData();
                  window.location.reload();
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors font-label text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" />
                Reset Application
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
