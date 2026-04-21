import React, { useMemo } from 'react';
import { Sparkles, Loader2, Fingerprint } from 'lucide-react';
import { RefinementPresets } from './RefinementPresets';
import { RefinePanelProps } from '../../types';
import { MirrorPreview } from './MirrorPreview';
import { useRefinement } from '../../hooks/useRefinement';
import { useLoreStore } from '../../stores/useLoreStore';
import { useUIStore } from '../../stores/useUIStore';
import { useManuscriptStore } from '../../stores/useManuscriptStore';
import { useProjectStore } from '../../stores/useProjectStore';
import { calculateAbsoluteDay } from '../../utils/calendar';

export const RefinePanel: React.FC<RefinePanelProps> = (props) => {
    const { 
        voiceDNAs, 
        voiceSuites, 
        loreEntries, 
        voiceProfiles, 
        authorVoices,
        calendarConfig
    } = useLoreStore();
    
    const workbenchDraft = useUIStore(state => state.workbenchDraft);
    const { scenes, chapters, currentSceneId } = useManuscriptStore();
    const projectName = useProjectStore(state => state.projectName);

    const currentScene = useMemo(() => scenes.find(s => s.id === currentSceneId), [scenes, currentSceneId]);
    const currentChapter = useMemo(() => chapters.find(c => c.id === currentScene?.chapterId), [chapters, currentScene]);

    // Pre-warm the audit engine by calculating active context early
    // Applies Temporal Gating so the UI Context Meter exactly matches the Engine payload
    const preFetchedContext = useMemo(() => {
        const currentAbsoluteDay = calendarConfig?.useCustomCalendar && currentScene?.storyDate 
            ? calculateAbsoluteDay(currentScene.storyDate, calendarConfig)
            : (currentScene?.storyDay ?? 0);

        const filterByTime = (items: any[]) => items.filter(item => {
            if (item.isActive) return true;
            if (item.isForeshadowing) return true;
            if (item.isTimelineEnabled === false) return true;

            const itemAbsoluteDay = calendarConfig?.useCustomCalendar && item.storyDate
                ? calculateAbsoluteDay(item.storyDate, calendarConfig)
                : item.storyDay;

            if (itemAbsoluteDay === undefined || itemAbsoluteDay === null) return true;
            if (itemAbsoluteDay <= currentAbsoluteDay) return true;
            
            return false;
        });

        const activeLore = filterByTime(loreEntries.filter(e => e.isActive));
        const activeVoices = filterByTime(voiceProfiles.filter(v => v.isActive));
        const activeAuthorVoices = filterByTime(authorVoices.filter(v => v.isActive));
        
        return {
            lore: activeLore,
            voices: activeVoices,
            authorVoices: activeAuthorVoices,
            voiceSuites,
            voiceDNAs,
            isReady: true
        };
    }, [loreEntries, voiceProfiles, authorVoices, voiceSuites, voiceDNAs, currentScene, calendarConfig]);

    const isSurgical = !!(props.selection && props.selection.text.trim().length > 0);

    const { streamingThoughts, streamingText } = useRefinement(props);

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 animate-in fade-in duration-500 overflow-hidden pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4 flex-shrink-0">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-primary-glow animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary/60">Refinement Engine</span>
                        {workbenchDraft && (
                            <span className="ml-2 px-1 py-0.5 rounded bg-accent-amber/10 border border-accent-amber/20 text-[8px] font-bold text-accent-amber uppercase tracking-widest">Post-Edit Mode</span>
                        )}
                    </div>
                    <h3 className="font-headline text-xl font-bold tracking-tight">Audit</h3>
                    <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-wider font-bold">Ruthless examination by the Cynical Mirror.</p>
                </div>
            </div>

            {/* Split View Container */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full min-h-0">
                
                {/* Left Pane: Configuration */}
                <div className="flex-1 h-full overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    <div className="w-full">
                        <RefinementPresets 
                            {...props} 
                            loreEntries={loreEntries}
                            voiceProfiles={voiceProfiles}
                            authorVoices={authorVoices}
                            voiceDNAs={voiceDNAs}
                            voiceSuites={voiceSuites}
                            getDraft={() => props.draft} 
                            selection={props.selection || null} 
                            editorRef={props.editorRef}
                            setActiveTab={props.setActiveTab}
                            localWarnings={props.localWarnings}
                            preFetchedContext={preFetchedContext}
                            chapterTitle={currentChapter?.title}
                            projectName={projectName}
                            currentSceneId={currentSceneId}
                            sceneTitle={currentScene?.title}
                        />
                    </div>

                    {/* Mobile-only Preview Trigger or small indicator could go here */}
                    <div className="lg:hidden p-4 bg-surface-container-low rounded-xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Fingerprint className="w-4 h-4 text-primary" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface">Mirror Preview Active</span>
                        </div>
                        <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">
                            {isSurgical ? 'Selection Target' : 'Full Manuscript'}
                        </span>
                    </div>
                </div>

                {/* Right Pane: Mirror Preview (Desktop Only) */}
                <div className="hidden lg:flex flex-1 min-h-0">
                    <MirrorPreview 
                        text={props.draft}
                        selection={props.selection}
                        localWarnings={props.localWarnings}
                        isSurgical={isSurgical}
                        streamingThoughts={streamingThoughts}
                        streamingText={streamingText}
                        isRefining={props.isRefining}
                    />
                </div>
            </div>
        </div>
    );
};
