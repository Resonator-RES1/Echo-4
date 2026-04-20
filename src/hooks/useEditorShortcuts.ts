import { useEffect } from 'react';
import { WorkspaceTab } from '../../types';

interface UseEditorShortcutsProps {
  selection: { text: string; start: number; end: number } | null;
  showToast: (message: string) => void;
  setActiveTab: (tab: WorkspaceTab) => void;
}

export const useEditorShortcuts = ({
  selection,
  showToast,
  setActiveTab
}: UseEditorShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S: Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        showToast('Draft saved locally');
      }
      // Cmd+Enter: Refine Selection
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (selection?.text) {
          e.preventDefault();
          setActiveTab('refine');
        }
      }
      // Cmd+K: Global Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-global-search'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selection, showToast, setActiveTab]);
};
