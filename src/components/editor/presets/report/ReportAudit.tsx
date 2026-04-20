import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { RefinementAudit } from '../../../../types';

interface ReportAuditProps {
    audit: RefinementAudit;
}

export const ReportAudit: React.FC<ReportAuditProps> = ({ audit }) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 text-on-surface/80">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest">Audit Log (Transparency)</span>
            </div>
            
            {/* Voice Fidelity - Central Focus & Enlarged */}
            <div className="flex flex-col items-center justify-center p-5 bg-primary/5 rounded-xl border border-primary/30 text-center space-y-6 shadow-sm">
                <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            className="text-surface-container-highest"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 56}
                            strokeDashoffset={2 * Math.PI * 56 * (1 - audit.voiceFidelityScore / 10)}
                            className="text-primary transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-headline font-black text-primary">{audit.voiceFidelityScore}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <h6 className="text-xl font-bold text-on-surface">Voice Fidelity Score</h6>
                    <p className="text-base text-on-surface-variant leading-relaxed max-w-xl mx-auto">
                        {audit.voiceFidelityReasoning}
                    </p>
                </div>
            </div>

            {/* Other Audit Metrics - Punchier */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-surface-container-highest/40 rounded-lg border border-outline-variant/20 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-black text-on-surface/60">Lore Compliance</span>
                        <span className="text-lg font-black text-primary">{audit.loreCompliance}/10</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-snug">{audit.loreComplianceReasoning}</p>
                </div>
                <div className="p-5 bg-surface-container-highest/40 rounded-lg border border-outline-variant/20 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-black text-on-surface/60">Voice Adherence</span>
                        <span className="text-lg font-black text-primary">{audit.voiceAdherence}/10</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-snug">{audit.voiceAdherenceReasoning}</p>
                </div>
                <div className="p-5 bg-surface-container-highest/40 rounded-lg border border-outline-variant/20 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-xs uppercase font-black text-on-surface/60">Focus Alignment</span>
                        <span className="text-lg font-black text-primary">{audit.focusAreaAlignment}/10</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-snug">{audit.focusAreaAlignmentReasoning}</p>
                </div>
            </div>
        </div>
    );
};
