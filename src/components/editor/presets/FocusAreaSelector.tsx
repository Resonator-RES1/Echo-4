import React from 'react';
import { FocusArea, RefineMode } from '../../../types';
import { focusAreaOptions, reviewFocusAreaOptions, reactionFocusAreaOptions } from '../../../constants/focusAreas';
import { FOCUS_AREA_CONFLICTS } from '../../../constants';
import { AlertCircle, Zap } from 'lucide-react';

interface FocusAreaButtonProps {
    opt: typeof focusAreaOptions[0];
    isSelected: boolean; // Manual
    isInherited: boolean; // From Preset
    onClick: () => void;
}

const FocusAreaButton: React.FC<FocusAreaButtonProps> = React.memo(({ opt, isSelected, isInherited, onClick }) => (
    <button 
        onClick={onClick} 
        title={opt.title} 
        className={`
            flex items-center justify-center gap-2 p-2.5 text-[9px] font-label uppercase tracking-wider font-bold rounded-lg border transition-all duration-300 relative group overflow-hidden
            ${isSelected 
                ? 'bg-primary text-on-primary-fixed border-primary shadow-lg scale-[1.02] z-10 ring-1 ring-primary/30 ring-offset-1 ring-offset-surface-container-low' 
                : isInherited
                    ? 'bg-primary/10 text-primary border-primary/40 shadow-sm border-dashed'
                    : 'bg-surface-container-highest/20 border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-highest/40 hover:border-outline-variant/30 hover:text-on-surface'
            }
        `}
    >
        {isInherited && !isSelected && (
            <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-primary/60 animate-pulse" />
        )}
        {isSelected && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
        )}
        <span className={`transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-on-primary-fixed' : isInherited ? 'text-primary' : 'text-primary/60 group-hover:text-primary'}`}>
            {opt.icon}
        </span>
        <span className="relative z-10 truncate">{opt.label}</span>
    </button>
));

interface FocusAreaSelectorProps {
    manualFocusAreas: FocusArea[];
    inheritedFocusAreas?: FocusArea[];
    setFocusAreas: (areas: FocusArea[] | ((prev: FocusArea[]) => FocusArea[])) => void;
    mode: RefineMode | 'collaborative';
}

export const FocusAreaSelector: React.FC<FocusAreaSelectorProps> = React.memo(({ manualFocusAreas, inheritedFocusAreas = [], setFocusAreas, mode }) => {
    const options = mode === 'review' ? reviewFocusAreaOptions : mode === 'reaction' ? reactionFocusAreaOptions : focusAreaOptions;
    const validIds = new Set(options.map(o => o.id));

    const safeManualAreas = (Array.isArray(manualFocusAreas) ? manualFocusAreas : []).filter(id => validIds.has(id));
    const safeInheritedAreas = (Array.isArray(inheritedFocusAreas) ? inheritedFocusAreas : []).filter(id => validIds.has(id));
    const totalActiveAreas = Array.from(new Set([...safeManualAreas, ...safeInheritedAreas]));
    
    // Calculate warnings during render phase
    const warnings: string[] = [];
    
    // 1. Dilution Check
    if (totalActiveAreas.length > 3) {
        warnings.push("Focus Dilution: Selecting more than 3 layers may reduce refinement high-fidelity.");
    }

    // 2. Conflict Check
    const detectedConflicts = new Set<string>();
    totalActiveAreas.forEach(area => {
        const conflicts = FOCUS_AREA_CONFLICTS[area as FocusArea] || [];
        conflicts.forEach(conflict => {
            if (totalActiveAreas.includes(conflict)) {
                // Sort to avoid duplicate warnings (A vs B and B vs A)
                const pair = [area, conflict].sort();
                detectedConflicts.add(`${pair[0]} ↔ ${pair[1]}`);
            }
        });
    });

    detectedConflicts.forEach(conflictPair => {
        warnings.push(`Tension: Potential conflict between ${conflictPair}.`);
    });
    
    const categories = [
        {
            title: 'Atmosphere & Style',
            ids: ['tone', 'rhythm', 'sensory', 'visceral', 'worldbuilding', 'imagery', 'lexicalPalette'] as FocusArea[]
        },
        {
            title: 'Narrative & Character',
            ids: ['emotion', 'dialogue', 'dialogueMechanics', 'psychological', 'characterArc', 'relationships', 'subtext', 'pov', 'povIntegrity'] as FocusArea[]
        },
        {
            title: 'Structure & Depth',
            ids: ['plot', 'causality', 'causalityChain', 'mythic', 'structural', 'tension', 'thematic', 'thematicResonance', 'blocking', 'foreshadowing', 'transitionLogic'] as FocusArea[]
        },
        {
            title: 'Macro-Narrative',
            ids: ['agencyAudit', 'narrativeArc', 'pacingPulsation'] as FocusArea[]
        },
        {
            title: 'Prose Mechanics',
            ids: ['clarity', 'voiceIntegrity'] as FocusArea[]
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <label className="block font-label text-[9px] uppercase tracking-wider text-on-surface/50 font-bold">
                        Focus Areas
                    </label>
                    {safeInheritedAreas.length > 0 && (
                        <span className="text-[7px] font-bold text-primary/60 uppercase tracking-widest bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 w-fit">
                            {safeInheritedAreas.length} Inherited from Preset
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {safeManualAreas.length > 0 && (
                        <button 
                            onClick={() => setFocusAreas([])}
                            className="bg-error/5 hover:bg-error/10 text-error border border-error/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest transition-colors"
                        >
                            Reset Manual
                        </button>
                    )}
                    <span className={`font-bold text-[8px] uppercase tracking-widest transition-colors ${totalActiveAreas.length > 3 ? 'text-error' : 'text-on-surface-variant/40'}`}>
                        {totalActiveAreas.length} TOTAL ACTIVE
                    </span>
                </div>
            </div>

            {warnings.length > 0 && (
                <div className="p-3 bg-accent-amber/5 border border-accent-amber/20 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-accent-amber">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Cognitive Load Warning</span>
                    </div>
                    <ul className="space-y-1">
                        {warnings.map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-[9px] text-on-surface-variant/70 leading-relaxed">
                                <Zap className="w-2.5 h-2.5 mt-0.5 text-accent-amber/40 shrink-0" />
                                <span>{w}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className="space-y-4">
                {categories.map(category => (
                    <div key={category.title} className="space-y-2">
                        <h4 className="text-[9px] font-label uppercase tracking-wider text-on-surface-variant/60 font-bold border-b border-outline-variant/20 pb-0.5">
                            {category.title}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {category.ids.map(id => {
                                const opt = options.find(o => o.id === id);
                                if (!opt) return null;
                                return (
                                    <FocusAreaButton 
                                        key={opt.id}
                                        opt={opt}
                                        isSelected={safeManualAreas.includes(opt.id as FocusArea)}
                                        isInherited={safeInheritedAreas.includes(opt.id as FocusArea)}
                                        onClick={() => {
                                            const next = safeManualAreas.includes(opt.id as FocusArea) 
                                                ? safeManualAreas.filter(i => i !== opt.id) 
                                                : [...safeManualAreas, opt.id as FocusArea];
                                            setFocusAreas(next);
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
