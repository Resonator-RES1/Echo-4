import React, { useState, useMemo } from 'react';
import { 
    Clock, Trash2, History, 
    Bookmark, BookmarkCheck, BarChart3, Scissors, ArrowRightLeft,
    MoreVertical, Eye, Cpu, Target, ShieldCheck, Zap, AlertCircle,
    MessageSquareQuote, Waves, Smile, Network, Globe, MessagesSquare, Ghost, Brain
} from 'lucide-react';
import { LangDiffViewer } from './LangDiffViewer';
import { RefinedVersion } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useManuscriptStore } from '../../stores/useManuscriptStore';
import { useEditorUIStore } from '../../stores/useEditorUIStore';
import { useUIStore } from '../../stores/useUIStore';

const FOCUS_AREA_ICONS: Record<string, any> = {
    tone: MessageSquareQuote,
    rhythm: Waves,
    emotion: Smile,
    plot: Network,
    sensory: Eye,
    mythic: Globe,
    dialogue: MessagesSquare,
    voiceIntegrity: ShieldCheck,
    structural: Clock,
    subtext: Ghost,
    visceral: Zap,
    psychological: Brain,
};

const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

interface ArchivePanelProps {
    versionHistory: RefinedVersion[];
    currentVersionIndex: number;
    originalDraft: string;
    onSelectVersion: (index: number) => void;
    onDeleteVersion: (id: string) => void;
    onUpdateVersion?: (version: RefinedVersion) => void;
    onClearHistory: () => void;
    showToast: (message: string) => void;
    setActiveTab: (tab: WorkspaceTab) => void;
    setActiveReviewVersion?: (version: RefinedVersion | null) => void;
}

