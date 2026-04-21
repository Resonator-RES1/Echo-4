import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Sparkles, Zap, Terminal, Info, Eye, EyeOff, Loader2, Check as CheckIcon, RefreshCw } from 'lucide-react';
import { FocusAreaSelector } from './presets/FocusAreaSelector';
import { FragmentSelector } from './presets/FragmentSelector';
import { SovereignPresets } from './presets/SovereignPresets';
import { UserPresetManager } from './presets/UserPresetManager';
import { Preset, SOVEREIGN_PRESETS } from '../../constants/sovereignPresets';
import { focusAreaOptions } from '../../constants/focusAreas';
import { AuditPreview } from './presets/AuditPreview';
import { RefinementPresetsProps } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

const VALID_FOCUS_AREA_IDS = new Set(focusAreaOptions.map(o => o.id));
import { useUIStore } from '../../stores/useUIStore';
import { useConfigStore } from '../../stores/useConfigStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { useRefinement } from '../../hooks/useRefinement';
import { scanForContext } from '../../utils/contextScanner';

import { AuditSetupHeader } from './refinement/AuditSetupHeader';
import { ScopeModifiers } from './refinement/ScopeModifiers';
import { EngineParameters } from './refinement/EngineParameters';
import { SuggestionLedger } from './refinement/SuggestionLedger';
import { StreamingThoughtsDisplay } from './refinement/StreamingThoughtsDisplay';
import { useSpectralStore } from '../../stores/useSpectralStore';
import { Target, Activity } from 'lucide-react';

