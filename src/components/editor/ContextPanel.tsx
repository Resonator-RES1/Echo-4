import React, { useState, useCallback, useMemo } from 'react';
import { BookOpen, Users, User, Sparkles, Zap, GripVertical, AlertTriangle, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scanForContext } from '../../utils/contextScanner';
import { ContinuityIssue } from '../../types';
import { AuthorialContextManager } from './presets/AuthorialContextManager';
import { VoiceProfileManager } from './presets/VoiceProfileManager';
import { LoreContextManager } from './LoreContextManager';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { SemanticGraph } from '../panels/SemanticGraph';
import { calculateAbsoluteDay } from '../../utils/calendar';
import { useLoreStore } from '../../stores/useLoreStore';
import { useManuscriptStore } from '../../stores/useManuscriptStore';

interface ContextPanelProps {
    continuityIssues?: ContinuityIssue[];
    showToast?: (message: string) => void;
}

type ManagerType = 'author' | 'voice' | 'lore';

export const ContextPanel = React.memo(({
    continuityIssues = [],
    showToast
}: ContextPanelProps) => {
    const { 
        loreEntries, 
        voiceProfiles, 
        authorVoices, 
        voiceSuites, 
        voiceDNAs, 
        calendarConfig,
        addLoreEntry,
        deleteLoreEntry,
        addVoiceProfile,
        deleteVoiceProfile,
        setActiveAuthorContext,
        deleteAuthorVoice,
        deleteVoiceSuite
    } = useLoreStore();

    const { scenes, currentSceneId, draft } = useManuscriptStore();
    const currentScene = useMemo(() => scenes.find(s => s.id === currentSceneId), [scenes, currentSceneId]);

    const [order, setOrder] = useState<ManagerType[]>(['author', 'voice', 'lore']);
    const [showGraph, setShowGraph] = useState(false);

    const currentAbsoluteDay = useMemo(() => {
        if (!calendarConfig) return currentScene?.storyDay ?? 0;
        return calculateAbsoluteDay(currentScene?.storyDate, calendarConfig);
    }, [calendarConfig, currentScene]);

    const filterByTime = useCallback((items: any[]) => {
        return items.filter(item => {
            if (item.isActive) return true;
            if (item.isForeshadowing) return true;
            if (item.isTimelineEnabled === false) return true;
            
            const itemAbsoluteDay = item.absoluteDay ?? (calendarConfig ? calculateAbsoluteDay(item.storyDate, calendarConfig) : item.storyDay);
            
            if (itemAbsoluteDay === undefined || itemAbsoluteDay === null) return true;
            return itemAbsoluteDay <= currentAbsoluteDay;
        });
    }, [currentAbsoluteDay, calendarConfig]);

    const availableLore = useMemo(() => filterByTime(loreEntries), [loreEntries, filterByTime]);
    const availableVoices = useMemo(() => filterByTime(voiceProfiles), [voiceProfiles, filterByTime]);
    const availableAuthorVoices = useMemo(() => filterByTime(authorVoices), [authorVoices, filterByTime]);

    const activeLoreCount = loreEntries.filter(e => e.isActive).length;
    const activeVoiceCount = voiceProfiles.filter(p => p.isActive).length;
    const activeAuthorCount = authorVoices.filter(a => a.isActive).length;

    const frayingIssues = continuityIssues.filter(issue => issue.type === 'fraying');

    const handleAutoDetect = useCallback(async () => {
        const detectedIds = scanForContext(draft, loreEntries, voiceProfiles);
        let activatedCount = 0;
        
        for (const id of detectedIds) {
            const lore = loreEntries.find(l => l.id === id);
            const voice = voiceProfiles.find(v => v.id === id);
            
            if (lore && !lore.isActive) {
                await addLoreEntry({ ...lore, isActive: true });
                activatedCount++;
            } else if (voice && !voice.isActive) {
                await addVoiceProfile({ ...voice, isActive: true });
                activatedCount++;
            }
        }
        
        if (activatedCount > 0) {
            showToast?.(`Activated ${activatedCount} contextual anchors defined in your draft.`);
        } else {
            showToast?.("Context is already aligned with your draft.");
        }
    }, [draft, loreEntries, voiceProfiles, addLoreEntry, addVoiceProfile, showToast]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newOrder = Array.from(order);
        const [reorderedItem] = newOrder.splice(result.source.index, 1);
        newOrder.splice(result.destination.index, 0, reorderedItem);
        setOrder(newOrder);
    };

    const renderManager = (type: ManagerType) => {
        const managerClass = "bg-white/[0.03] backdrop-blur-2xl rounded-xl border border-white/5 p-4 shadow-2xl h-full flex flex-col relative overflow-hidden group/manager hover:border-primary/20 transition-all duration-500";
        const glowClass = "absolute -top-4 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-[40px] group-hover/manager:bg-primary/10 transition-colors duration-700 pointer-events-none";

        switch (type) {
            case 'author':
                return (
                    <div className={managerClass}>
                        <div className={glowClass} />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface/60">Authorial Context</span>
                            </div>
                            <GripVertical className="w-3.5 h-3.5 text-on-surface-variant/40 cursor-grab active:cursor-grabbing hover:text-primary transition-colors" />
                        </div>
                        <AuthorialContextManager 
                            voiceSuites={voiceSuites}
                            authorVoices={availableAuthorVoices}
                            voiceDNAs={voiceDNAs}
                            onSetActiveContext={setActiveAuthorContext}
                            onDeleteAuthorVoice={deleteAuthorVoice}
                            onDeleteVoiceSuite={deleteVoiceSuite}
                        />
                    </div>
                );
            case 'voice':
                return (
                    <div className={managerClass}>
                        <div className={glowClass} />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-accent-indigo/10 flex items-center justify-center border border-accent-indigo/20">
                                    <Users className="w-3.5 h-3.5 text-accent-indigo" />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface/60">Character Resonance</span>
                            </div>
                            <GripVertical className="w-3.5 h-3.5 text-on-surface-variant/40 cursor-grab active:cursor-grabbing hover:text-accent-indigo transition-colors" />
                        </div>
                        <VoiceProfileManager 
                            voiceProfiles={availableVoices}
                            onAddVoiceProfile={addVoiceProfile}
                            onDeleteVoiceProfile={deleteVoiceProfile}
                        />
                    </div>
                );
            case 'lore':
                return (
                    <div className={managerClass}>
                        <div className={glowClass} />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-accent-teal/10 flex items-center justify-center border border-accent-teal/20">
                                    <BookOpen className="w-3.5 h-3.5 text-accent-teal" />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface/60">World Axioms</span>
                            </div>
                            <GripVertical className="w-3.5 h-3.5 text-on-surface-variant/40 cursor-grab active:cursor-grabbing hover:text-accent-teal transition-colors" />
                        </div>
                        <LoreContextManager 
                            loreEntries={availableLore} 
                            onAddLoreEntry={addLoreEntry} 
                            onDeleteLoreEntry={deleteLoreEntry}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 overflow-y-auto animate-in fade-in duration-700 custom-scrollbar pr-4 pb-12">
            {/* Background decorative blurs */}
            <div className="fixed top-40 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-40 left-0 w-96 h-96 bg-accent-indigo/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-primary-glow animate-pulse" />
                        <span className="text-[9px] font-medium uppercase tracking-wider text-primary/60">The Sovereign Archive</span>
                    </div>
                    <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">Context</h3>
                    <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-wider font-medium">The immutable source of truth for your narrative construct.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAutoDetect}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20 transition-all shadow-xl group"
                    >
                        <Zap className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        <span className="text-[9px] font-bold tracking-wide uppercase">Auto-Detect Scene Context</span>
                    </button>
                    <button
                        onClick={() => setShowGraph(!showGraph)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all shadow-xl ${showGraph ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-on-surface hover:bg-white/10'}`}
                    >
                        <Network className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-medium tracking-wide">
                            {showGraph ? 'Hide Semantic Graph' : 'Show Semantic Graph'}
                        </span>
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl">
                        <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
                        <span className="text-[9px] font-medium text-on-surface tracking-wide">
                            {activeLoreCount + activeVoiceCount + activeAuthorCount} Active Anchors
                        </span>
                    </div>
                </div>
            </div>

            {showGraph && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 400 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-12 w-full"
                >
                    <SemanticGraph 
                        loreEntries={loreEntries} 
                        voiceProfiles={voiceProfiles} 
                    />
                </motion.div>
            )}

            {frayingIssues.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 bg-primary/5 backdrop-blur-2xl rounded-xl border border-primary/20 p-4 shadow-2xl relative overflow-hidden group/echo"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shadow-primary-glow">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <h4 className="font-headline text-lg font-bold text-on-surface">Echo's Intuition</h4>
                            <p className="text-[9px] text-primary/60 font-medium uppercase tracking-wider">Continuity suggestions for the current draft.</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 relative z-10">
                        {frayingIssues.map((issue, idx) => (
                            <motion.div 
                                key={idx} 
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-xl hover:border-primary/40 transition-all cursor-default group/issue"
                            >
                                <AlertTriangle className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-medium text-on-surface leading-none">
                                    {issue.suggestedProfileName || issue.message}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="context-managers" direction="vertical">
                    {(provided) => (
                        <div 
                            {...provided.droppableProps} 
                            ref={provided.innerRef}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full"
                        >
                            {order.map((type, index) => (
                                <Draggable key={type} draggableId={type} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={type === 'lore' ? 'lg:col-span-2' : ''}
                                        >
                                            {renderManager(type)}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
});
