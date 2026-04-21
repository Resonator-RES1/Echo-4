import nlp from 'compromise';

/**
 * Deterministic Stylistic Engine (DSE)
 * A code-only layer that measures the "Physics" of the prose.
 * Implements the Echo Sovereign Engine blueprint:
 * 1. Rhythmic Validator (Sigma calculation)
 * 2. Lexical Entropy Scanner (TTR, Noun-Density)
 * 3. Wikipedia "Sludge" Purge (Burn List)
 * 4. Winston Shield (Sentence Polarity, Hedge Detection)
 * 5. Structural Veto (Rule of Three, Superficial Analysis)
 */

import sludgeManifest from './sludge_manifest.json';

export interface DSAResult {
    passed: boolean;
    sigma: number;
    ttr: number;
    nounAdjectiveRatio: number;
    polarityScore: number; // 0 to 1
    sludgeDetected: boolean;
    hedgesDetected: boolean;
    hallucinations: {
        anchor: string;
        message: string;
    }[];
    voiceViolations: {
        voice: string;
        message: string;
    }[];
    violations: {
        type: 'Rhythmic' | 'Lexical' | 'Sludge' | 'Polarity' | 'Hedge' | 'Lore' | 'Voice';
        message: string;
        severity: 'low' | 'medium' | 'high';
        blockIndex?: number;
        sentenceIndex?: number;
    }[];
    cleanedText?: string; // Text after immediate purges (Sludge/Hedges)
    fidelityScore: {
        burstiness: number;
        noun_ratio: number;
        sludge_hits: number;
        verdict: 'PASS' | 'FAIL';
    };
}

