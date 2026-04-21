import nlp from 'compromise';
import { EntropyMetricsSchema } from "../../schemas/refinementSchemas";

/**
 * EntropyEngine: The "Laboratory of Chaos".
 * Implements deterministic heuristics to detect "AI Sludge" and enforce "Human Entropy".
 */
export const entropyEngine = {
  /**
   * Calculates raw heuristics to guide the LLM's diagnostic pass.
   */
  calculateHeuristics(text: string) {
    const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
    const uniqueWords = new Set(words);
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // 1. Perplexity Proxy: Type-Token Ratio
    const ttr = words.length > 0 ? uniqueWords.size / words.length : 1;
    
    // 2. Burstiness Proxy: Sentence Length Variance (Sigma)
    const lengths = sentences.map(s => s.trim().split(/\s+/).filter(w => w.length > 0).length);
    const n = lengths.length;
    const mean = n > 0 ? lengths.reduce((a, b) => a + b, 0) / n : 0;
    const variance = n > 0 ? lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n : 0;
    const sigma = Math.sqrt(variance);

    // 3. Lexical Entropy: Noun-to-Adjective Density
    const doc = nlp(text);
    const nounsCount = doc.nouns().length;
    const adjectivesCount = doc.adjectives().length;
    const nounAdjectiveRatio = adjectivesCount > 0 ? nounsCount / adjectivesCount : nounsCount;
    
    // 4. Sentence Polarity: The "Jagged Heartbeat"
    // Entropy Pivot: If a sentence > 20 words, the next MUST be < 10 words for maximum grit.
    let polarityViolations = 0;
    let potentialMatches = 0;
    for (let i = 0; i < lengths.length - 1; i++) {
        if (lengths[i] > 20) {
            potentialMatches++;
            if (lengths[i + 1] >= 10) { // Violation if next sentence isn't punchy enough
                polarityViolations++;
            }
        }
    }
    
    // Polarity score: Percent of successful jagged heartbeats
    const polarityScore = potentialMatches > 0 ? (potentialMatches - polarityViolations) / potentialMatches : 1;

    return {
      ttr,
      sigma,
      nounAdjectiveRatio,
      polarityScore,
      sentenceCount: n,
      wordCount: words.length,
      lengths
    };
  },

  /**
   * Injects the Entropy Engine's findings into the Audit prompt.
   */
  getEntropyPromptBlock(text: string) {
    const stats = this.calculateHeuristics(text);
    
    return `
<Entropy_Heuristics_Laboratory>
[DETERMINISTIC_PASS_COMPLETE]:
- Lexical Diversity (TTR): ${stats.ttr.toFixed(2)} (Target: >0.65)
- Rhythmic Burstiness (Sigma): ${stats.sigma.toFixed(2)} (Threshold: < 8.0 is "AI Metronome")
- Noun-to-Adjective Ratio: ${stats.nounAdjectiveRatio.toFixed(2)}:1 (Target: > 4:1)
- Jagged Heartbeat (Polarity): ${(stats.polarityScore * 100).toFixed(0)}% (Goal: Long sentence -> Punchy sentence)

[ENTROPY_MANDATES]:
1. THE SURPRISE AUDIT: Proactively identify words with high probability in AI models but low sensory resonance. Veto them.
2. RHYTHMIC CHAOS (Aggressive): If Sigma < 8.0, you MUST inject burstiness by breaking long sentences and alternating lengths randomly.
3. NOUN ANCHORING: If the Noun-to-Adjective ratio is < 4:1, you MUST delete adjectives and replace them with concrete, sensory nouns from the Lore.
4. SENTENCE POLARITY (Winston Shield): For every sentence > 20 words, the following sentence MUST be < 10 words.
</Entropy_Heuristics_Laboratory>
    `;
  }
};
