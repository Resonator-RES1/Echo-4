import React, { useMemo, useState, useEffect } from 'react';
import { Change, diffLines } from 'diff';
import { Loader2, Sparkles } from 'lucide-react';
import { RefinedVersion, LoreFraying, VoiceAudit, RefineDraftResult } from '../../types';
import { getHighlightRanges } from '../../utils/highlightUtils';
import { ShieldAlert, UserCheck, AlertTriangle } from 'lucide-react';

// --- Sub-components ---
const GutterMarker = ({ type }: { type: 'fraying' | 'voice' }) => {
    return (
        <div 
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${type === 'fraying' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'}`}
        >
            {type === 'fraying' ? <AlertTriangle className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
        </div>
    );
};

const DiffTextArea = React.memo(({ initialValue, onBlurChange }: { initialValue: string, onBlurChange: (val: string) => void }) => {
    const [value, setValue] = useState(initialValue);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            className="w-full p-4 whitespace-pre-wrap font-mono text-sm bg-transparent resize-none border-none focus:ring-0 text-on-surface-variant/60 overflow-hidden break-words force-line-height"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
                if (value !== initialValue) {
                    onBlurChange(value);
                }
            }}
        />
    );
});

const EditableHighlightText = ({ 
    initialValue, 
    renderHighlights, 
    onBlurChange,
    onChange
}: { 
    initialValue: string; 
    renderHighlights: () => React.ReactNode; 
    onBlurChange: (val: string) => void;
    onChange?: (val: string) => void;
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        if (isEditing) {
            adjustHeight();
        }
    }, [isEditing, value]);

    if (isEditing) {
        return (
            <div className="relative w-full min-h-[1.5em]">
                {/* The Graft Backdrop: Rendered highlights visible through the transparent textarea */}
                <div 
                    className="absolute inset-0 pointer-events-none font-mono text-sm text-transparent whitespace-pre-wrap break-words p-0 m-0 border-none overflow-hidden select-none"
                    aria-hidden="true"
                >
                    {renderHighlights()}
                </div>

                {/* The Surgical Input: Transparent background, visible text and caret */}
                <textarea
                    ref={textareaRef}
                    autoFocus
                    className="relative w-full p-0 m-0 whitespace-pre-wrap font-mono text-sm bg-transparent resize-none border-none focus:ring-0 text-on-surface overflow-hidden break-words force-line-height caret-primary"
                    value={value}
                    spellCheck={false}
                    onChange={(e) => {
                        const newVal = e.target.value;
                        setValue(newVal);
                        if (onChange) onChange(newVal);
                    }}
                    onBlur={() => {
                        setIsEditing(false);
                        if (value !== initialValue) {
                            onBlurChange(value);
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div 
            className="cursor-text rounded -m-1 p-1 border border-transparent relative active:bg-primary/5 transition-colors min-h-[1.5em]"
            onClick={() => setIsEditing(true)}
        >
            {renderHighlights()}
        </div>
    );
};

// --- Component ---
export const SideBySideDiff: React.FC<{ 
    original: string; 
    polished: string;
    report?: RefineDraftResult | RefinedVersion;
    onSeeReport?: () => void;
    onAcceptChanges?: () => void;
    onCommitPart?: (partValue: string, isAdded: boolean) => void;
    onOriginalChange?: (newOriginal: string) => void;
    onPolishedChange?: (newPolished: string) => void;
    compact?: boolean;
}> = React.memo(({ original, polished, report, onSeeReport, onAcceptChanges, onCommitPart, onOriginalChange, onPolishedChange, compact = false }) => {
    const diffResult = useMemo(() => {
        return diffLines(original, polished);
    }, [original, polished]);

    const highlightRanges = useMemo(() => {
        if (!report) return [];
        return getHighlightRanges(polished, report);
    }, [polished, report]);

    const renderedDiff = useMemo(() => {
        // Enrich parts with metadata
        const enrichedParts: (Change & { index: number, start: number, end: number })[] = [];
        let pIndex = 0;
        for (let i = 0; i < diffResult.length; i++) {
            const part = diffResult[i];
            const start = part.removed ? -1 : pIndex;
            const end = part.removed ? -1 : pIndex + part.value.length;
            if (!part.removed) {
                pIndex += part.value.length;
            }
            enrichedParts.push({ ...part, index: i, start, end });
        }

        // Group sequential removed/added parts
        const groups: { left?: typeof enrichedParts[0], right?: typeof enrichedParts[0] }[] = [];
        for (let i = 0; i < enrichedParts.length; i++) {
            const current = enrichedParts[i];
            const next = enrichedParts[i + 1];

            if (current.removed && next && next.added) {
                groups.push({ left: current, right: next });
                i++;
            } else if (current.removed) {
                groups.push({ left: current });
            } else if (current.added) {
                groups.push({ right: current });
            } else {
                // Unchanged
                groups.push({ left: current, right: current });
            }
        }

        // Helper to render text with highlights
        const renderTextWithHighlights = (text: string, partStart: number, partRanges: any[], isRightSide: boolean) => {
            const lines = text.split('\n');
            let currentOffset = partStart;

            return lines.map((line, lineIdx) => {
                const lineStart = currentOffset;
                const lineEnd = currentOffset + line.length;
                
                // Find highlights that overlap with this line
                const lineRanges = partRanges.filter(r => 
                    Math.max(r.start, lineStart) < Math.min(r.end, lineEnd)
                );

                currentOffset += line.length + 1; // +1 for the newline

                return (
                    <div key={lineIdx} className="min-h-[1.5em] force-line-height whitespace-pre-wrap">
                        {lineRanges.length === 0 ? (line || ' ') : (() => {
                            let currentPos = 0;
                            const segments: React.ReactNode[] = [];
                            
                            lineRanges.forEach((range, rIdx) => {
                                const rangeStart = Math.max(range.start, lineStart) - lineStart;
                                const rangeEnd = Math.min(range.end, lineEnd) - lineStart;

                                if (rangeStart > currentPos) {
                                    segments.push(<span key={`s-${rIdx}`}>{line.substring(currentPos, rangeStart)}</span>);
                                }

                                let highlightClass = "";
                                if (range.type === 'lore') {
                                    highlightClass = isRightSide ? "border-b-2 border-red-500" : "";
                                } else if (range.type === 'fraying') {
                                    highlightClass = isRightSide ? "border-b-2 border-amber-500" : "";
                                } else {
                                    const category = range.metadata.category?.toLowerCase() || '';
                                    if (category.includes('style')) {
                                        highlightClass = isRightSide ? "border-b-2 border-emerald-500" : "";
                                    } else {
                                        highlightClass = isRightSide ? "border-b-2 border-blue-500" : "";
                                    }
                                }

                                segments.push(
                                    <span 
                                        key={`h-${rIdx}`} 
                                        className={`${highlightClass} px-0.5 rounded transition-colors`}
                                    >
                                        {line.substring(rangeStart, rangeEnd)}
                                    </span>
                                );
                                currentPos = rangeEnd;
                            });
                            
                            if (currentPos < line.length) {
                                segments.push(<span key={`s-end`}>{line.substring(currentPos)}</span>);
                            }
                            return segments;
                        })()}
                    </div>
                );
            });
        };

        return groups.map((group, groupIdx) => {
            const leftPart = group.left;
            const rightPart = group.right;

            // Find highlights for the right side
            const rightRanges = rightPart && !rightPart.removed ? highlightRanges.filter(r => 
                Math.max(r.start, rightPart.start) < Math.min(r.end, rightPart.end)
            ) : [];

            return (
                <div key={groupIdx} className="grid grid-cols-[40px_1fr_1fr] border-b border-outline-variant/5 last:border-none group/row min-h-[3rem]">
                    {/* Gutter Pane */}
                    <div className="flex flex-col gap-2 items-center py-4 px-2 border-r border-outline-variant/10 bg-surface-container-low/50">
                        {rightPart && !rightPart.removed && report?.loreFraying?.map((fray, fIdx) => {
                            if (rightPart.value.includes(fray.snippet)) {
                                return <GutterMarker key={`fray-${fIdx}`} type="fraying" />;
                            }
                            return null;
                        })}
                        {rightPart && !rightPart.removed && report?.voiceAudits?.map((audit, aIdx) => {
                            if (rightPart.value.includes(audit.snippet || '')) {
                                return <GutterMarker key={`audit-${aIdx}`} type="voice" />;
                            }
                            return null;
                        })}
                    </div>

                    {/* Left Pane: Original/Removed */}
                    <div className={`border-r border-outline-variant/10 align-top min-w-0 ${leftPart?.removed ? 'bg-red-500/10' : ''}`}>
                        {leftPart ? (
                            <DiffTextArea
                                initialValue={leftPart.value}
                                onBlurChange={(newValue) => {
                                    const newDiffResult = [...diffResult];
                                    newDiffResult[leftPart.index] = { ...newDiffResult[leftPart.index], value: newValue };
                                    
                                    const fullOriginalText = newDiffResult
                                        .filter(p => !p.added)
                                        .map(p => p.value)
                                        .join('');
                                        
                                    if (onOriginalChange) onOriginalChange(fullOriginalText);
                                }}
                            />
                        ) : (
                            <div className="h-full w-full bg-surface-container-highest/5" />
                        )}
                    </div>

                    {/* Right Pane: Polished/Added */}
                    <div className={`align-top p-4 min-w-0 ${rightPart?.added ? 'bg-emerald-500/10' : ''}`}>
                        {rightPart ? (
                            <div className="font-mono text-sm text-on-surface break-words m-0 border-none bg-transparent overflow-visible">
                                {onPolishedChange ? (
                                    <EditableHighlightText
                                        initialValue={rightPart.value}
                                        renderHighlights={() => renderTextWithHighlights(rightPart.value, rightPart.start, rightRanges, true)}
                                        onChange={(newValue) => {
                                            const newDiffResult = [...diffResult];
                                            newDiffResult[rightPart.index] = { ...newDiffResult[rightPart.index], value: newValue };
                                            
                                            const fullPolishedText = newDiffResult
                                                .filter(p => !p.removed)
                                                .map(p => p.value)
                                                .join('');
                                                
                                            onPolishedChange(fullPolishedText);
                                        }}
                                        onBlurChange={(newValue) => {
                                            const newDiffResult = [...diffResult];
                                            newDiffResult[rightPart.index] = { ...newDiffResult[rightPart.index], value: newValue };
                                            
                                            const fullPolishedText = newDiffResult
                                                .filter(p => !p.removed)
                                                .map(p => p.value)
                                                .join('');
                                                
                                            onPolishedChange(fullPolishedText);
                                        }}
                                    />
                                ) : (
                                    renderTextWithHighlights(rightPart.value, rightPart.start, rightRanges, true)
                                )}
                            </div>
                        ) : (
                            <div className="h-full w-full bg-surface-container-highest/5" />
                        )}
                    </div>
                </div>
            );
        });
    }, [diffResult, highlightRanges, report, onOriginalChange, onPolishedChange]);

    return (
        <div className="flex flex-col w-full bg-surface-container-low border border-outline-variant/20 rounded-[0.75rem] overflow-hidden h-full">
            <div className="w-full overflow-y-auto custom-scrollbar flex-1 relative">
                <div className="w-full">
                    {renderedDiff}
                </div>
            </div>
        </div>
    );
});
