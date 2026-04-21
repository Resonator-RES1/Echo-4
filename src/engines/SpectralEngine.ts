import nlp from 'compromise';
import { FocusCategory, SpectrumRange } from '../stores/useSpectralStore';

/**
 * Spectral Focus Engine (SFE v2.0)
 * Deterministic linguistic analysis for real-time focus area projection.
 */

// Forbidden/Sludge words list (Sovereign Burn List)
const SLUDGE_TERMS = [
  'tapestry', 'beacon', 'vibrant', 'shimmering', 'dancing', 
  'testament', 'ultimately', 'perhaps', 'seems', 'felt',
  'suddenly', 'began to', 'managed to', 'basically'
];

export const scanDraftSpectrum = (text: string): { ranges: SpectrumRange[], suggestions: string[] } => {
  if (!text || text.length < 5) return { ranges: [], suggestions: [] };

  const doc = nlp(text);
  const sentences = doc.sentences();
  const ranges: SpectrumRange[] = [];
  const suggestionSet = new Set<string>();

  // Use compromise to get offsets if possible, otherwise fallback to index search
  const sentenceData = sentences.json();
  let currentSearchPos = 0;

  sentenceData.forEach((s: any) => {
    // compromise .json() might have normalized text, we need to find the raw text in the original doc
    const sText = s.text;
    const sTextLower = sText.toLowerCase();
    
    // Find index in original text
    const from = text.indexOf(sText, currentSearchPos);
    if (from === -1) {
        // Fallback: search anywhere if strictly sequential search fails
        const fallbackFrom = text.indexOf(sText);
        if (fallbackFrom === -1) return;
    }
    
    const actualFrom = from !== -1 ? from : text.indexOf(sText);
    const to = actualFrom + sText.length;
    currentSearchPos = to;

    let category: FocusCategory = 'NEUTRAL';
    let suggestion: string | undefined;

    // 1. Sludge Detection (High priority)
    const foundSludge = SLUDGE_TERMS.find(term => new RegExp(`\\b${term}\\b`, 'i').test(sTextLower));
    if (foundSludge) {
      category = 'SLUDGE';
      suggestion = `Sludge detected: "${foundSludge}". Replace with concrete noun.`;
      suggestionSet.add('Clarity & Precision (Remove AI Sludge)');
    } 
    // 2. Dialogue Processing
    else if (sText.includes('"') || sText.includes('“') || sText.includes('”') || sText.includes('—')) {
      category = 'DIALOGUE';
      if (sText.split(' ').length > 20) {
        suggestion = "Dialogue cycle is long. Audit for tags/beats.";
      }
      suggestionSet.add('Dialogue Authenticity & Subtext');
    }
    // 3. Internal Monologue / Thought / Feelings
    else if (/(thought|wondered|realized|knew|felt|remembered|imagined|decided|seemed|looked|wanted|hoped)/i.test(sTextLower)) {
      category = 'INTERNAL';
      suggestionSet.add('Psychological Depth & Monologue');
    }
    // 4. Sensory / Grounding (Noun density)
    else {
      // Analyze terms within this specific sentence
      const sDoc = nlp(sText);
      const nouns = sDoc.nouns().length;
      const adjectives = sDoc.adjectives().length;
      const verbs = sDoc.verbs().length;

      if (nouns + adjectives >= 1) {
          category = 'SENSORY';
          suggestionSet.add('High-Fidelity Sensory Details');
      } else if (verbs >= 1) {
          category = 'TENSILE';
          suggestionSet.add('Rhythm, Cadence & Breath');
      } else if (sText.split(' ').length > 2) {
          category = 'TENSILE';
          suggestionSet.add('Rhythm, Cadence & Breath');
      }
    }

    if (category !== 'NEUTRAL') {
      ranges.push({
        from,
        to,
        category,
        suggestion
      });
    }
  });

  return { 
    ranges, 
    suggestions: Array.from(suggestionSet) 
  };
};

/**
 * Maps categories to UI Focus Areas
 */
export const mapCategoryToFocusArea = (category: FocusCategory): string | null => {
  switch (category) {
    case 'DIALOGUE': return 'dialogue-grit';
    case 'SENSORY': return 'sensory-lock';
    case 'INTERNAL': return 'internal-monologue';
    case 'SLUDGE': return 'ai-purification';
    case 'TENSILE': return 'pacing-rhythm';
    default: return null;
  }
};
