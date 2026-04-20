import React from 'react';
import { ComparisonView } from './ComparisonView';
import { ConflictModal } from './ConflictModal';
import { LoreRevertModal } from './LoreRevertModal';
import { LoreConflict, LoreCorrection } from '../../types';

interface EditorModalsProps {
    showComparison: boolean;
    showConflicts: boolean;
    showLoreRevert: boolean;
    currentVersion: any;
    originalDraft: string;
    conflicts: LoreConflict[];
    loreCorrections: LoreCorrection[];
    setShowComparison: (show: boolean) => void;
    setShowConflicts: (show: boolean) => void;
    setShowLoreRevert: (show: boolean) => void;
    onRevertLore: () => void;
    onRevertSpecificLore: (correction: LoreCorrection) => void;
    onAcceptVersion: (version: any) => void;
    setActiveTab: (tab: any) => void;
}

export const EditorModals: React.FC<EditorModalsProps> = React.memo(({
    showComparison,
    showConflicts,
    showLoreRevert,
    currentVersion,
    originalDraft,
    conflicts,
    loreCorrections,
    setShowComparison,
    setShowConflicts,
    setShowLoreRevert,
    onRevertLore,
    onRevertSpecificLore,
    onAcceptVersion,
    setActiveTab
}) => {
    return (
        <>
            {showComparison && (
                <ComparisonView 
                    isOpen={showComparison}
                    onClose={() => setShowComparison(false)}
                    original={originalDraft}
                    polished={currentVersion?.text || ''}
                    report={currentVersion}
                    onRevertLore={onRevertLore}
                    onAccept={(text) => onAcceptVersion(text ? { ...currentVersion, text } : currentVersion)}
                    onSeeReport={() => {
                        setActiveTab('report');
                        setShowComparison(false);
                    }}
                />
            )}
            {showConflicts && (
                <ConflictModal
                    isOpen={showConflicts}
                    onClose={() => setShowConflicts(false)}
                    conflicts={conflicts}
                />
            )}
            {showLoreRevert && (
                <LoreRevertModal 
                    isOpen={showLoreRevert}
                    onClose={() => setShowLoreRevert(false)}
                    corrections={loreCorrections}
                    onRevert={onRevertSpecificLore}
                />
            )}
        </>
    );
});
