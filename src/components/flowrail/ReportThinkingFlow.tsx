import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Brain, Shield, Mic2, Zap, AlertTriangle, CheckCircle2, MessageSquare, Search } from 'lucide-react';

interface ThinkingNode {
    type: 'lore' | 'voice' | 'decision' | 'conflict' | 'analysis' | 'thought' | 'pacing' | 'sludge' | 'intent';
    text: string;
    header?: string;
}

interface ReportThinkingFlowProps {
    thinking: string;
}

export const ReportThinkingFlow: React.FC<ReportThinkingFlowProps> = ({ thinking }) => {
    const nodes = useMemo(() => {
        if (!thinking) return [];
        
        // Split by newlines first
        let lines = thinking.split('\n').filter(l => l.trim().length > 0);
        
        // If it's just one or two massive blocks, try to split by sentences to create chunks
        if (lines.length <= 2 && thinking.length > 150) {
            // Avoid lookbehinds for broader browser compatibility
            // Match sentences ending in punctuation, OR the remaining text at the end
            const sentenceRegex = /[^.!?]+[.!?]+|[^.!?]+$/g;
            const sentences = thinking.match(sentenceRegex);
            if (sentences && sentences.length > 0) {
                lines = sentences.map(s => s.trim()).filter(l => l.length > 0);
            }
        }
        
        return lines.map((line): ThinkingNode => {
            const cleanLine = line.replace(/^[-*•]\s*/, '').trim();
            const lower = cleanLine.toLowerCase();
            
            let type: ThinkingNode['type'] = 'thought';
            let header: string | undefined;

            // Check for structured headers first
            if (cleanLine.startsWith('[LORE_CHECK]')) {
                type = 'lore';
                header = 'Lore Check';
            } else if (cleanLine.startsWith('[VOICE_AUDIT]')) {
                type = 'voice';
                header = 'Voice Audit';
            } else if (cleanLine.startsWith('[PACING_LOG]')) {
                type = 'pacing';
                header = 'Pacing Log';
            } else if (cleanLine.startsWith('[SLUDGE_SCAN]')) {
                type = 'sludge';
                header = 'Sludge Scan';
            } else if (cleanLine.startsWith('[INTENT_ALIGNMENT]')) {
                type = 'intent';
                header = 'Intent Alignment';
            }
            // Fallback to keyword matching if no explicit header
            else if (lower.includes('lore') || lower.includes('continuity')) type = 'lore';
            else if (lower.includes('voice') || lower.includes('tone') || lower.includes('resonance')) type = 'voice';
            else if (lower.includes('decision') || lower.includes('adjusted') || lower.includes('changed') || lower.includes('refined')) type = 'decision';
            else if (lower.includes('conflict') || lower.includes('error') || lower.includes('issue') || lower.includes('fraying')) type = 'conflict';
            else if (lower.includes('analyzing') || lower.includes('checking') || lower.includes('evaluating')) type = 'analysis';
            
            // Remove the header from the text if present
            const text = header ? cleanLine.substring(cleanLine.indexOf(']') + 1).trim() : cleanLine;

            return { type, text, header };
        });
    }, [thinking]);

    const getIcon = (type: ThinkingNode['type']) => {
        switch (type) {
            case 'lore': return <Shield className="w-3 h-3" />;
            case 'voice': return <Mic2 className="w-3 h-3" />;
            case 'decision': return <Zap className="w-3 h-3" />;
            case 'conflict': return <AlertTriangle className="w-3 h-3" />;
            case 'analysis': return <Search className="w-3 h-3" />;
            case 'pacing': return <Zap className="w-3 h-3" />;
            case 'sludge': return <AlertTriangle className="w-3 h-3" />;
            case 'intent': return <CheckCircle2 className="w-3 h-3" />;
            default: return <Brain className="w-3 h-3" />;
        }
    };

    const getColor = (type: ThinkingNode['type']) => {
        switch (type) {
            case 'lore': return 'text-accent-amber bg-accent-amber/10 border-accent-amber/20';
            case 'voice': return 'text-accent-indigo bg-accent-indigo/10 border-accent-indigo/20';
            case 'decision': return 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20';
            case 'conflict': return 'text-error bg-error/10 border-error/20';
            case 'analysis': return 'text-primary bg-primary/10 border-primary/20';
            case 'pacing': return 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20';
            case 'sludge': return 'text-accent-rose bg-accent-rose/10 border-accent-rose/20';
            case 'intent': return 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20';
            default: return 'text-on-surface-variant/60 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="space-y-4 relative">
            {/* Connection Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
            
            {nodes.map((node, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 relative z-10"
                >
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${getColor(node.type)}`}>
                        {getIcon(node.type)}
                    </div>
                    
                    <div className="flex-1 pt-1.5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{node.header || node.type}</span>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>
                        <p className="text-[9px] text-on-surface-variant/80 leading-relaxed font-serif italic">
                            {node.text}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
