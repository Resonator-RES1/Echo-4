import React, { useState } from 'react';
import { 
    FileText, 
    Copy, 
    Check, 
    Sparkles, 
    Mic2, 
    ShieldAlert, 
    HelpCircle, 
    Shield, 
    Anchor, 
    Search, 
    Layers,
    Scissors,
    CheckCircle2,
    Activity,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Target,
    Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RefinedVersion, LoreCorrection } from '../../types';
import { SimpleSideBySideDiff } from '../editor/SimpleSideBySideDiff';
import { ReportMetrics } from './ReportMetrics';
import { ReportAnalysis } from './ReportAnalysis';
import { ReportAudit } from './ReportAudit';
import { ReportRestraintLog } from './ReportRestraintLog';
import { ReportSelfCorrections } from './ReportSelfCorrections';
import { ReportVoiceResonance } from './ReportVoiceResonance';
import { ReportLoreCorrections } from './ReportLoreCorrections';
import { ReportLoreFraying } from './ReportLoreFraying';
import { ReportContext } from './ReportContext';
import { ReportStrategy } from './ReportStrategy';
import { ReportArchitectLog } from './ReportArchitectLog';
import { formatReportForCopy } from '../../utils/reportFormatter';
import { useWorkbenchStore } from '../../stores/useWorkbenchStore';
import { useEditorUIStore } from '../../stores/useEditorUIStore';
import { EmptyState } from '../ui/EmptyState';
import { SurgicalTray } from './SurgicalTray';
import { SurgicalManifest } from './SurgicalManifest';

interface ReportPanelProps {
    version: RefinedVersion | null;
    original: string;
    onAccept: (version: RefinedVersion) => void;
    onRevertLore: () => void;
    onRevertSpecificLore?: (correction: LoreCorrection) => void;
    onRevertSelfCorrection?: (correction: any) => void;
    showToast: (message: string) => void;
    setActiveReviewVersion: (version: RefinedVersion | null) => void;
}

