import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Node as ProsemirrorNode } from 'prosemirror-model';

export interface LoreHighlightOptions {
    loreTerms: string[];
    onTermClick?: (term: string) => void;
}

export const LoreHighlight = Extension.create<LoreHighlightOptions>({
    name: 'loreHighlight',

    addOptions() {
        return {
            loreTerms: [],
            onTermClick: () => {},
        };
    },

    addProseMirrorPlugins() {
        const options = this.options;

        return [
            new Plugin({
                key: new PluginKey('loreHighlight'),
                state: {
                    init(_, { doc }) {
                        return getDecorations(doc, options.loreTerms);
                    },
                    apply(tr, old, oldState, newState) {
                        if (tr.docChanged) {
                            return getDecorations(tr.doc, options.loreTerms);
                        }
                        return old;
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                    handleClick(view, pos, event) {
                        const target = event.target as HTMLElement;
                        if (target && target.classList.contains('lore-highlight')) {
                            const term = target.getAttribute('data-term');
                            if (term && options.onTermClick) {
                                options.onTermClick(term);
                                return true;
                            }
                        }
                        return false;
                    }
                },
            }),
        ];
    },
});

function getDecorations(doc: ProsemirrorNode, terms: string[]): DecorationSet {
    const decorations: Decoration[] = [];
    if (!terms || terms.length === 0) return DecorationSet.empty;

    // Sort terms by length descending to match longest terms first
    const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
    
    // Create a regex that matches any of the terms as whole words
    const escapedTerms = sortedTerms.map(term => term.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'));
    const regex = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'gi');

    doc.descendants((node, pos) => {
        if (node.isText && node.text) {
            let match;
            while ((match = regex.exec(node.text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                decorations.push(
                    Decoration.inline(start, end, {
                        class: 'lore-highlight text-primary border-b border-primary/30 cursor-pointer hover:bg-primary/10 transition-colors',
                        'data-term': match[0].toLowerCase()
                    })
                );
            }
        }
    });

    return DecorationSet.create(doc, decorations);
}
