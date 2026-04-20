import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    X, 
    CheckSquare, 
    Square, 
    Import, 
    Scissors, 
    Sparkles, 
    ChevronRight, 
    Mic2, 
    ShieldAlert, 
    HelpCircle, 
    Search, 
    MessageSquare,
    CheckCircle2
} from 'lucide-react';
import { RefinedVersion } from '../../types';
import { useWorkbenchStore } from '../../stores/useWorkbenchStore';
import { useEditorUIStore } from '../../stores/useEditorUIStore';

interface SurgicalManifestProps {
    version: RefinedVersion;
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string) => void;
}

interface ManifestItem {
    id: string;
    category: 'voice' | 'lore' | 'fraying' | 'audit' | 'critique';
    text: string;
    source: string;
}

export const SurgicalManifest: React.FC<SurgicalManifestProps> = ({ 
    version, 
    isOpen, 
    onClose, 
    showToast = () => {}
}) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { setActiveTab } = useEditorUIStore();
    
    const appendCustomDirective = useWorkbenchStore(state => state.appendCustomDirective);
    const addSuggestion = useWorkbenchStore(state => state.addSuggestion);
    const loadReportIntoWorkbench = useWorkbenchStore(state => state.loadReportIntoWorkbench);
    const addToTray = useWorkbenchStore(state => state.addToTray);

    const manifestItems = useMemo(() => {
        const items: ManifestItem[] = [];

        // 1. Voice Audits
        version.voiceAudits?.forEach((audit, idx) => {
            if (audit.dissonanceReason) {
                items.push({
                    id: `voice-${idx}`,
                    category: 'voice',
                    text: audit.dissonanceReason,
                    source: `Voice: ${audit.characterName}`
                });
            }
        });

        // 2. Lore Corrections
        version.loreCorrections?.forEach((correction, idx) => {
            if (correction.reason) {
                items.push({
                    id: `lore-${idx}`,
                    category: 'lore',
                    text: correction.reason,
                    source: `Lore: ${correction.refined}`
                });
            }
        });

        // 3. Lore Fraying
        version.loreFraying?.forEach((fraying, idx) => {
            if (fraying.suggestion) {
                items.push({
                    id: `fraying-${idx}`,
                    category: 'fraying',
                    text: fraying.suggestion,
                    source: 'Narrative Fraying'
                });
            }
        });

        // 4. Fidelity Audit
        if (version.audit) {
            const auditFields: Array<keyof typeof version.audit> = [
                'voiceFidelityReasoning',
                'loreComplianceReasoning',
                'voiceAdherenceReasoning',
                'focusAreaAlignmentReasoning'
            ];
            auditFields.forEach((field, idx) => {
                const val = version.audit?.[field];
                if (typeof val === 'string' && val.length > 10) {
                    items.push({
                        id: `audit-${idx}`,
                        category: 'audit',
                        text: val,
                        source: field.replace('Reasoning', '').replace(/([A-Z])/g, ' $1').trim()
                    });
                }
            });
        }

        // 5. Mirror Editor Critique
        if (version.mirrorEditorCritique) {
            // Split by bullet points or numbered lists if possible, otherwise treat as one
            const lines = version.mirrorEditorCritique.split(/\n(?=[•\-\d.])/);
            lines.forEach((line, idx) => {
                const cleanLine = line.replace(/^[•\-\d.\s]+/, '').trim();
                if (cleanLine.length > 10) {
                    items.push({
                        id: `critique-${idx}`,
                        category: 'critique',
                        text: cleanLine,
                        source: 'Mirror Editor Critique'
                    });
                }
            });
        }

        return items;
    }, [version]);

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === manifestItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(manifestItems.map(i => i.id)));
        }
    };

    const getSelectedTexts = () => {
        return manifestItems
            .filter(item => selectedIds.has(item.id))
            .map(item => item.text);
    };

    const handleBatchImport = () => {
        const texts = getSelectedTexts();
        if (texts.length === 0) return;
        texts.forEach(t => appendCustomDirective(t));
        showToast(`${texts.length} suggestions imported to Audit Directives.`);
        setSelectedIds(new Set());
    };

    const handleBatchInject = () => {
        const texts = getSelectedTexts();
        if (texts.length === 0) return;
        texts.forEach(t => addSuggestion(t));
        loadReportIntoWorkbench(version);
        showToast(`${texts.length} suggestions injected into Workbench.`);
        setActiveTab('workbench');
        onClose();
    };

    const handleBatchCollect = () => {
        const texts = getSelectedTexts();
        if (texts.length === 0) return;
        texts.forEach(t => addToTray(t));
        showToast(`${texts.length} suggestions added to Surgical Tray.`);
        setSelectedIds(new Set());
    };

    const categoryIcons = {
        voice: Mic2,
        lore: ShieldAlert,
        fraying: HelpCircle,
        audit: Search,
        critique: MessageSquare
    };

    const categoryColors = {
        voice: 'text-accent-indigo bg-accent-indigo/10',
        lore: 'text-error bg-error/10',
        fraying: 'text-accent-amber bg-accent-amber/10',
        audit: 'text-primary bg-primary/10',
        critique: 'text-accent-emerald bg-accent-emerald/10'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-surface-container-highest shadow-2xl z-[101] border-l border-white/10 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-surface-container-low/50 backdrop-blur-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Scissors className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-on-surface tracking-tight">Surgical Manifest</h3>
                                    <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Audit Triage & Command</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 text-on-surface-variant/40 hover:text-on-surface transition-colors rounded-xl"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Selection Toolbar */}
                        <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                            <button 
                                onClick={toggleSelectAll}
                                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 hover:text-primary transition-colors"
                            >
                                {selectedIds.size === manifestItems.length && manifestItems.length > 0 ? (
                                    <CheckSquare className="w-4 h-4 text-primary" />
                                ) : (
                                    <Square className="w-4 h-4" />
                                )}
                                <span>{selectedIds.size === manifestItems.length ? 'Deselect All' : 'Select All'}</span>
                            </button>
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">
                                {selectedIds.size} Selected
                            </span>
                        </div>

                        {/* Manifest List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                            {manifestItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <CheckCircle2 className="w-12 h-12 mb-4" />
                                    <p className="text-sm italic font-serif">No actionable suggestions found in this audit.</p>
                                </div>
                            ) : (
                                manifestItems.map((item) => {
                                    const Icon = categoryIcons[item.category];
                                    const isSelected = selectedIds.has(item.id);
                                    return (
                                        <div 
                                            key={item.id}
                                            onClick={() => toggleSelect(item.id)}
                                            className={`group relative flex items-start gap-4 p-5 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-primary/5 border-primary/30 shadow-lg shadow-primary/5' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'}`}
                                        >
                                            <div className={`mt-1 shrink-0 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                {isSelected ? (
                                                    <CheckSquare className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-on-surface-variant/20" />
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full ${categoryColors[item.category]}`}>
                                                        <Icon className="w-3 h-3" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest">{item.category}</span>
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/30">{item.source}</span>
                                                </div>
                                                
                                                <p className="text-sm text-on-surface-variant leading-relaxed italic font-serif">
                                                    {item.text}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="p-4 bg-surface-container-low/80 backdrop-blur-xl border-t border-white/10 space-y-4">
                            <div className="space-y-4">
                                <button 
                                    disabled={selectedIds.size === 0}
                                    onClick={handleBatchCollect}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 text-on-surface border border-white/10 font-black uppercase tracking-wider text-[9px] rounded-lg hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                                >
                                    <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                                    <span>Collect to Tray</span>
                                </button>
                                <button 
                                    disabled={selectedIds.size === 0}
                                    onClick={handleBatchImport}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 text-on-surface border border-white/10 font-black uppercase tracking-wider text-[9px] rounded-lg hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                                >
                                    <Import className="w-4 h-4 text-accent-indigo group-hover:scale-110 transition-transform" />
                                    <span>Import to Directives</span>
                                </button>
                            </div>
                            <button 
                                disabled={selectedIds.size === 0}
                                onClick={handleBatchInject}
                                className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-surface font-black uppercase tracking-wider text-[9px] rounded-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Inject Selected to Workbench</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