export const RefinementPresets: React.FC<RefinementPresetsProps> = React.memo((props) => {
    const {
        selection, isRefining, showToast,
        loreEntries = [], voiceProfiles = [], authorVoices = [], voiceDNAs = [], voiceSuites = [],
        preFetchedContext
    } = props;

    // Spectral Store
    const { suggestions: spectralSuggestions, isSpectralHUDEnabled, setHUDEnabled } = useSpectralStore();

    // UI Store (Volatile)
    const customFocus = useUIStore(state => state.customDirectives);
    const setCustomFocus = useUIStore(state => state.setCustomDirectives);
    const appendCustomDirective = useUIStore(state => state.appendCustomDirective);
    const suggestionLedger = useUIStore(state => state.suggestionLedger);
    const removeSuggestion = useUIStore(state => state.removeSuggestion);
    const clearSuggestions = useUIStore(state => state.clearSuggestions);
    const refinementMode = useUIStore(state => state.refinementMode);
    const toggleRefinementMode = useUIStore(state => state.toggleRefinementMode);

    // Config Store (Persistent)
    const focusAreas = useConfigStore(state => state.focusAreas);
    const setFocusAreas = useConfigStore(state => state.setFocusAreas);
    const model = useConfigStore(state => state.model);
    const setModel = useConfigStore(state => state.setModel);
    const refinementThinkingLevel = useConfigStore(state => state.refinementThinkingLevel);
    const setRefinementThinkingLevel = useConfigStore(state => state.setRefinementThinkingLevel);
    const reportModel = useConfigStore(state => state.reportModel);
    const setReportModel = useConfigStore(state => state.setReportModel);
    const reportThinkingLevel = useConfigStore(state => state.reportThinkingLevel);
    const setReportThinkingLevel = useConfigStore(state => state.setReportThinkingLevel);
    const feedbackDepth = useConfigStore(state => state.feedbackDepth);
    const setFeedbackDepth = useConfigStore(state => state.setFeedbackDepth);
    const activePresetIds = useConfigStore(state => state.activePresetIds);
    const setActivePresetIds = useConfigStore(state => state.setActivePresetIds);
    const activeFragmentIds = useConfigStore(state => state.activeFragmentIds);
    const refinementScope = useConfigStore(state => state.refinementScope);
    const setRefinementScope = useConfigStore(state => state.setRefinementScope);
    const isSurgicalMode = useConfigStore(state => state.isSurgicalMode);
    const setIsSurgicalMode = useConfigStore(state => state.setIsSurgicalMode);
    const creativeTension = useConfigStore(state => state.creativeTension);
    const setCreativeTension = useConfigStore(state => state.setCreativeTension);
    const reportTemperature = useConfigStore(state => state.reportTemperature);
    const setReportTemperature = useConfigStore(state => state.setReportTemperature);
    const draftingStance = useConfigStore(state => state.draftingStance);
    const setDraftingStance = useConfigStore(state => state.setDraftingStance);

    const { addLoreEntry, addVoiceProfile } = useLoreStore();

    const { getDraft } = props;

    const detectedContextIds = useMemo(() => {
        const text = selection?.text || getDraft();
        return scanForContext(text, loreEntries, voiceProfiles);
    }, [selection, getDraft, loreEntries, voiceProfiles]);

    const missingDetectedContext = useMemo(() => {
        return detectedContextIds.filter(id => {
            const isLore = loreEntries.find(l => l.id === id);
            const isVoice = voiceProfiles.find(v => v.id === id);
            
            // If it's in pre-fetched context, we check if it's already there
            if (preFetchedContext?.isReady) {
                const alreadyActive = preFetchedContext.lore.some(l => l.id === id) || 
                                     preFetchedContext.voices.some(v => v.id === id);
                return !alreadyActive;
            }

            if (isLore) return !isLore.isActive;
            if (isVoice) return !isVoice.isActive;
            return false;
        });
    }, [detectedContextIds, loreEntries, voiceProfiles, preFetchedContext]);

    const [presetsOpen, setPresetsOpen] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
    const [activationStage, setActivationStage] = useState<'idle' | 'activating' | 'synchronized'>('idle');

    const handleEnableDetected = useCallback(async () => {
        setActivationStage('activating');
        
        // Progress through entities
        for (const id of missingDetectedContext) {
            const lore = loreEntries.find(l => l.id === id);
            const voice = voiceProfiles.find(v => v.id === id);
            if (lore) await addLoreEntry({ ...lore, isActive: true });
            if (voice) await addVoiceProfile({ ...voice, isActive: true });
            
            // Artificial delay for high-fidelity feel
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        setActivationStage('synchronized');
        showToast(`Activated ${missingDetectedContext.length} contextual entities.`);
        
        // Auto-close guard after delay
        setTimeout(() => {
            setActivationStage('idle');
        }, 2000);
    }, [missingDetectedContext, loreEntries, voiceProfiles, addLoreEntry, addVoiceProfile, showToast]);

    const hasSelection = !!(selection && selection.text.trim().length > 0);

    const { 
        handleRefine, 
        streamingThoughts, 
        streamingText 
    } = useRefinement(props);

    const latestResult = useUIStore(state => state.latestRefinementResult);

    useEffect(() => {
        setIsSurgicalMode(hasSelection);
    }, [hasSelection, setIsSurgicalMode]);

    const inheritedFocusAreas = useMemo(() => {
        const areas = new Set<string>();
        activePresetIds.forEach(id => {
            const p = SOVEREIGN_PRESETS.find(sp => sp.id === id);
            p?.focusAreas.forEach(fa => areas.add(fa));
        });
        return Array.from(areas) as FocusArea[];
    }, [activePresetIds]);

    const effectiveFocusAreas = useMemo(() => {
        const areas = new Set(focusAreas);
        inheritedFocusAreas.forEach(fa => areas.add(fa));
        return Array.from(areas).filter(id => VALID_FOCUS_AREA_IDS.has(id));
    }, [focusAreas, inheritedFocusAreas]);

    const presetDirectives = useMemo(() => {
        return activePresetIds
            .map(id => SOVEREIGN_PRESETS.find(sp => sp.id === id))
            .filter(Boolean)
            .map(p => ({ name: p!.name, directive: p!.customDirective }))
            .filter(d => d.directive);
    }, [activePresetIds]);

    const effectiveCustomFocus = useMemo(() => {
        const directives = presetDirectives.map(pd => pd.directive).filter(Boolean) as string[];
        if (customFocus.trim()) {
            directives.push(customFocus.trim());
        }
        return directives.join('\n\n');
    }, [presetDirectives, customFocus]);

    const handlePresetSelect = useCallback((preset: Preset) => {
        const isSelected = activePresetIds.includes(preset.id);
        if (isSelected) {
            setActivePresetIds(activePresetIds.filter(id => id !== preset.id));
            showToast(`Preset: ${preset.name} deactivated.`);
        } else {
            if (activePresetIds.length < 3) {
                setActivePresetIds([...activePresetIds, preset.id]);
                setModel(preset.model as any);
                setFeedbackDepth(preset.depth);
                showToast(`Preset: ${preset.name} activated.`);
            } else {
                showToast("You can only select up to 3 presets.");
            }
        }
    }, [activePresetIds, setActivePresetIds, showToast, setModel, setFeedbackDepth]);

    // Metrics Calculations
    const totalLoreChars = loreEntries.reduce((acc, e) => acc + (e.description?.length || 0), 0);
    const activeLoreChars = loreEntries.filter(e => e.isActive).reduce((acc, e) => acc + (e.description?.length || 0), 0);
    const totalVoiceChars = voiceProfiles.reduce((acc, p) => acc + (p.soulPattern?.length || 0), 0);
    const activeVoiceChars = voiceProfiles.filter(p => p.isActive).reduce((acc, p) => acc + (p.soulPattern?.length || 0), 0);
    
    const totalContext = totalLoreChars + totalVoiceChars;
    const activeContext = activeLoreChars + activeVoiceChars;
    const efficiency = totalContext > 0 ? Math.round((1 - (activeContext / totalContext)) * 100) : 0;

    const CONTEXT_LIMIT = 15000;
    const basePressure = (activeContext / CONTEXT_LIMIT) * 100;
    const focusMultiplier = 1 + (effectiveFocusAreas.length * 0.08);
    const presetMultiplier = 1 + (activePresetIds.length * 0.10);
    const depthMultiplier = feedbackDepth === 'in-depth' ? 1.5 : feedbackDepth === 'balanced' ? 1.2 : 1.0;
    const modelMultiplier = (model.includes('pro') || model.includes('high')) ? 1.3 : 1.0;
    
    const cognitivePressure = Math.min(basePressure * focusMultiplier * presetMultiplier * depthMultiplier * modelMultiplier, 120);

    return (
        <div className="space-y-6">
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-4 lg:p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <AuditSetupHeader 
                      isOpen={presetsOpen}
                      onToggle={() => setPresetsOpen(!presetsOpen)}
                      efficiency={efficiency}
                    />
                    <button 
                        onClick={toggleRefinementMode}
                        className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                            refinementMode === 'post-audit' 
                            ? 'bg-accent-indigo text-white border-accent-indigo shadow-lg shadow-accent-indigo/20' 
                            : 'bg-white/5 text-on-surface-variant border-outline-variant/20 hover:bg-white/10'
                        }`}
                    >
                        <RefreshCw className="w-3 h-3" />
                        {refinementMode === 'post-audit' ? 'Post-Audit Mode Active' : 'Regular Refinement Mode'}
                    </button>
                </div>

                {presetsOpen && (
                    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <ScopeModifiers 
                          refinementScope={refinementScope}
                          setRefinementScope={setRefinementScope}
                          isSurgicalMode={isSurgicalMode}
                          setIsSurgicalMode={setIsSurgicalMode}
                          hasSelection={hasSelection}
                        />

                        {/* Spectral Focus Suggestions */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">Spectral Suggestions</span>
                                </div>
                                <button 
                                    onClick={() => setHUDEnabled(!isSpectralHUDEnabled)}
                                    className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter transition-all ${
                                        isSpectralHUDEnabled ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-white/5 text-on-surface-variant/40 border border-white/5'
                                    }`}
                                >
                                    {isSpectralHUDEnabled ? 'HUD ON' : 'HUD OFF'}
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {spectralSuggestions.length > 0 ? (
                                    spectralSuggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                const fa = focusAreaOptions.find(o => o.title === suggestion || o.id === suggestion.toLowerCase().replace(/\s+/g, '-'));
                                                if (fa) {
                                                    setFocusAreas([...new Set([...focusAreas, fa.id])]);
                                                    showToast(`Applied Focus: ${fa.title}`);
                                                } else {
                                                    appendCustomDirective(`Focus on: ${suggestion}`);
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-surface-container-highest/30 border border-outline-variant/10 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest/60 transition-all group"
                                        >
                                            <Activity className="w-3 h-3 text-amber-500/60 group-hover:text-amber-500 transition-colors" />
                                            <span className="text-[9px] font-bold text-on-surface-variant group-hover:text-amber-500 transition-colors uppercase tracking-tight">{suggestion}</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="w-full text-center py-4 border-2 border-dashed border-outline-variant/10 rounded-xl">
                                        <p className="text-[8px] font-bold text-on-surface-variant/20 uppercase tracking-widest">
                                            {isSpectralHUDEnabled ? 'No distinct spectra detected in current draft.' : 'Enable Spectral HUD to view suggestions.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <SovereignPresets 
                            onSelect={handlePresetSelect} 
                            activePresetIds={activePresetIds} 
                        />

                        <UserPresetManager showToast={showToast} />

                        <div className="h-px bg-outline-variant/10 w-full" />

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            <div className="lg:col-span-7 space-y-8">
                                <FocusAreaSelector 
                                    manualFocusAreas={focusAreas}
                                    inheritedFocusAreas={inheritedFocusAreas}
                                    setFocusAreas={setFocusAreas} 
                                    mode="collaborative"
                                />

                                <FragmentSelector />

                                <div className="space-y-3">
                                    {presetDirectives.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 px-1">
                                                <Sparkles className="w-3 h-3 text-primary/60" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/40">Active Preset Directives</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {presetDirectives.map((pd, idx) => (
                                                    <div key={idx} className="p-3 bg-primary/5 border border-primary/10 rounded-xl space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[8px] font-bold uppercase tracking-wider text-primary">{pd.name}</span>
                                                        </div>
                                                        <p className="text-[9px] text-on-surface-variant/80 italic leading-relaxed font-serif">
                                                            {pd.directive}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50 flex items-center gap-2">
                                            <Terminal className="w-3 h-3" /> Additional Directives
                                        </label>
                                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-primary/40 uppercase tracking-widest">
                                            <Info className="w-2.5 h-2.5" /> Optional
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <textarea
                                            value={customFocus}
                                            onChange={(e) => setCustomFocus(e.target.value)}
                                            placeholder="e.g. 'Make the dialogue more noir-inspired' or 'Focus on the character's internal dread'..."
                                            className="w-full bg-surface-container-highest/20 border-2 border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 focus:bg-surface-container-highest/40 transition-all min-h-[80px] resize-none"
                                        />
                                        <div className="absolute bottom-3 right-4 text-[8px] font-bold text-on-surface-variant/20 uppercase tracking-widest group-focus-within:text-primary/40 transition-colors">
                                            Surgical Override
                                        </div>
                                    </div>

                                    <SuggestionLedger 
                                      showSuggestions={showSuggestions}
                                      setShowSuggestions={setShowSuggestions}
                                      suggestionLedger={suggestionLedger}
                                      clearSuggestions={clearSuggestions}
                                      appendCustomDirective={appendCustomDirective}
                                      removeSuggestion={removeSuggestion}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-5 space-y-8">
                                <EngineParameters 
                                  model={model}
                                  setModel={setModel}
                                  refinementThinkingLevel={refinementThinkingLevel}
                                  setRefinementThinkingLevel={setRefinementThinkingLevel}
                                  reportModel={reportModel}
                                  setReportModel={setReportModel}
                                  reportThinkingLevel={reportThinkingLevel}
                                  setReportThinkingLevel={setReportThinkingLevel}
                                  feedbackDepth={feedbackDepth}
                                  setFeedbackDepth={setFeedbackDepth}
                                  creativeTension={creativeTension}
                                  setCreativeTension={setCreativeTension}
                                  reportTemperature={reportTemperature}
                                  setReportTemperature={setReportTemperature}
                                  cognitivePressure={cognitivePressure}
                                  draftingStance={draftingStance}
                                  setDraftingStance={setDraftingStance}
                                />

                                <div className="flex justify-end">
                                    <button 
                                        onClick={() => setShowPreview(!showPreview)}
                                        className={`
                                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all
                                            ${showPreview 
                                                ? 'bg-primary/10 text-primary border border-primary/20' 
                                                : 'bg-surface-container-highest/20 text-on-surface-variant/60 border border-white/5 hover:bg-surface-container-highest/40'
                                            }
                                        `}
                                    >
                                        {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {showPreview ? 'Hide Audit Manifest' : 'Preview Audit Manifest'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {(missingDetectedContext.length > 0 || activationStage !== 'idle') && (
                                <motion.div
                                    key="context-guard-alert"
                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                    className={`p-4 border rounded-xl flex items-center justify-between gap-4 transition-all duration-500 overflow-hidden ${
                                        activationStage === 'synchronized' 
                                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                                            : 'bg-primary/5 border-primary/20 shadow-lg shadow-primary/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
                                            activationStage === 'synchronized' ? 'bg-emerald-500/20 rotate-[360deg]' : 'bg-primary/10'
                                        }`}>
                                            {activationStage === 'synchronized' ? (
                                                <CheckIcon className="w-4 h-4 text-emerald-500" />
                                            ) : activationStage === 'activating' ? (
                                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                            ) : (
                                                <Zap className="w-4 h-4 text-primary animate-pulse" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                                                activationStage === 'synchronized' ? 'text-emerald-500' : 'text-primary'
                                            }`}>
                                                {activationStage === 'synchronized' ? 'Context Fully Integrated' : 'Context Guard Active'}
                                            </p>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[9px] text-on-surface-variant font-medium leading-tight">
                                                    {activationStage === 'synchronized' 
                                                        ? 'All detected anchors are now primed for the Sovereign Engine.'
                                                        : activationStage === 'activating'
                                                        ? 'Binding contextual dna to reality construct...'
                                                        : <>Detected <span className="text-on-surface font-black">{missingDetectedContext.length}</span> entities in draft that are deactivated.</>
                                                    }
                                                </p>
                                                {missingDetectedContext.length > 0 && activationStage === 'idle' && (
                                                    <p className="text-[7px] font-bold text-on-surface-variant/30 uppercase tracking-tighter">
                                                        Engine efficiency will drop without these axioms.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {activationStage === 'idle' && (
                                        <button 
                                            onClick={handleEnableDetected}
                                            className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 hover:bg-primary/90"
                                        >
                                            Synchronize
                                        </button>
                                    )}
                                    {activationStage === 'synchronized' && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {showPreview && (
                                <motion.div
                                    key="audit-preview-panel"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <AuditPreview 
                                        activeLore={preFetchedContext?.isReady ? preFetchedContext.lore : loreEntries.filter(e => e.isActive)}
                                        activeVoices={preFetchedContext?.isReady ? preFetchedContext.voices : voiceProfiles.filter(v => v.isActive)}
                                        activeAuthorVoices={preFetchedContext?.isReady ? preFetchedContext.authorVoices : authorVoices.filter(v => v.isActive)}
                                        allAuthorVoices={authorVoices}
                                        activeVoiceSuite={preFetchedContext?.isReady ? preFetchedContext.voiceSuites?.find(s => s.isActive) : voiceSuites.find(s => s.isActive)}
                                        voiceDNAs={preFetchedContext?.isReady ? preFetchedContext.voiceDNAs : voiceDNAs}
                                        focusAreas={effectiveFocusAreas}
                                        customFocus={effectiveCustomFocus.trim() || undefined}
                                        depth={feedbackDepth}
                                        model={model}
                                        contextSize={activeContext}
                                        contextLimit={CONTEXT_LIMIT}
                                        mandateCompliance={latestResult?.mandate_compliance}
                                        creativeScarring={latestResult?.creative_scarring}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <button 
                onClick={handleRefine} 
                disabled={isRefining} 
                className="w-full flex items-center justify-center gap-3 px-4 lg:px-6 py-3 lg:py-4 bg-primary text-on-primary-fixed font-label uppercase tracking-wider text-xs lg:text-sm font-bold rounded-xl hover:bg-primary/90 disabled:bg-surface-container-highest disabled:text-on-surface-variant/30 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                {isRefining ? <Sparkles className="animate-spin w-6 h-6" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                <span>{isRefining ? 'ECHO IS POLISHING...' : (hasSelection && isSurgicalMode ? 'REFINE SELECTION ONLY' : 'REFINE WITH ECHO')}</span>
            </button>

            <StreamingThoughtsDisplay 
              isRefining={isRefining}
              streamingThoughts={streamingThoughts}
              streamingText={streamingText}
            />
        </div>
    );
});
