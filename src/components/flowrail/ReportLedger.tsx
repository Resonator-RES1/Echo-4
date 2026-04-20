import React from 'react';
import { Clock, Scissors, FileText } from 'lucide-react';
import { RefinedVersion, SurgicalSnapshot } from '../../types';

interface ReportLedgerProps {
    ledger: {
        refinementLogs: RefinedVersion[];
        surgicalHistory: SurgicalSnapshot[];
    } | null;
    setActiveReviewVersion: (version: RefinedVersion | null) => void;
}

export const ReportLedger: React.FC<ReportLedgerProps> = ({ ledger, setActiveReviewVersion }) => {
    if (!ledger) return <div className="text-on-surface-variant/50 text-xs">Loading journal...</div>;

    // Merge logs and snapshots and sort chronologically
    const entries = [
        ...ledger.refinementLogs.map(l => ({ ...l, type: 'refinement' as const, date: new Date(l.timestamp) })),
        ...ledger.surgicalHistory.map(s => ({ ...s, type: 'surgical' as const, date: new Date(s.timestamp) }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">Narrative Journal</h3>
            {entries.length === 0 && <p className="text-on-surface-variant/40 text-xs italic">No refinement history for this scene yet.</p>}
            
            <div className="space-y-2">
                {entries.map((entry, index) => (
                    <div 
                        key={`${entry.type}-${entry.id}-${index}`}
                        onClick={() => entry.type === 'refinement' && setActiveReviewVersion(entry as RefinedVersion)}
                        className={`group p-4 rounded-xl border transition-all duration-300 ${entry.type === 'refinement' 
                            ? 'bg-surface-container-low hover:bg-surface-container-high border-white/5 cursor-pointer' 
                            : 'bg-primary/5 border-primary/10'}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            {entry.type === 'refinement' ? (
                                <FileText className="w-3.5 h-3.5 text-primary" />
                            ) : (
                                <Scissors className="w-3.5 h-3.5 text-accent-indigo" />
                            )}
                            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                                {entry.type === 'refinement' ? 'Full Refinement' : 'Surgical Manifest'}
                            </span>
                            <span className="ml-auto text-[9px] text-on-surface-variant/60 font-mono">
                                {entry.date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <p className="text-xs text-on-surface line-clamp-2 leading-relaxed">
                            {entry.type === 'refinement' 
                                ? (entry as RefinedVersion).summary 
                                : `Surgical intervention: ${(entry as SurgicalSnapshot).label || 'Unnamed intervention'}`}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
