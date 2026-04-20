import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Info, Zap, Search, Undo2, Check, Clock, Users, BrainCircuit, Loader2 } from 'lucide-react';
import { LoreEntry, VoiceProfile, Scene, CalendarConfig, ContinuityIssue, ScannerInstances } from '../../types';
import { scanForContext, performLocalScan } from '../../utils/contextScanner';
import { checkConsistencyWithAI } from '../../engines/gemini/consistency';

interface ContinuityGuardProps {
    draft: string;
    loreEntries: LoreEntry[];
    voiceProfiles: VoiceProfile[];
    currentScene?: Scene;
    calendarConfig?: CalendarConfig;
    scanner?: ScannerInstances | null;
    onActivateLore: (id: string) => void;
    onActivateVoice: (id: string) => void;
    onViewLore?: (id: string) => void;
    onFix: (original: string, replacement: string) => void;
    showToast: (message: string) => void;
    onIssuesUpdate?: (issues: ContinuityIssue[]) => void;
    onScanningChange?: (isScanning: boolean) => void;
}

const getIssueIcon = (type: string) => {
    switch (type) {
        case 'timeline': return <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />;
        case 'social': return <Users className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />;
        case 'conceptual': return <Zap className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />;
        case 'lore':
        case 'general': return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />;
        default: return <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />;
    }
};

