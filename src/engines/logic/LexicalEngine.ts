import nlp from 'compromise';
import sludgeManifest from '../gemini/sludge_manifest.json';

/**
 * LexicalEngine: The "Weaponized Thesaurus"
 * De-noises AI prose by forcing high-entropy word choices.
 */
export const LexicalEngine = {
    /**
     * Fetches contextual synonyms from Datamuse API.
     * @param word The target word to replace.
     * @param context Optional keywords to bias the choice (e.g., "industrial", "rot").
     */
    async getGritAlternatives(word: string, context: string[] = []): Promise<string[]> {
        const ml = word;
        const lc = context.join(',');
        const url = `https://api.datamuse.com/words?ml=${ml}&lc=${lc}&max=10`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            // We want words that are semantically relevant but perhaps less common (lower frequency)
            // or we pick from the middle of the result set to avoid the #1 most probable match.
            return data.map((item: any) => item.word);
        } catch (e) {
            console.error("Datamuse API failure:", e);
            return [];
        }
    },

    /**
     * Performs deterministic swaps based on the Sovereign Replacement Map.
     */
    weaponize(text: string, loreContext: any[] = []): string {
        let weaponizedText = text;

        // 1. Lore-Swapping (Deterministic World-Building Lexicon)
        // e.g., If in "The Slums", "computer" -> "terminal-scrap"
        loreContext.forEach(lore => {
            if (lore.lexicon && typeof lore.lexicon === 'object') {
                Object.entries(lore.lexicon).forEach(([target, replacement]) => {
                    const regex = new RegExp(`\\b${target}\\b`, 'gi');
                    // We check if the lore entry is "active" or "proximal"
                    // For now, we assume if it's in loreContext, it applies.
                    weaponizedText = weaponizedText.replace(regex, replacement as string);
                });
            }
        });

        // 2. Sludge Burn-List Swaps
        // Uses the random-choice swap for "Burn List" words.
        const burnMap: Record<string, string[]> = (sludgeManifest as any).burn_map || {};
        
        Object.entries(burnMap).forEach(([sludge, alternatives]) => {
            const regex = new RegExp(`\\b${sludge}\\b`, 'gi');
            weaponizedText = weaponizedText.replace(regex, () => {
                return alternatives[Math.floor(Math.random() * alternatives.length)];
            });
        });

        return weaponizedText;
    },

    /**
     * Advanced: Context-Aware Substitution
     * Uses POS tagging to target only adjectives/adverbs (sludge).
     */
    async deepGritify(text: string, context: string[] = []): Promise<string> {
        const doc = nlp(text);
        const sludgeWords = ['vibrant', 'delicate', 'shrouded', 'mysterious', 'tapestry', 'testament'];
        
        // Target adjectives and adverbs that are in our "soft" list
        const targets = doc.match('#Adjective, #Adverb').filter(m => {
            const word = m.text().toLowerCase().trim();
            return sludgeWords.includes(word);
        });

        let gritified = text;

        // We process in reverse to not mess up offsets if we were doing index-based, 
        // but here we can just do a loop of replacements.
        for (const target of targets.json()) {
            const original = target.text;
            const alts = await this.getGritAlternatives(original, context);
            
            if (alts.length > 5) {
                // Pick #4 or #5 for entropy (statistical surprise)
                const grit = alts[Math.floor(Math.random() * 2) + 3]; 
                const regex = new RegExp(`\\b${original}\\b`, 'g');
                gritified = gritified.replace(regex, grit);
            }
        }

        return gritified;
    }
};
