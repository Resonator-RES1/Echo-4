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
    
    // 3. Sentence Polarity: The "Jagged Heartbeat"
    // Entropy Pivot: If a sentence > 25 words, the next MUST be < 5 words for maximum grit.
    let polarityViolations = 0;
    let potentialMatches = 0;
    for (let i = 0; i < lengths.length - 1; i++) {
        if (lengths[i] > 25) {
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
- Lexical Diversity (TTR): ${stats.ttr.toFixed(2)} (Target: >0.65 for high complexity)
- Rhythmic Burstiness (Sigma): ${stats.sigma.toFixed(2)} (Target: >12.0 for human chaos)
- Jagged Heartbeat (Polarity): ${(stats.polarityScore * 100).toFixed(0)}% (Goal: 100% of Long sentences followed by <10 word punch)

[ENTROPY_MANDATES]:
1. THE SURPRISE AUDIT: Proactively identify words with high probability in AI models but low sensory resonance. Veto them.
2. RHYTHMIC CHAOS (Aggressive): If you find a block where sentence lengths are too similar, trigger a "Surgical Veto". 
3. SENTENCE POLARITY: For every sentence longer than 25 words, you MUST ensure the following sentence is a "shrapnel sentence" (less than 5 words).
4. CHARACTER-SPECIFIC ENTROPY: If the current voice has a distinct linguistic fingerprint, enhance its non-standard grammatical quirks.
</Entropy_Heuristics_Laboratory>
    `;
  }
};
