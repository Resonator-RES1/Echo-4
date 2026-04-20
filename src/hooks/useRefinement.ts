import { useState, useCallback, useMemo } from 'react';
import { useWorkbenchStore } from '../stores/useWorkbenchStore';
import { usePromptStore } from '../stores/usePromptStore';
import { useConfigStore } from '../stores/useConfigStore';
import { refineDraft } from '../engines/geminiService';
import { SOVEREIGN_PRESETS } from '../constants/sovereignPresets';
import { replaceClosestOccurrence } from '../utils/textUtils';
import { useUIStore } from '../stores/useUIStore';
import { 
    RefinedVersion, 
    RefinementPresetsProps,
    FocusArea
} from '../types';

export const useRefinement = (props: RefinementPresetsProps) => {
    const {
        getDraft, selection, setIsRefining, showToast, onNewVersion,
        loreEntries, voiceProfiles, authorVoices, voiceDNAs = [], voiceSuites = [],
        currentSceneId, sceneTitle, chapterTitle, projectName, storyDay, storyDate, calendarConfig, editorRef, setActiveTab, localWarnings, preFetchedContext
    } = props;

    const manualCustomFocus = useWorkbenchStore(state => state.customDirectives);
    const manualFocusAreas = useWorkbenchStore(state => state.focusAreas);
    const suggestionLedger = useWorkbenchStore(state => state.suggestionLedger);
    const model = useWorkbenchStore(state => state.model);
    const setModel = useWorkbenchStore(state => state.setModel);
    const reportModel = useWorkbenchStore(state => state.reportModel);
    const refinementThinkingLevel = useConfigStore(state => state.refinementThinkingLevel);
    const reportThinkingLevel = useWorkbenchStore(state => state.reportThinkingLevel);
    const feedbackDepth = useWorkbenchStore(state => state.feedbackDepth);
    const setFeedbackDepth = useWorkbenchStore(state => state.setFeedbackDepth);
    const activePresetIds = useWorkbenchStore(state => state.activePresetIds);
    const refinementScope = useWorkbenchStore(state => state.refinementScope);
    const isSurgicalMode = useWorkbenchStore(state => state.isSurgicalMode);
    const creativeTension = useWorkbenchStore(state => state.creativeTension);
    const reportTemperature = useConfigStore(state => state.reportTemperature);
    const draftingStance = useConfigStore(state => state.draftingStance);

    const fragments = usePromptStore(state => state.fragments);
    const activeFragmentIds = useConfigStore(state => state.activeFragmentIds);

    const activeFragments = useMemo(() => {
        return fragments.filter(f => activeFragmentIds.includes(f.id));
    }, [fragments, activeFragmentIds]);

    const focusAreas = useMemo(() => {
        const areas = new Set(manualFocusAreas);
        activePresetIds.forEach(id => {
            const p = SOVEREIGN_PRESETS.find(sp => sp.id === id);
            p?.focusAreas.forEach(fa => areas.add(fa));
        });
        return Array.from(areas);
    }, [manualFocusAreas, activePresetIds]);

    const customFocus = useMemo(() => {
        const directives = activePresetIds
            .map(id => SOVEREIGN_PRESETS.find(sp => sp.id === id)?.customDirective)
            .filter(Boolean) as string[];
        
        // Add active fragments to directives
        activeFragments.forEach(f => {
            if (f.content) {
                directives.push(`[FRAGMENT: ${f.name}]\n${f.content}`);
            }
        });
        
        if (manualCustomFocus.trim()) {
            directives.push(manualCustomFocus.trim());
        }
        
        return directives.join('\n\n');
    }, [manualCustomFocus, activePresetIds, activeFragments]);

    const [streamingThoughts, setStreamingThoughts] = useState('');
    const [streamingText, setStreamingText] = useState('');

    const hasSelection = !!(selection && selection.text.trim().length > 0);

    const handleRefine = useCallback(async () => {
        const fullDraft = getDraft();
        const isTargeted = hasSelection && isSurgicalMode;
        const textToRefine = isTargeted ? selection.text : fullDraft;
        
        const matches = (textToRefine || '').match(/\S+/g);
        if (!matches || matches.length < 10) {
            showToast("Text is too short. Echo needs more context to refine effectively.");
            return;
        }
        if (!textToRefine.trim()) {
            showToast("Cannot refine an empty draft.");
            return;
        };
        
        setIsRefining(true);
        setStreamingThoughts('');
        setStreamingText('');
        
        const activePresetId = activePresetIds[activePresetIds.length - 1];
        const activePreset = SOVEREIGN_PRESETS.find(p => p.id === activePresetId);
        const baselinePillars = activePreset?.baselinePillars ?? false;

        const latestResult = useUIStore.getState().latestRefinementResult;
        
        const isPresetModified = activePreset ? (
            activePreset.focusAreas.length !== focusAreas.length ||
            !activePreset.focusAreas.every(f => focusAreas.includes(f)) ||
            activePreset.model !== model ||
            activePreset.depth !== feedbackDepth ||
            (activePreset.customDirective || '') !== customFocus.trim()
        ) : false;

        const options = {
          draft: textToRefine,
          fullContextDraft: isTargeted ? fullDraft : undefined,
          selection: isTargeted ? selection : undefined,
          generationConfig: { 
              model, 
              temperature: creativeTension,
              thinkingConfig: { thinkingLevel: refinementThinkingLevel }
          },
          reportGenerationConfig: {
              model: reportModel,
              temperature: reportTemperature,
              thinkingConfig: { thinkingLevel: reportThinkingLevel }
          },
          focusAreas,
          customFocus: [customFocus.trim(), ...suggestionLedger].filter(Boolean).join('\n') || undefined,
          loreEntries: preFetchedContext?.isReady ? preFetchedContext.lore : loreEntries, 
          voiceProfiles: preFetchedContext?.isReady ? preFetchedContext.voices : voiceProfiles, 
          authorVoices: preFetchedContext?.isReady ? (preFetchedContext.authorVoices || []) : authorVoices,
          voiceSuites: preFetchedContext?.isReady ? (preFetchedContext.voiceSuites || []) : voiceSuites,
          voiceDNAs: preFetchedContext?.isReady ? (preFetchedContext.voiceDNAs || []) : voiceDNAs,
          feedbackDepth,
          storyDay,
          storyDate,
          calendarConfig,
          localWarnings,
          isSurgical: isTargeted,
          scope: refinementScope,
          baselinePillars,
          isPresetModified,
          presetName: activePreset?.name,
          draftingStance,
          isReRefinement: useUIStore.getState().refinementMode === 'post-audit',
          previousInternalCritique: latestResult?.internalCritique,
          onStream: (chunk: { text?: string; thinking?: string }) => {
              if (chunk.thinking) {
                  setStreamingThoughts(prev => prev + chunk.thinking);
              }
              if (chunk.text) {
                  setStreamingText(prev => prev + chunk.text);
              }
          }
        };

        try {
            const result = await refineDraft(options);

            // Store the raw result in state for the Narrative Simulator UI
            const uiStore = useUIStore.getState();
            if ('latestRefinementResult' in uiStore) {
                (uiStore as any).latestRefinementResult = result;
            }
            
            // Reset workspace parameters after refinement as requested
            // setFocusAreas([]); // Removed
            // setModel('gemini-3-flash-preview'); // Removed
            // setFeedbackDepth('balanced'); // Removed
            
            let finalRefinedText = result.text;
            let extractedTitle = '';
            
            if (isTargeted && editorRef?.current) {
                 const currentState = editorRef.current.state;
                 const token = `ECHOREFINETOKEN${Date.now()}`;
                 
                 editorRef.current.commands.insertContentAt({ from: selection.start, to: selection.end }, token);
                 const markdownWithToken = editorRef.current.storage.markdown.getMarkdown();
                 finalRefinedText = markdownWithToken.replace(token, () => result.text);
                 editorRef.current.view.updateState(currentState);
                 editorRef.current.commands.insertContent(result.text);
                 
                 if (setActiveTab) setActiveTab('draft');
            } else if (isTargeted) {
                 finalRefinedText = replaceClosestOccurrence(fullDraft, selection.text, result.text, selection.start);
            }

            let finalTitle = '';
            if (isTargeted) {
                if (activePresetIds.includes('full-chapter-coherence')) {
                    finalTitle = chapterTitle || sceneTitle || projectName || 'Full Chapter Audit';
                } else {
                    finalTitle = sceneTitle || projectName || 'Surgical Audit';
                }
            } else {
                const lines = result.text.trimStart().split('\n');
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine.startsWith('---') || trimmedLine.startsWith('***')) continue;
                    if (trimmedLine.startsWith('#')) {
                        extractedTitle = trimmedLine.replace(/^#+\s*/, '').trim();
                        break;
                    } else if (trimmedLine.length > 0 && trimmedLine.length < 60 && !trimmedLine.includes('.') && !trimmedLine.includes(',')) {
                        extractedTitle = trimmedLine;
                        break;
                    }
                }
                
                if (!extractedTitle || extractedTitle.toLowerCase() === 'title') {
                    const firstDraftLine = fullDraft.trimStart().split('\n', 1)[0].trim();
                    if (firstDraftLine) {
                        if (firstDraftLine.startsWith('#')) {
                            extractedTitle = firstDraftLine.replace(/^#+\s*/, '').trim();
                        } else if (firstDraftLine.length < 60 && !firstDraftLine.includes('.') && !firstDraftLine.includes(',')) {
                            extractedTitle = firstDraftLine;
                        }
                    }
                }
                
                if (!extractedTitle || extractedTitle.toLowerCase() === 'title') {
                    extractedTitle = sceneTitle || projectName || '';
                }

                finalTitle = extractedTitle || `Audit ${new Date().toLocaleTimeString()}`;
            }

            if (finalTitle.length > 100) {
                finalTitle = finalTitle.substring(0, 97) + '...';
            }

            const newVersion: RefinedVersion = {
                ...result,
                text: finalRefinedText,
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                title: finalTitle,
                summary: isTargeted 
                    ? `Surgical Audit on: "${selection.text.trim().substring(0, 50)}${selection.text.length > 50 ? '...' : ''}" - ${result.summary}` 
                    : result.summary,
                creative_scarring: result.creative_scarring,
                mandate_compliance: result.mandate_compliance,
                analysis: result.analysis,
                conflicts: result.conflicts,
                metrics: result.metrics,
                loreCorrections: result.loreCorrections,
                threadId: result.threadId,
                sceneId: currentSceneId || undefined,
                activeContext: result.activeContext,
                isSurgical: isTargeted,
                originalText: isTargeted ? selection.text : fullDraft,
                originalSelection: isTargeted ? selection.text : undefined,
                refinedSelection: isTargeted ? result.text : undefined,
                usedProfiles: {
                    authorVoices: authorVoices.filter(v => v.isActive).map(v => v.name),
                    characterVoices: voiceProfiles.filter(v => v.isActive).map(v => v.name),
                    voiceSuites: voiceSuites.filter(s => s.isActive).map(s => s.name),
                    loreEntries: loreEntries.filter(e => e.isActive).map(e => e.title),
                    promptFragments: activeFragments.map(f => f.name),
                    focusAreas: focusAreas
                }
            };

            onNewVersion(newVersion);
            showToast(isTargeted ? "Targeted refinement applied directly!" : "New version created!");
            setIsRefining(false);
            setStreamingThoughts('');
            setStreamingText('');
            // setActivePresetId(undefined); // Removed
            // setCustomFocus(''); // Removed
        } catch (error) {
            console.error("Refinement error:", error);
            showToast("An error occurred during refinement.");
            setIsRefining(false);
        }
    }, [getDraft, selection, model, refinementThinkingLevel, reportModel, reportThinkingLevel, feedbackDepth, focusAreas, customFocus, showToast, setIsRefining, onNewVersion, loreEntries, voiceProfiles, authorVoices, currentSceneId, sceneTitle, chapterTitle, projectName, editorRef, setActiveTab, preFetchedContext, calendarConfig, localWarnings, storyDate, storyDay, voiceDNAs, voiceSuites, activePresetIds, hasSelection, isSurgicalMode, refinementScope, suggestionLedger, creativeTension, reportTemperature, activeFragments, draftingStance]);

    return {
        handleRefine,
        streamingThoughts,
        streamingText,
        setStreamingThoughts,
        setStreamingText
    };
};
