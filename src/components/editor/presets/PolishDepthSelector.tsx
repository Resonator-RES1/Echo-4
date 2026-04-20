import React from 'react';
import { FeedbackDepth, RefineMode } from '../../../types';
import { DEPTH_CONFIG, REVIEW_DEPTH_CONFIG, REACTION_DEPTH_CONFIG } from '../../../constants/polishDepth';

interface PolishDepthSelectorProps {
    feedbackDepth: FeedbackDepth;
    setFeedbackDepth: (depth: FeedbackDepth) => void;
    mode?: RefineMode;
}

export const PolishDepthSelector: React.FC<PolishDepthSelectorProps> = React.memo(({ 
    feedbackDepth, setFeedbackDepth, mode = 'collaborative'
}) => {
    const config = mode === 'review' ? REVIEW_DEPTH_CONFIG : mode === 'reaction' ? REACTION_DEPTH_CONFIG : DEPTH_CONFIG;
    const title = mode === 'review' ? 'Review Depth' : mode === 'reaction' ? 'Reaction Depth' : 'Polish Depth';

    return (
        <div className="space-y-4">
            <label htmlFor="feedback-depth" className="block font-label text-[9px] uppercase tracking-wider text-on-surface/50 font-black">{title}</label>
            <div className="grid grid-cols-3 gap-3">
                {Object.keys(config).map(key => {
                    const opt = config[key as FeedbackDepth];
                    const isSelected = feedbackDepth === key;
                    return (
                        <button 
                            key={key} 
                            onClick={() => setFeedbackDepth(key as FeedbackDepth)} 
                            title={opt.description}
                            className={`
                                flex flex-col items-center gap-3 p-4 rounded-lg border transition-all text-center group relative overflow-hidden
                                ${isSelected 
                                    ? 'bg-primary text-on-primary-fixed border-primary shadow-lg scale-[1.02] z-10' 
                                    : 'bg-surface-container-highest/20 border-outline-variant/10 text-on-surface-variant hover:border-outline-variant/30 hover:bg-surface-container-highest/40'
                                }
                            `}
                        >
                            {isSelected && (
                                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                            )}
                            <div className={`transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-on-primary-fixed' : 'text-primary'}`}>
                                {opt.icon}
                            </div>
                            <span className="font-label text-[9px] uppercase tracking-wider leading-none font-black relative z-10">
                                {opt.label}
                            </span>
                            <span className="text-[7px] mt-0 opacity-60 font-mono italic relative z-10 leading-none">
                                {key === 'in-depth' ? '3x Passes' : key === 'balanced' ? '1x Pass' : '0x Pass'}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
