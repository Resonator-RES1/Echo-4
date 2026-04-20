import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ReportAnalysisProps {
    analysis: string;
}

export const ReportAnalysis: React.FC<ReportAnalysisProps> = ({ analysis }) => {
    if (!analysis) return null;

    return (
        <div className="p-4 bg-surface-container-highest/30 rounded-lg border border-outline-variant/20 shadow-inner">
            <h5 className="text-xs uppercase tracking-widest font-black text-primary mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Mirror Editor Analysis
            </h5>
            <p className="text-base text-on-surface/90 leading-relaxed italic font-medium">{analysis}</p>
        </div>
    );
};
