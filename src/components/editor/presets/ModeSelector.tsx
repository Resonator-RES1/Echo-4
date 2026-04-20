import React from 'react';
import { RefineMode, ReviewPerspective } from '../../../types';

interface ModeSelectorProps {
    mode: RefineMode;
    setMode: (mode: RefineMode) => void;
    reviewPerspective: ReviewPerspective;
    setReviewPerspective: (perspective: ReviewPerspective) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = React.memo(({ 
    mode, setMode, reviewPerspective, setReviewPerspective 
}) => {
    return (
        <div className="space-y-5">
            <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-3">Mode</label>
                <div className="flex gap-2 bg-surface-container-highest/30 p-1.5 rounded-[0.75rem] border border-outline-variant/20">
                    <button 
                        onClick={() => setMode('collaborative')} 
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-[0.5rem] transition-all ${mode === 'collaborative' ? 'bg-primary text-on-primary-fixed shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
                    >
                        Collaborative
                    </button>
                    <button 
                        onClick={() => setMode('review')} 
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-[0.5rem] transition-all ${mode === 'review' ? 'bg-primary text-on-primary-fixed shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
                    >
                        Review
                    </button>
                    <button 
                        onClick={() => setMode('reaction')} 
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-[0.5rem] transition-all ${mode === 'reaction' ? 'bg-primary text-on-primary-fixed shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
                    >
                        Reaction
                    </button>
                </div>
            </div>

            {mode === 'review' && (
                <div>
                    <label htmlFor="review-perspective" className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-medium mb-3">Review Perspective</label>
                    <select 
                        id="review-perspective" 
                        value={reviewPerspective} 
                        onChange={(e) => setReviewPerspective(e.target.value as ReviewPerspective)} 
                        className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-[0.75rem] p-2.5 focus:ring-1 focus:ring-primary focus:border-primary text-sm text-on-surface transition-all"
                    >
                        <option value="reader">Avid Reader</option>
                        <option value="editor">Meticulous Editor</option>
                        <option value="publisher">Publisher</option>
                    </select>
                </div>
            )}
        </div>
    );
});