export const DeterministicStylisticEngine = {
    // Thresholds from Sovereign Blueprint
    SIGMA_THRESHOLD: 10.0,
    NOUN_RATIO_THRESHOLD: 4.0,

    analyze(text: string, activeLore: any[] = [], activeVoices: any[] = []): DSAResult {
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
        const uniqueWords = new Set(words);
        
        // 1. Rhythmic Validator (Sigma)
        const lengths = sentences.map(s => s.trim().split(/\s+/).filter(w => w.length > 0).length);
        const n = lengths.length;
        const mean = n > 0 ? lengths.reduce((a, b) => a + b, 0) / n : 0;
        const variance = n > 0 ? lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n : 0;
        const sigma = Math.sqrt(variance);

        // 2. Lexical Entropy (TTR & Noun-Density)
        const ttr = words.length > 0 ? uniqueWords.size / words.length : 1;
        
        const doc = nlp(text);
        const nounsCount = doc.nouns().length;
        const adjectivesCount = doc.adjectives().length;
        const nounAdjectiveRatio = adjectivesCount > 0 ? nounsCount / adjectivesCount : nounsCount;

        // 5. Structural Veto (Rule of Three, Superficial Analysis, Paragraph Metronome)
        const ruleOfThree = doc.match('#Adjective #Adjective #Adjective').found || doc.match('#Noun #Noun #Noun').found;
        const superficialAnalysis = /[-—]ensuring|[,\\]\s+showcasing/gi.test(text);
        
        // Paragraph Metronome: Detect recurring AI paragraph structures (Topic -> Detail -> Transition)
        let metronomeDetected = false;
        if (paragraphs.length >= 3) {
            const structures = paragraphs.map(p => {
                const docP = nlp(p);
                const firstSentence = docP.sentences().first();
                const lastSentence = docP.sentences().last();
                
                const startsWithTransition = (firstSentence.match('^(However|Meanwhile|Additionally|Furthermore|First|Next|Then)').found);
                const endsWithSummary = (lastSentence.match('(proves|remains|serves|ultimately)').found);
                
                return { startsWithTransition, endsWithSummary };
            });

            // If 2+ consecutive paragraphs use transition starts or summary ends, it's a metronome
            for (let i = 0; i < structures.length - 1; i++) {
                if ((structures[i].startsWithTransition && structures[i+1].startsWithTransition) || 
                    (structures[i].endsWithSummary && structures[i+1].endsWithSummary)) {
                    metronomeDetected = true;
                    break;
                }
            }
        }

        // 6. Coda Veto (The Anti-Moralizer)
        let abstractionLeak = false;
        let codaViolationSnippet = '';
        const abstractWords = ['ultimately', 'legacy', 'realization', 'testament', 'growth', 'lesson learned', 'summary', 'finally', 'meaning'];
        
        for (const p of paragraphs) {
            const pSentences = p.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
            if (pSentences.length === 0) continue;
            const lastSentence = pSentences[pSentences.length - 1].toLowerCase();
            
            if (abstractWords.some(w => lastSentence.includes(w))) {
                abstractionLeak = true;
                codaViolationSnippet = lastSentence;
                break;
            }
        }

        // 3. Winston Shield: Sentence Polarity
        let polarityViolations = 0;
        let potentialMatches = 0;
        for (let i = 0; i < lengths.length - 1; i++) {
            if (lengths[i] > 20) {
                potentialMatches++;
                if (lengths[i + 1] >= 10) {
                    polarityViolations++;
                }
            }
        }
        const polarityScore = potentialMatches > 0 ? (potentialMatches - polarityViolations) / potentialMatches : 1;

        // 4. Sludge & Hedge Detection & Semantic Verification
        const violations: DSAResult['violations'] = [];
        const hallucinations: DSAResult['hallucinations'] = [];
        const voiceViolations: DSAResult['voiceViolations'] = [];
        let sludgeDetected = false;
        let hedgesDetected = false;
        let sludgeHitsCount = 0;
        
        // Purge logic: If sludge found, delete sentence. If hedges found, delete words.
        let finalSentences = [...sentences];
        
        const burnListRegex = new RegExp(`\\b(${sludgeManifest.sludge_patterns.join('|')})\\b`, 'gi');
        const hedgeListRegex = new RegExp(`\\b(${sludgeManifest.hedge_patterns.join('|')})\\b`, 'gi');

        // SEMANTIC GATE: Lore Hallucination Check (Deterministic)
        activeLore.forEach(entry => {
            const terms = [entry.title, ...(entry.aliases || [])];
            const aliasRegex = new RegExp(`\\b(${terms.map(t => t.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('|')})\\b`, 'gi');
            
            if (aliasRegex.test(text)) {
                (entry.foundationalTruths || []).forEach((truth: string) => {
                    const truthKeywords = truth.toLowerCase().split(/\s+/).filter(w => w.length > 4);
                    const negationRegex = new RegExp(`(not|never|no|instead of)\\s+([^.!?]*)\\b(${truthKeywords.map(t => t.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('|')})\\b`, 'gi');
                    if (negationRegex.test(text)) {
                        hallucinations.push({
                            anchor: entry.title,
                            message: `Direct Lore Violation: The text appears to negate the foundational truth '${truth}'.`
                        });
                        violations.push({
                            type: 'Lore',
                            message: `Lore Violation [${entry.title}]: Truth '${truth}' negated.`,
                            severity: 'high'
                        });
                    }
                });
            }
        });

        // SEMANTIC GATE: Voice Validation (Deterministic Tagging)
        activeVoices.forEach(voice => {
            const terms = [voice.name, ...(voice.aliases || [])];
            const voiceRegex = new RegExp(`\\b(${terms.map(t => t.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('|')})\\b`, 'gi');
            
            if (voiceRegex.test(text)) {
                (voice.antiMannerisms || []).forEach((anti: string) => {
                    const antiRegex = new RegExp(`\\b${anti.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi');
                    if (antiRegex.test(text)) {
                        voiceViolations.push({
                            voice: voice.name,
                            message: `Prohibited Mannerism used: '${anti}'`
                        });
                        violations.push({
                            type: 'Voice',
                            message: `Voice Violation [${voice.name}]: Prohibited mannerism '${anti}' detected.`,
                            severity: 'high'
                        });
                    }
                });
            }
        });

        finalSentences = finalSentences.map((s, idx) => {
            const sludgeMatch = s.match(burnListRegex);
            if (sludgeMatch) {
                sludgeDetected = true;
                sludgeHitsCount += sludgeMatch.length;
                violations.push({
                    type: 'Sludge',
                    message: `Sludge detected in sentence ${idx + 1}. Sentence purged.`,
                    severity: 'high',
                    sentenceIndex: idx
                });
                return ""; // Purge sentence
            }
            
            if (hedgeListRegex.test(s)) {
                hedgesDetected = true;
                const cleaned = s.replace(hedgeListRegex, ""); // Delete instances
                violations.push({
                    type: 'Hedge',
                    message: `Hedges detected in sentence ${idx + 1}. Cleaned.`,
                    severity: 'medium',
                    sentenceIndex: idx
                });
                return cleaned;
            }
            return s;
        }).filter(s => s.length > 0);

        // Score validations
        if (sigma < this.SIGMA_THRESHOLD) {
            violations.push({
                type: 'Rhythmic',
                message: `AI Metronome detected (Sigma: ${sigma.toFixed(2)} < ${this.SIGMA_THRESHOLD}). Rewrite paragraph to include two sentences under 5 words.`,
                severity: 'medium'
            });
        }

        if (nounAdjectiveRatio < this.NOUN_RATIO_THRESHOLD && (nounsCount > 0 || adjectivesCount > 0)) {
            violations.push({
                type: 'Lexical',
                message: `Adjective overkill (Ratio: ${nounAdjectiveRatio.toFixed(2)}:1 < ${this.NOUN_RATIO_THRESHOLD}:1).`,
                severity: 'medium'
            });
        }

        if (ttr < 0.60) {
            violations.push({
                type: 'Lexical',
                message: `Low Lexical Density (TTR: ${ttr.toFixed(2)} < 0.60).`,
                severity: 'medium'
            });
        }

        if (ruleOfThree) {
            violations.push({
                type: 'Sludge',
                message: "Rule of Three detected (Consecutive Adjectives/Nouns). Break the list.",
                severity: 'medium'
            });
        }

        if (superficialAnalysis) {
            violations.push({
                type: 'Sludge',
                message: "Superficial Analysis detected (trailing -ensuring/showcasing). Structural Veto applied.",
                severity: 'high'
            });
        }

        if (metronomeDetected) {
            violations.push({
                type: 'Rhythmic',
                message: "Paragraph Metronome detected. Consecutive paragraphs follow predictable AI structures. Use a paragraph shuffler.",
                severity: 'medium'
            });
        }

        if (abstractionLeak) {
            violations.push({
                type: 'Sludge',
                message: `Coda Veto (Moralizer) detected: Abstract wrap-up sentence at end of paragraph ("${codaViolationSnippet.substring(0, 40)}..."). Do not summarize meaning.`,
                severity: 'high'
            });
        }

        const passed = violations.filter(v => v.severity === 'high' || v.severity === 'medium').length === 0;

        return {
            passed,
            sigma,
            ttr,
            nounAdjectiveRatio,
            polarityScore,
            sludgeDetected,
            hedgesDetected,
            hallucinations,
            voiceViolations,
            violations,
            cleanedText: finalSentences.join(" "),
            fidelityScore: {
                burstiness: sigma,
                noun_ratio: nounAdjectiveRatio,
                sludge_hits: sludgeHitsCount,
                verdict: passed ? 'PASS' : 'FAIL'
            }
        };
    }
};
