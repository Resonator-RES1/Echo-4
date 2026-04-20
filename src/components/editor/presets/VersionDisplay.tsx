import React, { useState, useEffect } from 'react';
import { 
    Loader2, Copy, Pencil, Eye, Maximize2, Minimize2, X, 
    ChevronLeft, ChevronRight, CheckCircle, FileText, Activity,
    AlertTriangle, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { RefinedVersion, FocusArea } from '../../../types';

interface VersionDisplayProps {
    mode: string;
    isRefining: boolean;
    reviewOutput: RefinedVersion | null;
    setReviewOutput: (output: any) => void;
    currentVersion: RefinedVersion;
    currentVersionIndex: number;
    versionHistory: RefinedVersion[];
    setCurrentVersionIndex: (index: number) => void;
    onUpdateVersion: (index: number, content: string) => void;
    onAcceptVersion: (version: RefinedVersion) => void;
    onShowComparison: () => void;
    setShowConflicts: (show: boolean) => void;
    onClearVersionHistory: () => void;
    onDeleteVersion: (id: string) => void;
    showToast: (message: string) => void;
    setFocusAreas: (areas: FocusArea[]) => void;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = React.memo(({
    mode, isRefining, reviewOutput, setReviewOutput, currentVersion, 
    currentVersionIndex, versionHistory, setCurrentVersionIndex, 
    onUpdateVersion, onAcceptVersion, onShowComparison, setShowConflicts, onClearVersionHistory, onDeleteVersion, showToast, setFocusAreas
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [viewMode, setViewMode] = useState<'full' | 'surgical'>('surgical');
    const [prevVersionId, setPrevVersionId] = useState<string | undefined>(currentVersion?.id);
    const [prevMode, setPrevMode] = useState(mode);

    if (currentVersion?.id !== prevVersionId) {
        setPrevVersionId(currentVersion?.id);
        setViewMode(currentVersion?.isSurgical ? 'surgical' : 'full');
    }

    if (mode !== prevMode) {
        setPrevMode(mode);
        if (mode !== 'collaborative') {
            setIsEditing(false);
        }
    }

    const handleCopy = async () => {
        const textToCopy = (mode === 'review' || mode === 'reaction') ? reviewOutput?.text : currentVersion?.text;
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            showToast("Copied to clipboard!");
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showToast("Failed to copy text.");
        }
    };

    const containerClasses = `
        bg-surface-container-low rounded-[0.75rem] border border-outline-variant/20 flex flex-col flex-grow shadow-sm
        ${(mode === 'review' || mode === 'reaction') ? 'bg-blue-50/10 border-blue-200/30' : ''}
        ${isExpanded
            ? 'fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-surface-container-highest/95 backdrop-blur-md shadow-2xl min-h-0'
            : 'min-h-[300px]'}
        transition-all duration-300 ease-in-out
    `;

    const textToShow = (viewMode === 'surgical' && currentVersion?.isSurgical) 
        ? currentVersion.refinedSelection 
        : currentVersion?.text;

    const isSurgicalMode = currentVersion?.isSurgical;

    return (
        <div className={containerClasses}>
            <div className="p-3 border-b border-outline-variant/20 flex justify-between items-center flex-shrink-0 bg-surface-container-highest/30 rounded-t-[0.75rem]">
                <div className="flex items-center gap-3">
                    <h3 className="font-headline text-lg text-primary font-semibold tracking-tight flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Echo Archive
                    </h3>
                    
                    {isSurgicalMode && (
                        <div className="flex items-center bg-surface-container-highest rounded-full p-0.5 border border-outline-variant/20 ml-2">
                            <button 
                                onClick={() => setViewMode('surgical')}
                                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${viewMode === 'surgical' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                Snippet
                            </button>
                            <button 
                                onClick={() => setViewMode('full')}
                                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${viewMode === 'full' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                Full Draft
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    {textToShow && !isRefining && (
                        <>
                            <button onClick={handleCopy} title="Copy to Clipboard" className="flex items-center gap-1.5 p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                <Copy className="w-4 h-4" />
                                <span className="text-xs font-label uppercase">Copy</span>
                            </button>
                            <button onClick={() => setIsEditing(!isEditing)} title={isEditing ? "Preview Changes" : "Edit Text"} className="flex items-center gap-1.5 p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                {isEditing ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                                <span className="text-xs font-label uppercase">{isEditing ? 'Preview' : 'Edit'}</span>
                            </button>
                            <button onClick={onShowComparison} title="View Side-by-Side Diff" className="flex items-center gap-1.5 p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                <Activity className="w-4 h-4" />
                                <span className="text-xs font-label uppercase">Compare</span>
                            </button>
                            {currentVersion.conflicts && currentVersion.conflicts.length > 0 && (
                                <button onClick={() => setShowConflicts(true)} title="View Lore Conflicts" className="flex items-center gap-1.5 p-1.5 text-amber-500 hover:text-amber-600 rounded-[0.5rem] hover:bg-amber-500/10 transition-colors">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-xs font-label uppercase">Conflicts</span>
                                </button>
                            )}
                            <button 
                                onClick={() => {
                                    if (window.confirm("Delete this specific version?")) {
                                        onDeleteVersion(currentVersion.id);
                                        if (currentVersionIndex > 0) {
                                            setCurrentVersionIndex(currentVersionIndex - 1);
                                        }
                                    }
                                }} 
                                title="Delete Current Version" 
                                className="flex items-center gap-1.5 p-1.5 text-error hover:text-error/80 rounded-[0.5rem] hover:bg-error/10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                <span className="text-xs font-label uppercase">Delete</span>
                            </button>
                            <button onClick={onClearVersionHistory} title="Clear Archive" className="flex items-center gap-1.5 p-1.5 text-error hover:text-error/80 rounded-[0.5rem] hover:bg-error/10 transition-colors">
                                <Activity className="w-4 h-4" />
                                <span className="text-xs font-label uppercase">Clear All</span>
                            </button>
                            <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Shrink Panel" : "Expand Panel"} className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors">
                                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                            {isExpanded && <button onClick={() => setIsExpanded(false)} title="Close" className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-[0.5rem] hover:bg-surface-container-highest transition-colors"><X className="w-4 h-4" /></button>}
                        </>
                    )}
                    {versionHistory.length > 0 && (
                        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-outline-variant/20">
                            <button onClick={() => setCurrentVersionIndex(Math.max(0, currentVersionIndex - 1))} disabled={currentVersionIndex <= 0} className="p-1 rounded-[0.5rem] hover:bg-surface-container-highest disabled:opacity-50 text-on-surface-variant hover:text-on-surface transition-colors"><ChevronLeft className="w-4 h-4"/></button>
                            <span className="text-xs font-mono text-on-surface-variant font-medium">{currentVersionIndex + 1} / {versionHistory.length}</span>
                            <button onClick={() => setCurrentVersionIndex(Math.min(versionHistory.length - 1, currentVersionIndex + 1))} disabled={currentVersionIndex >= versionHistory.length - 1} className="p-1 rounded-[0.5rem] hover:bg-surface-container-highest disabled:opacity-50 text-on-surface-variant hover:text-on-surface transition-colors"><ChevronRight className="w-4 h-4"/></button>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
                {isRefining ? (
                    <div className="flex justify-center items-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary"/></div>
                ) : isEditing ? (
                    <textarea
                        value={textToShow || ''}
                        onChange={(e) => onUpdateVersion(currentVersionIndex, e.target.value)}
                        className="w-full h-full bg-surface-container-highest/30 border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 p-3 rounded-[0.5rem] transition-all focus:outline-none resize-none leading-relaxed whitespace-pre-wrap"
                        autoFocus
                    />
                ) : textToShow ? (
                        <div className="space-y-6">
                            {isSurgicalMode && viewMode === 'surgical' && (
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                                    <div className="flex items-center gap-2 text-primary mb-3">
                                        <Zap className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Surgical Audit View</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">Original Selection</span>
                                            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/10 text-sm italic text-on-surface-variant line-clamp-4 overflow-y-auto max-h-40">
                                                {currentVersion.originalSelection}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Audited Result</span>
                                            <div className="p-3 bg-surface-container-highest/40 rounded-lg border border-primary/10 text-sm font-medium text-on-surface line-clamp-4 overflow-y-auto max-h-40">
                                                {currentVersion.refinedSelection}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="relative">
                                <div className="prose prose-invert max-w-none whitespace-pre-wrap break-words text-on-surface p-4 bg-surface-container-highest/20 rounded-xl border border-outline-variant/20 prose-headings:text-primary prose-headings:font-bold">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{textToShow}</ReactMarkdown>
                                </div>
                            
                            {currentVersion.conflicts && currentVersion.conflicts.length > 0 && (
                                <div className="absolute -left-2 top-0 flex flex-col gap-2">
                                    {/* Conflict icons removed */}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-on-surface-variant/70 italic text-center mt-8">Audited versions of your draft will appear here.</p>
                )}
            </div>
            {textToShow && (
                <div className="p-3 border-t border-outline-variant/20 flex items-center justify-center bg-surface-container-highest/10 rounded-b-[0.75rem]">
                    <button 
                        onClick={() => { 
                            onAcceptVersion(currentVersion); 
                            showToast("Version accepted and stored in Manuscript."); 
                        }} 
                        className="flex items-center gap-2 text-xs font-label uppercase tracking-wider px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary-fixed rounded-full font-bold shadow-sm transition-all"
                    >
                        <CheckCircle className="w-4 h-4" /> 
                        Accept Version
                    </button>
                </div>
            )}
        </div>
    );
});
