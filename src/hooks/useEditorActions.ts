import { useCallback } from 'react';
import { LoreEntry, VoiceProfile, AuthorVoice, ContinuityIssue, RefinedVersion } from '../types';
import { useLoreStore } from '../stores/useLoreStore';

export const useEditorActions = (
  showToast: (message: string) => void,
  versionHistory: RefinedVersion[],
  currentVersionIndex: number,
  onVersionHistoryChange: ((history: RefinedVersion[]) => void) | undefined,
  dispatchDraft: any,
  draftRef: React.MutableRefObject<string>,
  editorRef: React.MutableRefObject<any>
) => {
  const { addLoreEntry, deleteLoreEntry, addVoiceProfile, deleteVoiceProfile, addAuthorVoice, deleteAuthorVoice, deleteVoiceSuite } = useLoreStore();

  const onAddLoreEntry = useCallback(async (entry: LoreEntry) => {
    await addLoreEntry(entry);
    showToast(`Lore entry "${entry.title}" updated.`);
  }, [addLoreEntry, showToast]);

  const onAddVoiceProfile = useCallback(async (profile: VoiceProfile) => {
    await addVoiceProfile(profile);
    showToast(`Voice profile for "${profile.name}" updated.`);
  }, [addVoiceProfile, showToast]);

  const onAddAuthorVoice = useCallback(async (voice: AuthorVoice) => {
    await addAuthorVoice(voice);
    showToast(`Author voice "${voice.name}" updated.`);
  }, [addAuthorVoice, showToast]);

  const onDeleteLoreEntry = useCallback(async (id: string) => {
    await deleteLoreEntry(id);
    showToast("Lore entry deleted.");
  }, [deleteLoreEntry, showToast]);

  const onDeleteVoiceProfile = useCallback(async (id: string) => {
    await deleteVoiceProfile(id);
    showToast("Voice profile deleted.");
  }, [deleteVoiceProfile, showToast]);

  const onDeleteAuthorVoice = useCallback(async (id: string) => {
    await deleteAuthorVoice(id);
    showToast("Author voice deleted.");
  }, [deleteAuthorVoice, showToast]);

  const onDeleteVoiceSuite = useCallback(async (id: string) => {
    await deleteVoiceSuite(id);
    showToast("Persona suite deleted.");
  }, [deleteVoiceSuite, showToast]);

  const handleContinuityFix = useCallback((original: string, replacement: string) => {
    const regex = new RegExp(`\\b${original.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
    const newDraft = draftRef.current.replace(regex, replacement);
    dispatchDraft({ type: 'SET', payload: newDraft });
  }, [dispatchDraft, draftRef]);

  const handleCommitPart = useCallback((partValue: string, isAdded: boolean = true) => {
    if (editorRef.current) {
      if (isAdded) {
        editorRef.current.commands.insertContent(partValue);
        showToast(`Committed addition to draft.`);
      } else {
        const content = editorRef.current.getHTML();
        const newContent = content.replace(partValue, '');
        if (newContent !== content) {
          editorRef.current.commands.setContent(newContent);
          showToast(`Removed text from draft.`);
        } else {
          showToast(`Could not find text to remove in the current draft.`);
        }
      }
    }
  }, [showToast, editorRef]);

  return {
    onAddLoreEntry,
    onAddVoiceProfile,
    onAddAuthorVoice,
    onDeleteLoreEntry,
    onDeleteVoiceProfile,
    onDeleteAuthorVoice,
    onDeleteVoiceSuite,
    handleContinuityFix,
    handleCommitPart,
  };
};
