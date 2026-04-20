import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Dropcursor from '@tiptap/extension-dropcursor';
import { Markdown } from 'tiptap-markdown';
import { LoreHighlight } from './extensions/LoreHighlight';

interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onSelectionChange?: (selection: { text: string; start: number; end: number } | null) => void;
  onEditorReady?: (editor: any) => void;
  placeholder?: string;
  className?: string;
  editorRef?: React.MutableRefObject<any>;
  fontSize?: number;
  lineHeight?: number;
  paragraphSpacing?: number;
  loreTerms?: string[];
  onLoreTermClick?: (term: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = React.memo(({
  content,
  onChange,
  onSelectionChange,
  onEditorReady,
  placeholder = 'The canvas is yours. Begin your narrative...',
  className = '',
  editorRef,
  fontSize,
  lineHeight,
  paragraphSpacing = 1.5,
  loreTerms = [],
  onLoreTermClick
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onChangeRef = useRef(onChange);
  const onSelectionChangeRef = useRef(onSelectionChange);

  // Keep refs in sync
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  const extensions = useMemo(() => [
    StarterKit.configure({
      codeBlock: false,
      dropcursor: false,
    }),
    Placeholder.configure({
      placeholder,
    }),
    Typography,
    Dropcursor.configure({
      color: 'var(--color-primary)',
      width: 2,
    }),
    Markdown.configure({
      html: false,
      tightLists: true,
      tightListClass: 'tight',
      bulletListMarker: '-',
      linkify: false,
      breaks: true,
    }),
    LoreHighlight.configure({
      loreTerms,
      onTermClick: onLoreTermClick
    })
  ], [placeholder, loreTerms, onLoreTermClick]);

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        const markdown = (editor.storage as any).markdown.getMarkdown();
        onChangeRef.current(markdown);
      }, 500);
    },
    onSelectionUpdate: ({ editor }) => {
      if (!onSelectionChangeRef.current) return;
      
      const { from, to } = editor.state.selection;
      const onSelectionChange = onSelectionChangeRef.current;
      
      // Use setTimeout to avoid "Cannot update a component while rendering a different component"
      setTimeout(() => {
        if (from === to) {
          onSelectionChange(null);
        } else {
          const text = editor.state.doc.textBetween(from, to, ' ');
          onSelectionChange({ text, start: from, end: to });
        }
      }, 0);
    },
    editorProps: {
      attributes: {
        class: `prose prose-theme max-w-none focus:outline-none min-h-full text-on-surface ${className}`,
        style: `
          ${fontSize ? `font-size: ${fontSize}px;` : ''} 
          ${lineHeight ? `line-height: ${lineHeight};` : ''}
          --paragraph-spacing: ${paragraphSpacing}em;
        `,
      },
    },
  });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Sync display preferences
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: `prose prose-theme max-w-none focus:outline-none min-h-full text-on-surface ${className}`,
            style: `
              ${fontSize ? `font-size: ${fontSize}px;` : ''} 
              ${lineHeight ? `line-height: ${lineHeight};` : ''}
              --paragraph-spacing: ${paragraphSpacing}em;
            `,
          },
        },
      });
    }
  }, [editor, fontSize, lineHeight, paragraphSpacing, className]);

  // Sync external content changes (e.g. from Echo Archive or Scene switching)
  useEffect(() => {
    if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
      // Save current cursor position
      const { from, to } = editor.state.selection;
      editor.commands.setContent(content);
      
      // Restore cursor position safely
      editor.commands.focus();
      const doc = editor.state.doc;
      
      const $from = doc.resolve(Math.min(from, doc.content.size));
      const $to = doc.resolve(Math.min(to, doc.content.size));
      
      if ($from.parent.isTextblock && $to.parent.isTextblock) {
        editor.commands.setTextSelection({ from: $from.pos, to: $to.pos });
      } else {
        // Fallback to end of document if selection is invalid
        editor.commands.setTextSelection(doc.content.size);
      }
    }
  }, [content, editor]);

  // Expose editor instance to parent if needed (for toolbar)
  useEffect(() => {
    if (editor) {
      if (editorRef) {
        editorRef.current = editor;
      }
      if (onEditorReady) {
        onEditorReady(editor);
      }
    }
  }, [editor, editorRef, onEditorReady]);

  return (
    <div className="w-full min-h-full">
      <EditorContent editor={editor} className="min-h-full" />
    </div>
  );
});
