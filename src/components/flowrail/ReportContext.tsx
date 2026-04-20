import React, { useState } from 'react';
import { BookOpen, User, MessageSquare, Target, ChevronDown, ChevronUp, Cpu, Settings, Layers, Terminal, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { RefinedVersion } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReportContextProps {
    activeContext: RefinedVersion['activeContext'];
}

export const ReportContext: React.FC<ReportContextProps> = ({ activeContext }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    const hasContext = activeContext && (
        (activeContext.authorVoices?.length || 0) > 0 || 
        (activeContext.characterVoices?.length || 0) > 0 || 
        (activeContext.loreProfiles?.length || 0) > 0 || 
        (activeContext.focusAreas?.length || 0) > 0
    );

    const presetName = activeContext?.presetName || "Custom Configuration";
    const displayPresetName = activeContext?.isPresetModified ? `${presetName}+` : presetName;

    return (
        <div className="bg-surface-container-low/40 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 group hover:border-white/20">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all text-left"
            >
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-all duration-500 ${hasContext ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20'}`}>
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">Active Context</h3>
                        <p className="text-[9px] text-on-surface-variant/40 uppercase tracking-wider font-black">Source Integrity</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!hasContext && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20 px-3 py-1 rounded-full">All Clear</span>
                    )}
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant/30 group-hover:text-primary transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-8 pt-0 border-t border-white/10">
                            {!hasContext ? (
                                <div className="py-10 text-center">
                                    <p className="text-sm text-on-surface-variant/40 italic font-serif">No specific context active. Echo is operating on draft logic alone.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-8">
                                    <ContextItem 
                                        icon={<User className="w-4 h-4" />} 
                                        label="Author Voices" 
                                        value={activeContext.authorVoices?.length ? activeContext.authorVoices.join(', ') : 'None (Respecting Draft)'} 
                                    />
                                    <ContextItem 
                                        icon={<MessageSquare className="w-4 h-4" />} 
                                        label="Character Voices" 
                                        value={activeContext.characterVoices?.length ? activeContext.characterVoices.join(', ') : 'None (Respecting Draft)'} 
                                    />
                                     <ContextItem 
                                        icon={<BookOpen className="w-4 h-4" />} 
                                        label="Lore Profiles" 
                                        value={activeContext.loreProfiles?.length ? activeContext.loreProfiles.join(', ') : 'None (Respecting Draft)'} 
                                    />

                                    {/* Sovereign Metadata */}
                                    <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ContextItem 
                                                icon={<Layers className="w-4 h-4" />} 
                                                label="Audit Scope" 
                                                value={`${activeContext.scope?.toUpperCase() || 'CHAPTER'} ${activeContext.isSurgical ? '(SURGICAL)' : '(FULL)'}`} 
                                            />
                                            <ContextItem 
                                                icon={<Zap className="w-4 h-4" />} 
                                                label="Sovereign Presets" 
                                                value={`${displayPresetName} | ${activeContext.baselinePillars ? 'PILLARS ON' : 'PILLARS OFF'} | ${activeContext.polishDepth?.toUpperCase() || 'STANDARD'} POLISH`} 
                                            />
                                            <ContextItem 
                                                icon={<Cpu className="w-4 h-4" />} 
                                                label="Engine Parameters" 
                                                value={`${activeContext.model?.includes('pro') ? 'PRO' : 'FLASH'} | THINKING: ${activeContext.thinkingLevel?.toUpperCase() || 'DEFAULT'} | TEMP: ${activeContext.temperature || 0.7}`} 
                                            />
                                            <ContextItem 
                                                icon={<RefreshCw className="w-4 h-4" />} 
                                                label="Cycle Logic" 
                                                value={`${activeContext.refinementMode?.toUpperCase() || 'REGULAR'} ${activeContext.isReRefinement ? '(EVOLUTIONARY)' : '(INITIAL)'}`} 
                                            />
                                            {activeContext.focusAreas && (
                                                <ContextItem 
                                                    icon={<Target className="w-4 h-4" />} 
                                                    label="Focus Areas" 
                                                    value={activeContext.focusAreas.join(', ')} 
                                                    noTruncate={true}
                                                />
                                            )}
                                        </div>
                                        {activeContext.customDirectives && (
                                            <ContextItem 
                                                icon={<Terminal className="w-4 h-4" />} 
                                                label="Custom Directives" 
                                                value={activeContext.customDirectives} 
                                                noTruncate={true}
                                            />
                                        )}
                                        {activeContext.previousInternalCritique && (
                                            <ContextItem 
                                                icon={<AlertCircle className="w-4 h-4" />} 
                                                label="Previous Evolutionary Anchor" 
                                                value={activeContext.previousInternalCritique} 
                                                noTruncate={true}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ContextItem: React.FC<{ icon: React.ReactNode; label: string; value: string; noTruncate?: boolean }> = ({ icon, label, value, noTruncate }) => (
    <div className={`p-5 bg-white/[0.02] rounded-lg border border-white/10 hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-500 group/item h-full ${noTruncate ? 'md:col-span-2' : ''}`}>
        <div className="flex items-center gap-3 mb-3 text-on-surface-variant/40 group-hover/item:text-primary transition-colors">
            {icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <p className={`text-sm font-bold text-on-surface/80 leading-relaxed ${noTruncate ? 'whitespace-pre-wrap' : 'truncate'}`}>{value}</p>
    </div>
);
