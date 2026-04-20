import React, { useState, useCallback, useEffect } from 'react';
import { Sun, Wand2, Clapperboard } from 'lucide-react';
import { FormattingToolbar } from './FormattingToolbar';
import { RichTextEditor } from './RichTextEditor';
import { Chapter, Scene, DisplayPrefs } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { SceneExtractionModal } from './SceneExtractionModal';
import { useEditorUIStore } from '../../stores/useEditorUIStore';
import { useDisplayStore } from '../../stores/useDisplayStore';

interface EditorCanvasProps {
  editorRef: any;
  editorMode: 'polishing' | 'drafting';
  setEditorMode: (mode: 'polishing' | 'drafting') => void;
  dispatchDraft: any;
  draftState: any;
  selection: { text: string; start: number; end: number } | null;
  surgicalSelection: { text: string; start: number; end: number } | null;
  setSurgicalSelection: (sel: { text: string; start: number; end: number } | null) => void;
  setSelection: any;
  handleAcceptChanges: () => void;
  onCommitPart?: (part: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  wordCount: number;
  showToast: (message: string) => void;
  onRefreshManuscript: () => void;
  loreTerms?: string[];
  onLoreTermClick?: (term: string) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = React.memo(({
  editorRef,
  editorMode,
  setEditorMode,
  dispatchDraft,
  draftState,
  selection,
  surgicalSelection,
  setSurgicalSelection,
  setSelection,
  handleAcceptChanges,
  onCommitPart,
  saveStatus,
  wordCount,
  showToast,
  onRefreshManuscript,
  loreTerms,
  onLoreTermClick
}) => {
  const { activeTab, isZenMode, isUIVisible, setIsZenMode, setActiveTab } = useEditorUIStore();
  const { displayPrefs, setDisplayPrefs } = useDisplayStore();
  const [editor, setEditor] = useState<any>(null);
  const [showDisplayHUD, setShowDisplayHUD] = useState(false);
  const [showSceneExtraction, setShowSceneExtraction] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveFontSize = displayPrefs.dynamicFontScaling 
    ? Math.max(14, Math.min(24, Math.round(windowWidth / 60))) 
    : displayPrefs.fontSize;

  const handleEditorChange = useCallback((markdown: string) => {
    dispatchDraft({ type: 'SET', payload: markdown });
  }, [dispatchDraft]);

  const handleExtracted = useCallback((mode: 'copy' | 'cut') => {
    if (mode === 'cut' && selection && editorRef.current) {
      editorRef.current.commands.deleteSelection();
    }
    onRefreshManuscript();
  }, [selection, editorRef, onRefreshManuscript]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
      {/* Top Toolbar Area */}
      <div className={`flex flex-col border-b border-outline-variant/5 transition-all duration-500 ${isZenMode && !isUIVisible ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="h-14 px-8 flex items-center justify-center bg-surface-container-low/30 backdrop-blur-sm relative">
          {isZenMode && (
            <div className="absolute left-8 flex items-center gap-2">
              <button 
                onClick={() => setIsZenMode(false)}
                className="p-2 rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors"
                title="Exit Zen Mode"
              >
                <Sun className="w-5 h-5" />
              </button>
            </div>
          )}

          <FormattingToolbar 
            editor={editor} 
            onToggleDisplayHUD={() => setShowDisplayHUD(!showDisplayHUD)}
            showDisplayHUD={showDisplayHUD}
          />
        </div>

        {/* Display HUD (Sliding Panel) */}
        <AnimatePresence>
          {showDisplayHUD && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-surface-container-low/50 border-b border-outline-variant/10"
            >
              <div className="p-4 px-8 flex flex-wrap items-center justify-center gap-5">
                <div className="flex flex-col gap-1 w-48">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">Font Size</label>
                    <span className="text-[9px] font-mono text-primary">{effectiveFontSize}px</span>
                  </div>
                  <input 
                    type="range" min="14" max="24" step="1"
                    value={effectiveFontSize}
                    onChange={(e) => setDisplayPrefs({ ...displayPrefs, fontSize: parseInt(e.target.value), dynamicFontScaling: false })}
                    className="w-full accent-primary h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer"
                  />
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={displayPrefs.dynamicFontScaling || false}
                      onChange={(e) => setDisplayPrefs({ ...displayPrefs, dynamicFontScaling: e.target.checked })}
                      className="accent-primary"
                    />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60">Auto-Scale</span>
                  </label>
                </div>

                <div className="flex flex-col gap-1 w-48">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">Line Height</label>
                    <span className="text-[9px] font-mono text-primary">{displayPrefs.lineHeight}</span>
                  </div>
                  <input 
                    type="range" min="1.4" max="2.5" step="0.1"
                    value={displayPrefs.lineHeight}
                    onChange={(e) => setDisplayPrefs({ ...displayPrefs, lineHeight: parseFloat(e.target.value) })}
                    className="w-full accent-primary h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1 w-48">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">Paragraph Spacing</label>
                    <span className="text-[9px] font-mono text-primary">{displayPrefs.paragraphSpacing}em</span>
                  </div>
                  <input 
                    type="range" min="0.5" max="3" step="0.1"
                    value={displayPrefs.paragraphSpacing}
                    onChange={(e) => setDisplayPrefs({ ...displayPrefs, paragraphSpacing: parseFloat(e.target.value) })}
                    className="w-full accent-primary h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">Content Width</label>
                  <div className="flex gap-1">
                    {['max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-full'].map((w) => (
                      <button
                        key={w}
                        onClick={() => setDisplayPrefs({ ...displayPrefs, maxWidth: w })}
                        className={`px-2 py-1 rounded border text-[8px] font-bold uppercase tracking-tighter transition-all ${
                          displayPrefs.maxWidth === w 
                            ? 'bg-primary border-primary text-on-primary-fixed' 
                            : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'
                        }`}
                      >
                        {w.replace('max-w-', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 lg:p-5">
        <div className={`w-full mx-auto ${displayPrefs.maxWidth}`}>
          <RichTextEditor
              editorRef={editorRef}
              onEditorReady={setEditor}
              content={draftState.present}
              onChange={handleEditorChange}
              onSelectionChange={setSelection}
              className="text-on-surface"
              fontSize={effectiveFontSize}
              lineHeight={displayPrefs.lineHeight}
              paragraphSpacing={displayPrefs.paragraphSpacing}
              loreTerms={loreTerms}
              onLoreTermClick={onLoreTermClick}
          />
        </div>
      </div>

      {/* Contextual Surgical Mode Button */}
      {selection && selection.text.length > 0 && activeTab === 'draft' && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex gap-2 animate-in fade-in slide-in-from-bottom-2">
          <button 
            onClick={() => setActiveTab('refine')} 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary-fixed rounded-full shadow-lg font-label text-xs uppercase tracking-widest hover:scale-105 transition-transform"
          >
            <Wand2 className="w-4 h-4" /> Audit Selection
          </button>
          <button 
            onClick={() => setShowSceneExtraction(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest text-on-surface rounded-full shadow-lg font-label text-xs uppercase tracking-widest hover:scale-105 transition-transform border border-white/10"
          >
            <Clapperboard className="w-4 h-4" /> Extract to Scene
          </button>
        </div>
      )}

      <SceneExtractionModal 
        isOpen={showSceneExtraction}
        onClose={() => setShowSceneExtraction(false)}
        selectedText={selection?.text || ''}
        onExtracted={handleExtracted}
        showToast={showToast}
      />
    </div>
  );
});
