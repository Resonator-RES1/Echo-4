import React, { useMemo, useState, useEffect } from 'react';
import { Change, diffLines } from 'diff';
import { Sparkles } from 'lucide-react';
import { RefinedVersion, RefineDraftResult } from '../../types';
import { getHighlightRanges } from '../../utils/highlightUtils';

export const SimpleSideBySideDiff: React.FC<{ 
    original: string; 
    polished: string;
    report?: RefineDraftResult | RefinedVersion;
}> = React.memo(({ original, polished, report }) => {
    const diffResult = useMemo(() => {
        return diffLines(original, polished);
    }, [original, polished]);

    const highlightRanges = useMemo(() => {
        if (!report) return [];
        return getHighlightRanges(polished, report);
    }, [polished, report]);

    const [activeTooltip, setActiveTooltip] = useState<{ id: string; text: string } | null>(null);

    const renderedDiff = useMemo(() => {
        const rows: { left: string | null, right: string | null, start: number, end: number, type: 'added' | 'removed' | 'unchanged' | 'changed' }[] = [];
        let currentPolishedIndex = 0;

        for (let i = 0; i < diffResult.length; i++) {
            const part = diffResult[i];
            
            if (part.removed) {
                const nextPart = diffResult[i + 1];
                if (nextPart && nextPart.added) {
                    rows.push({
                        left: part.value,
                        right: nextPart.value,
                        start: currentPolishedIndex,
                        end: currentPolishedIndex + nextPart.value.length,
                        type: 'changed'
                    });
                    currentPolishedIndex += nextPart.value.length;
                    i++; // Skip the added part as we've paired it
                } else {
                    rows.push({
                        left: part.value,
                        right: null,
                        start: -1,
                        end: -1,
                        type: 'removed'
                    });
                }
            } else if (part.added) {
                rows.push({
                    left: null,
                    right: part.value,
                    start: currentPolishedIndex,
                    end: currentPolishedIndex + part.value.length,
                    type: 'added'
                });
                currentPolishedIndex += part.value.length;
            } else {
                rows.push({
                    left: part.value,
                    right: part.value,
                    start: currentPolishedIndex,
                    end: currentPolishedIndex + part.value.length,
                    type: 'unchanged'
                });
                currentPolishedIndex += part.value.length;
            }
        }

        return rows.map((row, index) => {
            const { left, right, start, end, type } = row;
            
            const partRanges = right ? highlightRanges.filter(r => 
                Math.max(r.start, start) < Math.min(r.end, end)
            ) : [];

            const renderTextWithHighlights = (text: string, partStart: number, isAdded: boolean) => {
                if (partRanges.length === 0) {
                    return isAdded ? <span className="bg-emerald-500/20">{text}</span> : text;
                }
                
                let currentPos = 0;
                const segments: React.ReactNode[] = [];
                
                partRanges.forEach((range, rIdx) => {
                    const rangeStart = Math.max(range.start, partStart) - partStart;
                    const rangeEnd = Math.min(range.end, partStart + text.length) - partStart;

                    if (rangeStart > currentPos) {
                        const gapText = text.substring(currentPos, rangeStart);
                        segments.push(
                            <span key={`${index}-s-${rIdx}`} className={isAdded ? "bg-emerald-500/20" : ""}>
                                {gapText}
                            </span>
                        );
                    }

                    let highlightClass = "";
                    let explanation = "";
                    if (range.type === 'lore') {
                        highlightClass = "bg-purple-500/20 text-purple-200 underline decoration-purple-500/50 underline-offset-4 cursor-pointer";
                        explanation = range.metadata.reason;
                    } else if (range.type === 'fraying') {
                        highlightClass = "bg-amber-500/20 text-amber-200 underline decoration-amber-500/50 underline-offset-4 cursor-pointer";
                        explanation = range.metadata.conflict + (range.metadata.suggestion ? `\nSuggestion: ${range.metadata.suggestion}` : '');
                    } else {
                        const category = range.metadata.category?.toLowerCase() || '';
                        if (category.includes('style')) {
                            highlightClass = "bg-emerald-500/20 text-emerald-200 underline decoration-emerald-500/50 underline-offset-4 cursor-pointer";
                        } else {
                            highlightClass = "bg-blue-500/20 text-blue-200 underline decoration-blue-500/50 underline-offset-4 cursor-pointer";
                        }
                        explanation = range.metadata.justification;
                    }

                    segments.push(
                        <span 
                            key={`${index}-h-${rIdx}`} 
                            className={`${highlightClass} px-0.5 rounded transition-colors`}
                            onClick={() => setActiveTooltip({ id: `${index}-h-${rIdx}`, text: explanation })}
                        >
                            {text.substring(rangeStart, rangeEnd)}
                        </span>
                    );
                    currentPos = rangeEnd;
                });
                
                if (currentPos < text.length) {
                    const gapText = text.substring(currentPos);
                    segments.push(
                        <span key={`${index}-s-end`} className={isAdded ? "bg-emerald-500/20" : ""}>
                            {gapText}
                        </span>
                    );
                }
                return segments;
            };

            const rowClassName = type === 'added' 
                ? 'bg-emerald-500/5' 
                : type === 'removed' 
                ? 'bg-red-500/5' 
                : type === 'changed'
                ? 'bg-blue-500/5'
                : '';

            return (
                <tr key={index} className={`${rowClassName} border-b border-outline-variant/5`}>
                    <td className="w-1/2 p-4 whitespace-pre-wrap font-mono text-xs text-on-surface-variant/60 align-top border-r border-outline-variant/10">
                        {left || ''}
                    </td>
                    <td className="w-1/2 p-4 whitespace-pre-wrap font-mono text-xs text-on-surface align-top">
                        {right ? renderTextWithHighlights(right, start, type === 'added' || type === 'changed') : ''}
                    </td>
                </tr>
            );
        });
    }, [diffResult, highlightRanges]);

    return (
        <div className="flex flex-col w-full bg-surface-container-low border border-outline-variant/20 rounded-[1rem] overflow-hidden h-full shadow-sm">
            <div className="flex w-full overflow-y-auto custom-scrollbar flex-1 relative">
                <table className="w-full table-fixed border-collapse">
                    <thead className="sticky top-0 z-10 bg-surface-container-high border-b border-outline-variant/20">
                        <tr>
                            <th className="w-1/2 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 text-left border-r border-outline-variant/20">Original Version</th>
                            <th className="w-1/2 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 text-left">Polished Version</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderedDiff}
                    </tbody>
                </table>
            </div>

            {activeTooltip && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveTooltip(null)}>
                    <div className="bg-surface-container-highest border border-outline-variant/30 rounded-lg p-4 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-headline text-sm font-bold text-on-surface mb-2 uppercase tracking-widest opacity-50">Context Card</h4>
                                <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">{activeTooltip.text}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setActiveTooltip(null)}
                            className="mt-6 w-full py-2.5 bg-surface-container-low text-on-surface-variant font-label text-[9px] uppercase tracking-widest rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
            <div className="flex items-center gap-4 p-4 bg-surface-container-low border-t border-outline-variant/20 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">
                <div className="flex items-center gap-2"><div className="w-3 h-3 border-b-2 border-purple-500"></div> Lore</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 border-b-2 border-amber-500"></div> Fraying</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 border-b-2 border-emerald-500"></div> Style</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 border-b-2 border-blue-500"></div> Preserved</div>
            </div>
        </div>
    );
});
