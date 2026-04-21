import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { scanDraftSpectrum } from '../../../engines/SpectralEngine';
import { FocusCategory, SpectrumRange } from '../../../stores/useSpectralStore';

export interface SpectralHighlightOptions {
    enabled: boolean;
    onUpdate?: (ranges: SpectrumRange[], suggestions: string[]) => void;
}

export const SpectralHighlight = Extension.create<SpectralHighlightOptions>({
  name: 'spectralHighlight',

  addOptions() {
    return {
      enabled: false,
      onUpdate: () => {},
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('spectralHighlight'),
        state: {
          init(_, { doc }) {
            return DecorationSet.empty;
          },
          apply: (tr, oldDecorationSet) => {
            const enabled = this.options.enabled;
            if (!enabled || !tr.docChanged) {
              return enabled ? oldDecorationSet.map(tr.mapping, tr.doc) : DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const allSuggestions = new Set<string>();

            tr.doc.descendants((node, pos) => {
              if (node.isTextblock && node.textContent.length > 0) {
                const text = node.textContent;
                const { ranges, suggestions } = scanDraftSpectrum(text);
                
                // Add suggestions to the set
                suggestions.forEach(s => allSuggestions.add(s));

                // Map local ranges to document positions and create decorations
                ranges.forEach(range => {
                  let className = '';
                  switch (range.category) {
                    case 'DIALOGUE': className = 'bg-sky-500/10 border-b border-sky-500/30'; break;
                    case 'SENSORY': className = 'bg-emerald-500/10 border-b border-emerald-500/30'; break;
                    case 'INTERNAL': className = 'bg-purple-500/10 border-b border-purple-500/30'; break;
                    case 'SLUDGE': className = 'bg-red-500/20 border-b border-red-500'; break;
                    case 'TENSILE': className = 'bg-amber-500/10 border-b border-amber-500/30'; break;
                  }

                  decorations.push(
                    Decoration.inline(pos + 1 + range.from, pos + 1 + range.to, {
                      class: `spectral-focus ${className} transition-all duration-300`,
                      'data-category': range.category,
                      title: range.suggestion || ''
                    })
                  );
                });
              }
            });

            return DecorationSet.create(tr.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
        view: (view) => {
            let lastEnabled = this.options.enabled;
            
            const syncToReact = (doc: any) => {
                const suggestions = new Set<string>();
                doc.descendants((node: any) => {
                    if (node.isTextblock && node.textContent.length > 0) {
                        const { suggestions: s } = scanDraftSpectrum(node.textContent);
                        s.forEach(item => suggestions.add(item));
                    }
                });
                if (this.options.onUpdate) {
                    this.options.onUpdate([], Array.from(suggestions));
                }
            };

            // Initial sync if enabled
            if (this.options.enabled) {
                syncToReact(view.state.doc);
            }

            return {
                update: (view, prevState) => {
                    const enabled = this.options.enabled;
                    const enabledChanged = enabled !== lastEnabled;
                    lastEnabled = enabled;

                    if (!enabled) return;
                    
                    if (!view.state.doc.eq(prevState.doc) || enabledChanged) {
                        syncToReact(view.state.doc);
                    }
                }
            }
        }
      }),
    ];
  },
});
