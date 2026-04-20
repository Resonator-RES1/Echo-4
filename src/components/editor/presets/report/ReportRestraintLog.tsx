import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface RestraintLogEntry {
    category: string;
    target: string;
    justification: string;
}

interface ReportRestraintLogProps {
    restraintLog: RestraintLogEntry[];
}

export const ReportRestraintLog: React.FC<ReportRestraintLogProps> = ({ restraintLog }) => {
    if (!restraintLog || restraintLog.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 text-on-surface/80">
                <ShieldCheck className="w-5 h-5 text-accent-emerald" />
                <span className="text-sm font-bold uppercase tracking-widest">Restraint Log (Deliberate Preservations)</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {restraintLog.map((log, idx) => (
                    <div key={idx} className="p-4 bg-accent-emerald/5 rounded-lg border border-accent-emerald/20 space-y-2">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-1 bg-accent-emerald/20 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-accent-emerald" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-accent-emerald/70">{log.category}</span>
                                    <span className="text-sm font-bold text-on-surface italic">"{log.target}"</span>
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed">{log.justification}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
