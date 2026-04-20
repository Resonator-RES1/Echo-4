import React from 'react';

interface EditorFooterProps {
    saveStatus: 'idle' | 'saving' | 'saved';
    wordCount: number;
}

export const EditorFooter: React.FC<EditorFooterProps> = React.memo(({ saveStatus, wordCount }) => {
    return (
        <div className="absolute bottom-6 right-6 flex items-center gap-4">
            <div className="flex items-center gap-4">
                <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant/60 italic transition-opacity duration-300">
                    {saveStatus === 'saving' && 'Saving...'}
                    {saveStatus === 'saved' && 'Saved!'}
                </span>
            </div>
        </div>
    );
});