export const ContinuityGuard: React.FC<ContinuityGuardProps> = React.memo(({
    draft,
    loreEntries,
    voiceProfiles,
    currentScene,
    calendarConfig,
    scanner,
    onActivateLore,
    onActivateVoice,
    onViewLore,
    onFix,
    showToast,
    onIssuesUpdate,
    onScanningChange
}) => {
    const [resolvedFixes, setResolvedFixes] = useState<{ id: string, original: string, replacement: string }[]>([]);

    // 1. Detect Mentions (Hard Matches) - Offloaded to Worker
    const [detectedIds, setDetectedIds] = useState<string[]>([]);
    const detectedLoreIds = detectedIds;
    const detectedVoiceIds = detectedIds;

    const detectedLore = useMemo(() => 
        loreEntries.filter(e => detectedLoreIds.includes(e.id)), 
        [loreEntries, detectedLoreIds]
    );
    
    const detectedVoices = useMemo(() => 
        voiceProfiles.filter(v => detectedVoiceIds.includes(v.id)), 
        [voiceProfiles, detectedVoiceIds]
    );

    // 2. Local Heuristic Warnings (Fast) - Debounced 1s
    const [localWarnings, setLocalWarnings] = useState<ContinuityIssue[]>([]);
    const [aiIssues, setAiIssues] = useState<ContinuityIssue[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isAiScanning, setIsAiScanning] = useState(false);
    const workerRef = useRef<Worker | null>(null);

    const runDeepAudit = useCallback(async () => {
        setIsAiScanning(true);
        showToast("Running Deep AI Continuity Audit...");
        try {
            const issues = await checkConsistencyWithAI(draft, loreEntries, voiceProfiles, currentScene, calendarConfig);
            setAiIssues(issues);
            if (issues.length === 0) {
                showToast("Deep Audit complete: No issues found.");
            } else {
                showToast(`Deep Audit complete: Found ${issues.length} potential issues.`);
            }
        } catch (error) {
            showToast("Deep Audit failed. Please try again.");
        } finally {
            setIsAiScanning(false);
        }
    }, [draft, loreEntries, voiceProfiles, currentScene, showToast, calendarConfig]);

    useEffect(() => {
        workerRef.current = new Worker(new URL('../../utils/scanner.worker.ts', import.meta.url), { type: 'module' });
        
        workerRef.current.onmessage = (e) => {
            const { type, issues, detectedIds: workerDetectedIds } = e.data;
            if (type === 'SCAN_COMPLETE') {
                setLocalWarnings(issues);
                if (workerDetectedIds) setDetectedIds(workerDetectedIds);
                setIsScanning(false);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    useEffect(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({
                type: 'INIT',
                payload: { entries: loreEntries, voices: voiceProfiles }
            });
        }
    }, [loreEntries, voiceProfiles]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (workerRef.current) {
                setIsScanning(true);
                workerRef.current.postMessage({
                    type: 'SCAN',
                    payload: {
                        text: draft,
                        loreEntries,
                        activeVoices: voiceProfiles.filter(v => v.isActive),
                        currentScene,
                        calendarConfig
                    }
                });
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [draft, loreEntries, voiceProfiles, currentScene, calendarConfig]);

    // Raw issues before filtering resolved ones
    const rawIssues = useMemo(() => {
        // Combine local and AI issues, avoiding exact duplicates if any
        const combined = [...localWarnings];
        aiIssues.forEach(aiIssue => {
            if (!combined.some(c => c.id === aiIssue.id || (c.message === aiIssue.message && c.type === aiIssue.type))) {
                combined.push(aiIssue);
            }
        });
        return combined;
    }, [localWarnings, aiIssues]);

    // Combine all active issues (filtered)
    const allIssues = useMemo(() => {
        // Filter out resolved
        return rawIssues.filter(w => !resolvedFixes.some(r => r.id === w.id));
    }, [rawIssues, resolvedFixes]);

    // Categorized Issues
    const categorizedIssues = useMemo(() => {
        return {
            timeline: allIssues.filter(i => i.type === 'timeline'),
            social: allIssues.filter(i => i.type === 'social'),
            lore: allIssues.filter(i => i.type === 'lore' || i.type === 'general'),
            voice: allIssues.filter(i => i.type === 'voice'),
            conceptual: allIssues.filter(i => i.type === 'conceptual')
        };
    }, [allIssues]);

    // 3. Inactive Mentions (Blind Spots)
    const inactiveMentions = useMemo(() => {
        const lore = detectedLore.filter(e => !e.isActive);
        const voices = detectedVoices.filter(v => !v.isActive);
        return { lore, voices };
    }, [detectedLore, detectedVoices]);

    const totalIssues = allIssues.length + inactiveMentions.lore.length + inactiveMentions.voices.length;

    useEffect(() => {
        onIssuesUpdate?.(allIssues);
    }, [allIssues, onIssuesUpdate]);

    useEffect(() => {
        onScanningChange?.(isScanning);
    }, [isScanning, onScanningChange]);

    useEffect(() => {
        setResolvedFixes(prev => {
            const stillRelevant = prev.filter(fix => rawIssues.some(w => w.id === fix.id));
            if (stillRelevant.length === prev.length) return prev;
            return stillRelevant;
        });
    }, [rawIssues]);

    const handleApplyFix = useCallback((issue: ContinuityIssue) => {
        if (!issue.actionable) return;
        onFix(issue.actionable.original, issue.actionable.replacement);
        setResolvedFixes(prev => [...prev, { id: issue.id, original: issue.actionable!.original, replacement: issue.actionable!.replacement }]);
        showToast(`Replaced "${issue.actionable.original}" with "${issue.actionable.replacement}"`);
    }, [onFix, showToast]);

    const handleRevertFix = useCallback((resolvedId: string) => {
        setResolvedFixes(prev => {
            const fix = prev.find(r => r.id === resolvedId);
            if (!fix) return prev;
            onFix(fix.replacement, fix.original);
            showToast(`Reverted "${fix.replacement}" back to "${fix.original}"`);
            return prev.filter(r => r.id !== resolvedId);
        });
    }, [onFix, showToast]);

    const renderIssueList = useCallback((issues: ContinuityIssue[], title: string, icon: React.ReactNode) => {
        if (issues.length === 0) return null;
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-on-surface/50">
                    {icon}
                    <span className="text-[9px] font-black uppercase tracking-widest">{title}</span>
                </div>
                <div className="space-y-2">
                    {issues.map((issue) => (
                        <div key={issue.id} className="p-3 rounded-xl bg-surface-container-highest/30 border border-outline-variant/10 flex flex-col gap-2">
                            <div className="flex gap-3">
                                {getIssueIcon(issue.type)}
                                <p className="text-xs text-on-surface-variant leading-relaxed">{issue.message}</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-1">
                                {issue.actionable && (
                                    <button 
                                        onClick={() => handleApplyFix(issue)}
                                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                                    >
                                        <Check className="w-3 h-3" />
                                        Fix
                                    </button>
                                )}
                                {issue.type === 'conceptual' && issue.linkedEntryId && (
                                    <button 
                                        onClick={() => {
                                            onActivateLore(issue.linkedEntryId!);
                                            showToast(`Activated conceptual context`);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                                    >
                                        <Zap className="w-3 h-3" />
                                        Activate
                                    </button>
                                )}
                                {issue.type === 'timeline' && issue.linkedEntryId && (
                                    <button 
                                        onClick={() => {
                                            onViewLore?.(issue.linkedEntryId!);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                                    >
                                        <Clock className="w-3 h-3" />
                                        View Context
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }, [handleApplyFix, onActivateLore, showToast, onViewLore]);

    return (
        <div className="bg-surface-container-low rounded-lg border border-outline-variant/20 overflow-hidden flex flex-col shadow-sm mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="p-4 border-b border-outline-variant/10 bg-surface-container-highest/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${totalIssues > 0 ? 'text-amber-500' : 'text-primary'}`} />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h3 className="font-label text-[9px] uppercase tracking-wider font-black text-on-surface/80">Narrative Auditor</h3>
                            {isScanning && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                </span>
                            )}
                        </div>
                        <p className="text-[8px] text-on-surface-variant/60 uppercase tracking-wider">
                            Scanning: Lore, Timeline, Social, Concepts
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={runDeepAudit}
                        disabled={isAiScanning}
                        className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-tighter hover:bg-primary/20 transition-all flex items-center gap-1 disabled:opacity-50"
                        title="Run Deep AI Continuity Audit"
                    >
                        {isAiScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                        Deep Audit
                    </button>
                    {(inactiveMentions.lore.length > 0 || inactiveMentions.voices.length > 0) && (
                        <button 
                            onClick={() => {
                                inactiveMentions.lore.forEach(l => onActivateLore(l.id));
                                inactiveMentions.voices.forEach(v => onActivateVoice(v.id));
                                showToast(`Activated ${inactiveMentions.lore.length + inactiveMentions.voices.length} profiles`);
                            }}
                            className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-tighter hover:bg-primary/20 transition-all"
                        >
                            Sync All
                        </button>
                    )}
                    {totalIssues > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase tracking-tighter">
                            {totalIssues} Alerts
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-6 max-h-[400px] overflow-y-auto scrollbar-thin">
                {/* 1. Blind Spots (Inactive Mentions) */}
                {(inactiveMentions.lore.length > 0 || inactiveMentions.voices.length > 0) && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-on-surface/50">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Blind Spots Detected</span>
                        </div>
                        <div className="space-y-2">
                            {inactiveMentions.lore.map(entry => (
                                <button 
                                    key={entry.id}
                                    onClick={() => { onActivateLore(entry.id); showToast(`Activated ${entry.title}`); }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-all group"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-bold text-on-surface">{entry.title}</span>
                                        <span className="text-[8px] text-amber-500/70 uppercase font-black">Lore Mentioned but Inactive</span>
                                    </div>
                                    <Zap className="w-3 h-3 text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                            {inactiveMentions.voices.map(voice => (
                                <button 
                                    key={voice.id}
                                    onClick={() => { onActivateVoice(voice.id); showToast(`Activated ${voice.name}`); }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-all group"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-bold text-on-surface">{voice.name}</span>
                                        <span className="text-[8px] text-amber-500/70 uppercase font-black">Voice Mentioned but Inactive</span>
                                    </div>
                                    <Zap className="w-3 h-3 text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Intelligence Audit (Categorized) */}
                {renderIssueList(categorizedIssues.timeline, 'Timeline Audit', <Clock className="w-3 h-3 text-amber-500" />)}
                {renderIssueList(categorizedIssues.social, 'Social Stakes', <Users className="w-3 h-3 text-amber-500" />)}
                {renderIssueList(categorizedIssues.lore, 'Lore Integrity', <Search className="w-3 h-3 text-primary" />)}
                {renderIssueList(categorizedIssues.voice, 'Voice Consistency', <Info className="w-3 h-3 text-primary" />)}
                {renderIssueList(categorizedIssues.conceptual, 'Thematic Context', <Zap className="w-3 h-3 text-primary" />)}

                {/* 3. Resolved Fixes (Revertible) */}
                {resolvedFixes.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-on-surface/50">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Resolved Issues</span>
                        </div>
                        <div className="space-y-2">
                            {resolvedFixes.map((fix) => (
                                <div key={`resolved-${fix.id}`} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-on-surface">Replaced "{fix.original}" with "{fix.replacement}"</span>
                                    </div>
                                    <button 
                                        onClick={() => handleRevertFix(fix.id)}
                                        className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
                                        title="Revert this change"
                                    >
                                        <Undo2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. Empty State */}
                {totalIssues === 0 && resolvedFixes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-on-surface">Narrative Integrity Verified</p>
                            <p className="text-[9px] text-on-surface-variant/60 max-w-[180px]">No contradictions, timeline anomalies, or social dissonance found.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