const ReportPanelComponent: React.FC<ReportPanelProps> = ({
    version,
    original,
    onAccept,
    onRevertLore,
    onRevertSpecificLore,
    onRevertSelfCorrection,
    showToast = () => {},
    setActiveReviewVersion
}) => {
    const [copied, setCopied] = useState(false);
    const [isManifestOpen, setIsManifestOpen] = useState(false);
    const [isArchitectOpen, setIsArchitectOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('verdict');
    const [reportViewMode, setReportViewMode] = useState<'friendly' | 'technical'>('friendly');

    const { setActiveTab } = useEditorUIStore();

    const appendCustomDirective = useWorkbenchStore(state => state.appendCustomDirective);
    const addSuggestion = useWorkbenchStore(state => state.addSuggestion);
    const loadReportIntoWorkbench = useWorkbenchStore(state => state.loadReportIntoWorkbench);
    const surgicalTray = useWorkbenchStore(state => state.surgicalTray);
    const clearTray = useWorkbenchStore(state => state.clearTray);

    const handleBatchCommit = (destination: 'workbench' | 'directives' = 'workbench') => {
        if (!version || surgicalTray.length === 0) return;

        if (destination === 'workbench') {
            // 1. Add all tray items to suggestion ledger
            surgicalTray.forEach(item => addSuggestion(item));

            // 2. Load report text
            loadReportIntoWorkbench(version);

            // 3. Navigate
            setActiveTab('workbench');
        } else {
            // Import all to directives
            surgicalTray.forEach(item => appendCustomDirective(item));
            showToast(`${surgicalTray.length} suggestions imported to Audit Directives.`);
        }

        // Clear tray
        clearTray();
    };

    // Diagnostic Issue Counts
    const issueCounts = {
        voice: version?.voiceAudits?.filter(a => {
            const score = a.resonanceScore > 10 ? a.resonanceScore / 10 : a.resonanceScore;
            return score < 7.0;
        }).length || 0,
        corrections: version?.loreCorrections?.length || 0,
        fraying: version?.loreFraying?.length || 0,
        audit: (version?.audit && (version.audit.voiceFidelityScore < 7 || version.audit.loreCompliance < 7)) ? 1 : 0
    };

    const allSections = [
        { id: 'verdict', icon: FileText, label: 'Verdict', category: 'friendly' },
        { id: 'diff', icon: Sparkles, label: 'Diff', category: 'friendly' },
        { id: 'self_corrections', icon: CheckCircle2, label: 'Self-Corrections', category: 'friendly', count: version?.selfCorrections?.length || 0, color: 'bg-accent-emerald' },
        { id: 'voice', icon: Mic2, label: 'Voice', category: 'friendly', count: issueCounts.voice, color: 'bg-accent-indigo' },
        { id: 'corrections', icon: ShieldAlert, label: 'Corrections', category: 'friendly', count: issueCounts.corrections, color: 'bg-error' },
        { id: 'fraying', icon: HelpCircle, label: 'Fraying', category: 'friendly', count: issueCounts.fraying, color: 'bg-accent-amber', hide: version?.isSurgical },
        { id: 'strategy', icon: Target, label: 'Strategy', category: 'technical', hide: !version?.audit?.strategy },
        { id: 'metrics', icon: BarChart3, label: 'Metrics', category: 'technical', hide: version?.isSurgical },
        { id: 'analysis', icon: Search, label: 'Analysis', category: 'technical' },
        { id: 'audit', icon: Shield, label: 'Audit', category: 'technical', count: issueCounts.audit, color: 'bg-error' },
        { id: 'restraint', icon: Anchor, label: 'Restraint', category: 'technical', hide: version?.isSurgical },
        { id: 'context', icon: Layers, label: 'Context', category: 'technical', hide: version?.isSurgical },
    ];

    const sections = allSections.filter(item => !item.hide && item.category === reportViewMode);

    React.useEffect(() => {
        if (!version) return;
        if (!sections.find(s => s.id === activeSection)) {
            setActiveSection(sections[0]?.id || 'verdict');
        }
    }, [reportViewMode, sections, activeSection, version]);

    if (!version) {
        return (
            <EmptyState 
                icon={BarChart3}
                title="No Audit Log Available"
                description="Audit your draft or select a version from The Ledger to view a detailed audit log."
            />
        );
    }

    if (version.text?.startsWith('Error:')) {
        return (
            <EmptyState 
                icon={Activity}
                title="Audit Failed"
                description="Check API Quota or network connection. The model was unable to complete the auditing process."
            />
        );
    }

    const currentIndex = sections.findIndex(s => s.id === activeSection);
    
    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % sections.length;
        setActiveSection(sections[nextIndex].id);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
        setActiveSection(sections[prevIndex].id);
    };

    return (
        <div data-testid="report-panel" className="flex flex-row flex-1 min-h-0 overflow-hidden bg-surface-container-lowest/20">
            {/* Surgical Minimap - Navigation Rail */}
            <div className="hidden md:flex w-16 flex-col items-center py-6 gap-4 border-r border-white/5 bg-surface-container-low/10 backdrop-blur-md z-30">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                </div>
                
                <div className="flex flex-col gap-1.5">
                    {sections.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`group relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary text-surface shadow-md shadow-primary/20' : 'text-on-surface-variant/40 hover:bg-white/5 hover:text-on-surface'}`}
                                title={item.label}
                            >
                                <item.icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                
                                {/* Diagnostic Pip */}
                                {item.count !== undefined && item.count > 0 && (
                                    <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ${item.color} border-2 border-surface-container-low flex items-center justify-center shadow-lg`}>
                                        <span className="text-[7px] font-black text-white">{item.count}</span>
                                    </div>
                                )}

                                {isActive && (
                                    <motion.div 
                                        layoutId="nav-glow"
                                        className="absolute -inset-1 bg-primary/20 blur-sm rounded-lg -z-10"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div 
                className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in fade-in duration-500 pb-0"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 px-6 pt-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-primary-glow animate-pulse" />
                            <span className="text-[9px] font-medium uppercase tracking-wider text-primary/60">Surgical Manifest</span>
                            <div className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[8px] font-bold text-primary uppercase tracking-widest ml-2">v2.0</div>
                        </div>
                        <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface text-glow">Audit Log</h3>
                        <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-wider font-medium">Evidentiary records and performance analysis.</p>
                        
                        {/* View Toggle */}
                        <div className="flex items-center gap-2 mt-4 bg-white/5 p-1 rounded-lg border border-white/10 w-fit">
                            <button 
                                onClick={() => setReportViewMode('friendly')}
                                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${reportViewMode === 'friendly' ? 'bg-primary text-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                User Friendly
                            </button>
                            <button 
                                onClick={() => setReportViewMode('technical')}
                                className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${reportViewMode === 'technical' ? 'bg-accent-indigo text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                            >
                                Technical
                            </button>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    {reportViewMode === 'technical' && (
                        <div className="md:max-w-md mt-4 md:mt-0 p-4 rounded-lg bg-accent-amber/10 border border-accent-amber/20">
                            <p className="text-[10px] text-accent-amber leading-relaxed">
                                <strong className="font-black uppercase tracking-wider block mb-1">Technical Mode Disclaimer</strong>
                                While these diagnostics are crucial for model refinement, remember: the goal is writing. Do not get trapped perfecting the report. If the prose sings, commit and return to the canvas.
                            </p>
                        </div>
                    )}

                    {/* Global Action & Navigation Bar */}
                    <div className="flex items-center gap-2">
                        {/* Navigation Controls */}
                        <div className="flex items-center gap-1 mr-2 bg-white/5 rounded-lg p-1 border border-white/10">
                            <button 
                                onClick={handlePrev}
                                className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant transition-all"
                                title="Previous Section"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="w-px h-3 bg-white/10 mx-0.5" />
                            <button 
                                onClick={handleNext}
                                className="p-1.5 rounded hover:bg-white/10 text-on-surface-variant transition-all"
                                title="Next Section"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Global Actions */}
                        <button 
                            onClick={() => setIsArchitectOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-high/40 text-on-surface-variant border border-white/10 hover:bg-white/10 transition-all text-[9px] font-medium tracking-wide shadow-xl shadow-black/20 group"
                            title="View AI Thinking Process"
                        >
                            <Brain className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                            <span>Thinking Process</span>
                        </button>
                        <button 
                            onClick={() => setIsManifestOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-[9px] font-medium tracking-wide shadow-xl shadow-primary/5"
                            title="View Actionable Suggestions"
                        >
                            <Scissors className="w-3.5 h-3.5" />
                            <span>View Suggestions</span>
                        </button>
                        <button 
                            onClick={() => {
                                const reportText = formatReportForCopy(version);
                                navigator.clipboard.writeText(reportText);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-[9px] font-medium tracking-wide ${
                                copied 
                                ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30 shadow-accent-emerald/10' 
                                : 'bg-white/5 text-on-surface-variant border-white/10 hover:bg-white/10 hover:border-white/20 shadow-xl'
                            }`}
                            title="Copy Audit Log"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copied ? 'Copied' : 'Copy Report'}</span>
                        </button>
                    </div>
                </div>
                
                {/* Audit Content - Focused View */}
                <div className="flex-1 px-6 pb-32 max-w-5xl mx-auto w-full relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            {activeSection === 'verdict' && (
                                <div id="verdict" className="relative group/verdict">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent-indigo/20 rounded-xl blur opacity-20 group-hover/verdict:opacity-40 transition duration-1000"></div>
                                    <div className="relative bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-500 group-hover/verdict:border-white/20">
                                        {/* Decorative background accent */}
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                                        
                                        <div>
                                            {/* Metadata Header */}
                                            <div className="flex items-start justify-between mb-6 relative z-10">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner transition-all duration-500 group-hover/verdict:scale-110">
                                                        <FileText className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-on-surface tracking-tight leading-tight group-hover/verdict:text-primary transition-colors">
                                                            {version.title || 'Audit Log'}
                                                        </h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-[9px] text-on-surface-variant/60 font-medium uppercase tracking-wider">
                                                                {version.timestamp ? new Date(version.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Unknown Date'}
                                                            </p>
                                                            <div className="w-1 h-1 rounded-full bg-on-surface-variant/20" />
                                                            <span className="text-[9px] font-bold text-primary/60 uppercase tracking-wider">
                                                                {version.isSurgical ? 'Surgical Graft' : 'Full Audit'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Verdict Content */}
                                            <div className="pt-6 border-t border-white/10 relative z-10">
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-4xl text-primary/20 font-serif leading-none select-none">“</span>
                                                        <div className="w-px h-full bg-gradient-to-b from-primary/20 to-transparent" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-on-surface text-base leading-relaxed italic font-serif tracking-wide mb-4">
                                                            {version.summary || "Audit complete. Review the audit stack below for full transparency."}
                                                        </p>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                                            <span className="text-[9px] font-medium uppercase tracking-wider text-primary/40">Echo's Sovereign Verdict</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'diff' && (
                                <div id="diff">
                                    <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl flex flex-col group transition-all duration-500 hover:border-white/20">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center shadow-inner transition-all duration-500 group-hover:scale-110">
                                                    <Sparkles className="w-5 h-5 text-accent-indigo" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Visual Diff Analysis</h3>
                                                    <p className="text-[9px] text-on-surface-variant/60 uppercase tracking-wider font-medium">Structural Changes</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-[500px] w-full rounded-lg overflow-hidden border border-white/10 shadow-inner bg-black/20">
                                            <SimpleSideBySideDiff 
                                                original={version.originalText || original} 
                                                polished={version.text} 
                                                report={version}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'metrics' && version.metrics && (
                                <div id="metrics">
                                    <ReportMetrics metrics={version.metrics} />
                                </div>
                            )}

                            {activeSection === 'analysis' && (
                                <div id="analysis">
                                    <ReportAnalysis version={version} />
                                </div>
                            )}

                            {activeSection === 'audit' && (version.audit || version.thinking) && (
                                <div id="audit">
                                    <ReportAudit audit={version.audit} thinking={version.thinking} />
                                </div>
                            )}

                            {activeSection === 'restraint' && version.restraintLog && (
                                <div id="restraint">
                                    <ReportRestraintLog restraintLog={version.restraintLog} />
                                </div>
                            )}

                            {activeSection === 'self_corrections' && version.selfCorrections && (
                                <div id="self_corrections">
                                    <ReportSelfCorrections 
                                        selfCorrections={version.selfCorrections} 
                                        onRevertSelfCorrection={onRevertSelfCorrection}
                                    />
                                </div>
                            )}

                            {activeSection === 'voice' && (
                                <div id="voice">
                                    <ReportVoiceResonance voiceAudits={version.voiceAudits} />
                                </div>
                            )}

                            {activeSection === 'corrections' && (
                                <div id="corrections">
                                    <ReportLoreCorrections 
                                        loreCorrections={version.loreCorrections} 
                                        onRevertSpecificLore={onRevertSpecificLore} 
                                    />
                                </div>
                            )}

                            {activeSection === 'fraying' && version.loreFraying && (
                                <div id="fraying">
                                    <ReportLoreFraying loreFraying={version.loreFraying} />
                                </div>
                            )}

                            {activeSection === 'context' && version.activeContext && (
                                <div id="context">
                                    <ReportContext activeContext={version.activeContext} />
                                </div>
                            )}

                            {activeSection === 'strategy' && (
                                <div id="strategy">
                                    <ReportStrategy audit={version.audit} showToast={showToast} />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Architect Log Modal Overlay */}
                {isArchitectOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsArchitectOpen(false)}>
                        <div className="w-full max-w-4xl max-h-[80vh] overflow-y-auto bg-surface-container-low rounded-xl border border-white/10 shadow-2xl p-6 custom-scrollbar" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-on-surface">AI Thinking Process</h2>
                                <button onClick={() => setIsArchitectOpen(false)} className="text-on-surface-variant hover:text-on-surface">Close</button>
                            </div>
                            <ReportArchitectLog version={version} />
                        </div>
                    </div>
                )}

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 left-0 right-0 p-4 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-white/10 z-40 flex flex-col sm:flex-row items-center justify-center gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                    <button 
                        onClick={() => {
                            setActiveReviewVersion(version);
                            setActiveTab('workbench');
                        }}
                        className="flex-1 max-w-md flex items-center justify-center gap-3 px-6 py-3 bg-white/5 text-on-surface border border-white/10 font-medium tracking-wide text-[9px] rounded-lg hover:bg-white/10 hover:border-white/20 transition-all shadow-xl group"
                    >
                        <Scissors className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span>Surgical Workbench</span>
                    </button>
                    <button 
                        onClick={() => onAccept(version)}
                        className="flex-[1.5] max-w-lg flex items-center justify-center gap-3 px-6 py-3 bg-primary text-surface font-medium tracking-wide text-[9px] rounded-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Commit Audited Version</span>
                    </button>
                </div>
            </div>

            {/* Surgical Tray Overlay */}
            <SurgicalTray onCommit={handleBatchCommit} />

            {/* Surgical Manifest Drawer */}
            <SurgicalManifest 
                version={version}
                isOpen={isManifestOpen}
                onClose={() => setIsManifestOpen(false)}
                showToast={showToast}
            />
        </div>
    );
};

export const ReportPanel = React.memo(ReportPanelComponent);