export const ArchivePanel: React.FC<ArchivePanelProps> = ({
    versionHistory,
    currentVersionIndex,
    originalDraft,
    onSelectVersion,
    onDeleteVersion,
    onUpdateVersion,
    onClearHistory,
    showToast,
    setActiveTab,
    setActiveReviewVersion
}) => {
    const { 
        updateVersion: storeUpdateVersion,
        clearVersionHistory: storeClearVersionHistory 
    } = useManuscriptStore();
    
    // ... rest of the component ...

    const [pinningId, setPinningId] = useState<string | null>(null);
    const [milestoneLabel, setMilestoneLabel] = useState('');
    const [compareGroups, setCompareGroups] = useState<Record<string, boolean>>({});
    const [langDiffThreadId, setLangDiffThreadId] = useState<string | null>(null);

    // Task 1: Data Architecture (Grouping Logic)
    const groupedHistory = useMemo(() => {
        const groups = versionHistory.reduce((acc, version) => {
            const title = version.title || "Unlabeled Audits";
            if (!acc[title]) acc[title] = [];
            acc[title].push(version);
            return acc;
        }, {} as Record<string, RefinedVersion[]>);

        return Object.keys(groups)
            .map(title => ({
                title,
                versions: groups[title].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
                latestTimestamp: Math.max(...groups[title].map(v => new Date(v.timestamp).getTime()))
            }))
            .sort((a, b) => b.latestTimestamp - a.latestTimestamp);
    }, [versionHistory]);

    if (versionHistory.length === 0) {
        return (
            <div className="flex flex-col flex-1 min-h-0 items-center justify-center text-center p-4 animate-in fade-in duration-700">
                <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
                    <History className="w-10 h-10 text-on-surface-variant/10" />
                </div>
                <h3 className="font-headline text-2xl font-light mb-2">The Ledger is Silent</h3>
                <p className="text-on-surface-variant max-w-xs mx-auto text-sm leading-relaxed italic">
                    Your previous audits will be stored here for review and comparison.
                </p>
            </div>
        );
    }

    const toggleCompare = (title: string) => {
        setCompareGroups(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const handlePin = (version: RefinedVersion) => {
        (onUpdateVersion || storeUpdateVersion)({
            ...version,
            isPinned: true,
            milestoneLabel: milestoneLabel || 'MILESTONE'
        });
        setPinningId(null);
        setMilestoneLabel('');
        showToast(`Milestone "${milestoneLabel || 'MILESTONE'}" pinned.`);
    };

    const handleUnpin = (version: RefinedVersion) => {
        (onUpdateVersion || storeUpdateVersion)({
            ...version,
            isPinned: false,
            milestoneLabel: undefined
        });
        showToast("Milestone unpinned.");
    };

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 overflow-hidden animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex-none flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="space-y-1">
                    <h3 className="font-headline text-3xl font-bold">Selection Hub</h3>
                    <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-wider font-black">Comparative analysis and surgical entry points.</p>
                </div>
                <button 
                    onClick={onClearHistory}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant/10 text-[9px] font-black uppercase tracking-wider text-on-surface-variant/60 hover:bg-accent-rose/10 hover:text-accent-rose hover:border-accent-rose/30 rounded-xl transition-all shadow-sm active:scale-95 group"
                >
                    <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span>Clear Ledger</span>
                </button>
            </div>

            {/* Grouped Content */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-8 pb-12">
                {groupedHistory.map((group) => {
                    const deltas = group.versions.map(v => (v.wordCountDelta?.added || 0) - (v.wordCountDelta?.removed || 0));
                    const minDelta = Math.min(...deltas);
                    const maxDelta = Math.max(...deltas);
                    const deltaSpan = minDelta === maxDelta 
                        ? `${minDelta > 0 ? '+' : ''}${minDelta}`
                        : `${minDelta > 0 ? '+' : ''}${minDelta} to ${maxDelta > 0 ? '+' : ''}${maxDelta}`;

                    const isComparing = compareGroups[group.title];

                    return (
                        <div key={group.title} className="space-y-4">
                            {/* Group Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low/40 backdrop-blur-md rounded-lg border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <h4 className="text-sm font-bold text-on-surface tracking-tight">{group.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">
                                                {group.versions.length} {group.versions.length === 1 ? 'Version' : 'Versions'}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-on-surface-variant/20" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">
                                                Delta Span: {deltaSpan}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleCompare(group.title)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                        isComparing 
                                            ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                                            : 'bg-surface-container-high/40 backdrop-blur-md text-on-surface-variant border-white/5 hover:bg-surface-container-highest/60'
                                    }`}
                                >
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                    <span>Comparative Analytics</span>
                                </button>
                            </div>

                            {/* Comparison UI */}
                            <AnimatePresence>
                                {isComparing && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-surface-container-low/30 backdrop-blur-xl rounded-lg p-4 border border-white/5 mb-6 overflow-x-auto custom-scrollbar shadow-2xl">
                                            <table className="w-full text-left border-separate border-spacing-y-3 min-w-[600px]">
                                                <thead>
                                                    <tr className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">
                                                        <th className="px-6 py-2">Surgical Lineage</th>
                                                        <th className="px-6 py-2">Voice Resonance</th>
                                                        <th className="px-6 py-2">Lore Compliance</th>
                                                        <th className="px-6 py-2">Fidelity Index</th>
                                                        <th className="px-6 py-2">Delta</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.versions.map((v) => (
                                                        <tr key={v.id} className="bg-surface-container-high/20 hover:bg-surface-container-high/40 transition-colors rounded-xl overflow-hidden group/row">
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[9px] font-black text-on-surface uppercase tracking-wider">
                                                                        {formatRelativeTime(v.timestamp)}
                                                                    </span>
                                                                    <span className="text-[8px] font-medium text-on-surface-variant/40 uppercase tracking-widest">
                                                                        {v.isSurgical ? 'Surgical Graft' : 'Full Audit'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-2 w-16 bg-surface-container-highest rounded-full overflow-hidden border border-white/5">
                                                                        <motion.div 
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${v.metrics?.voice_consistency.score || 0}%` }}
                                                                            className="h-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                                                                        />
                                                                    </div>
                                                                    <span className="text-[9px] font-black text-accent-emerald tracking-tighter">{v.metrics?.voice_consistency.score || 0}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-2 w-16 bg-surface-container-highest rounded-full overflow-hidden border border-white/5">
                                                                        <motion.div 
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${v.audit?.loreCompliance || 0}%` }}
                                                                            className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" 
                                                                        />
                                                                    </div>
                                                                    <span className="text-[9px] font-black text-primary tracking-tighter">{v.audit?.loreCompliance || 0}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${ (v.audit?.voiceFidelityScore || 0) > 85 ? 'bg-accent-emerald' : 'bg-accent-amber'} animate-pulse`} />
                                                                    <span className="text-[9px] font-black text-on-surface-variant/80 tracking-tighter">
                                                                        {v.audit?.voiceFidelityScore || 0}%
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {v.wordCountDelta ? (
                                                                    <div className="flex items-center gap-1 text-[9px] font-black">
                                                                        <span className="text-accent-emerald">+{v.wordCountDelta.added}</span>
                                                                        <span className="text-on-surface-variant/20">/</span>
                                                                        <span className="text-error">-{v.wordCountDelta.removed}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[8px] text-on-surface-variant/20 font-black uppercase tracking-widest">0</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Entry Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 relative">
                                {/* Lineage Thread */}
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent -ml-2 hidden xl:block" />
                                
                                {group.versions.map((version) => {
                                    const isCurrent = versionHistory.findIndex(v => v.id === version.id) === currentVersionIndex;
                                    const activeContext = version.activeContext || version.usedProfiles;
                                    
                                    return (
                                        <div 
                                            key={version.id}
                                            className={`group relative flex flex-col p-5 rounded-xl transition-all duration-500 border backdrop-blur-sm ${
                                                isCurrent 
                                                    ? 'bg-surface-container-high/80 border-primary/40 ring-1 ring-primary/20 shadow-[0_20px_50px_rgba(var(--primary-rgb),0.1)] scale-[1.02] z-10' 
                                                    : 'bg-surface-container-low/40 border-white/5 hover:bg-surface-container-high/60 hover:border-outline-variant/30 hover:shadow-2xl hover:-translate-y-1'
                                            }`}
                                        >
                                            {/* Header: Metadata & Engine */}
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]' : 'bg-on-surface-variant/20'}`} />
                                                        <span className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-wider">
                                                            {formatRelativeTime(version.timestamp)}
                                                        </span>
                                                    </div>
                                                    {version.isPinned && (
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full self-start border border-primary/20">
                                                            <BookmarkCheck className="w-3 h-3 fill-current" />
                                                            <span>{version.milestoneLabel || 'MASTER'}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2 bg-surface-container-highest/40 px-3 py-1.5 rounded-xl border border-white/5">
                                                        <Cpu className="w-3 h-3 text-primary/60" />
                                                        <span className="text-[9px] font-black text-on-surface-variant/60 uppercase tracking-widest">
                                                            {version.isSurgical ? 'Surgical' : 'Full Audit'}
                                                        </span>
                                                    </div>
                                                    {version.wordCountDelta && (
                                                        <div className="flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 bg-surface-container-highest/20 rounded-lg">
                                                            <span className="text-accent-emerald">+{version.wordCountDelta.added}</span>
                                                            <span className="text-on-surface-variant/10">|</span>
                                                            <span className="text-error">-{version.wordCountDelta.removed}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Summary / Manifest Snippet */}
                                            <div className="space-y-4 mb-6">
                                                <p className="text-[12px] text-on-surface font-medium leading-relaxed line-clamp-3">
                                                    {version.summary || "No summary provided for this audit."}
                                                </p>
                                                
                                                {/* Mini Manifest (Context used) */}
                                                {(activeContext && (
                                                    (activeContext as any).loreProfiles?.length || 
                                                    (activeContext as any).loreEntries?.length || 
                                                    (activeContext as any).characterVoices?.length
                                                )) && (
                                                    <div className="flex flex-wrap gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                                                        {(activeContext as any).characterVoices?.slice(0, 2).map((v: string) => (
                                                            <div key={v} className="px-2 py-0.5 bg-accent-emerald/5 border border-accent-emerald/20 rounded-md text-[8px] font-bold text-accent-emerald flex items-center gap-1">
                                                                <ShieldCheck className="w-2.5 h-2.5" /> {v}
                                                            </div>
                                                        ))}
                                                        {((activeContext as any).loreProfiles || (activeContext as any).loreEntries)?.slice(0, 2).map((l: string) => (
                                                            <div key={l} className="px-2 py-0.5 bg-accent-indigo/5 border border-accent-indigo/20 rounded-md text-[8px] font-bold text-accent-indigo flex items-center gap-1">
                                                                <Target className="w-2.5 h-2.5" /> {l}
                                                            </div>
                                                        ))}
                                                        {(activeContext as any).focusAreas?.slice(0, 3).map((f: string) => {
                                                            const Icon = FOCUS_AREA_ICONS[f] || Target;
                                                            return (
                                                                <div key={f} className="px-2 py-0.5 bg-primary/5 border border-primary/20 rounded-md text-[8px] font-black uppercase tracking-tighter text-primary flex items-center gap-1">
                                                                    <Icon className="w-2.5 h-2.5" />
                                                                    {f}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Paths */}
                                            <div className="mt-auto flex items-center gap-2.5 pt-4 border-t border-white/5">
                                                {/* Path 3: Surgery (PRIMARY CTA) */}
                                                <button 
                                                    onClick={() => {
                                                        const idx = versionHistory.findIndex(v => v.id === version.id);
                                                        onSelectVersion(idx);
                                                        setActiveReviewVersion(version);
                                                        setActiveTab('workbench');
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2.5 py-3 bg-primary text-on-primary rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 group/btn"
                                                >
                                                    <Scissors className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                                    <span>Perform Surgery</span>
                                                </button>
                                                
                                                <div className="flex items-center gap-1.5">
                                                    <button 
                                                        onClick={() => {
                                                            const idx = versionHistory.findIndex(v => v.id === version.id);
                                                            onSelectVersion(idx);
                                                            setActiveReviewVersion(version);
                                                            setActiveTab('report');
                                                        }}
                                                        className="p-3 bg-surface-container-highest/40 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all border border-white/5"
                                                        title="Analytical Report"
                                                    >
                                                        <BarChart3 className="w-4 h-4" />
                                                    </button>

                                                    <button 
                                                        onClick={() => {
                                                            const idx = versionHistory.findIndex(v => v.id === version.id);
                                                            onSelectVersion(idx);
                                                            setActiveReviewVersion(version);
                                                            setActiveTab('polished');
                                                        }}
                                                        className="p-3 bg-surface-container-highest/40 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all border border-white/5"
                                                        title="Full Polished View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    
                                                    {version.threadId && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Since ArchivePanel doesn't have a state for this modal, we can either pass it up or handle it here
                                                                // Actually let's just trigger a custom event or store. For now, we'll use a local state.
                                                                // Wait, I will add a state to this component for selectedThreadId
                                                                setLangDiffThreadId(version.threadId || null);
                                                            }}
                                                            className="p-3 bg-surface-container-highest/40 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all border border-white/5 flex items-center justify-center"
                                                            title="LangDiff Logic Timeline"
                                                        >
                                                            <Cpu className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Secondary Actions */}
                                                <div className="flex items-center gap-1 ml-auto">
                                                    <button 
                                                        onClick={() => {
                                                            if (version.isPinned) handleUnpin(version);
                                                            else setPinningId(version.id);
                                                        }}
                                                        className={`p-2.5 rounded-xl transition-all ${version.isPinned ? 'text-primary bg-primary/10' : 'text-on-surface-variant/20 hover:text-primary hover:bg-primary/10'}`}
                                                    >
                                                        <Bookmark className={`w-4 h-4 ${version.isPinned ? 'fill-current' : ''}`} />
                                                    </button>
                                                    <button 
                                                        onClick={() => onDeleteVersion(version.id)}
                                                        className="p-2.5 rounded-xl text-on-surface-variant/10 hover:text-error hover:bg-error/10 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Pinning Input Overlay */}
                                            <AnimatePresence>
                                                {pinningId === version.id && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute inset-0 bg-surface-container-highest/95 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 z-10"
                                                    >
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-3">Label Milestone</span>
                                                        <div className="flex w-full gap-2">
                                                            <input 
                                                                type="text"
                                                                value={milestoneLabel}
                                                                onChange={e => setMilestoneLabel(e.target.value)}
                                                                placeholder="e.g. MASTER"
                                                                className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/50"
                                                                autoFocus
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') handlePin(version);
                                                                    if (e.key === 'Escape') setPinningId(null);
                                                                }}
                                                            />
                                                            <button 
                                                                onClick={() => handlePin(version)}
                                                                className="p-2 bg-primary text-on-primary rounded-xl"
                                                            >
                                                                <BookmarkCheck className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <button 
                                                            onClick={() => setPinningId(null)}
                                                            className="mt-4 text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-on-surface"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* LangDiff Viewer Modal */}
            <AnimatePresence>
                {langDiffThreadId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md p-4 md:p-12 flex items-center justify-center"
                    >
                        <div className="w-full max-w-5xl h-[85vh]">
                            <LangDiffViewer 
                                threadId={langDiffThreadId} 
                                onClose={() => setLangDiffThreadId(null)} 
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

