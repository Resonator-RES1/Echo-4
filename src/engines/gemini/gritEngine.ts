import nlp from 'compromise';

/**
 * Linguistic Physics Engine (The Grit Engine)
 * Implements deterministic math-based prose mandates to detect and veto "Sludge".
 * Based on the Sovereign Blueprint v3.0.
 */

export interface GritMetrics {
    burstiness: {
        score: number; // Standard Deviation
        sentenceLengths: number[];
        isSludge: boolean;
        isTarget: boolean;
    };
    concreteRatio: {
        score: number; // Nouns / Adjectives
        nounCount: number;
        adjectiveCount: number;
        adjectivesFound: string[];
        isSludge: boolean;
        isTarget: boolean;
    };
    mandates: string[];
    coda: {
        hasConclusion: boolean;
        abstractionLeak: boolean;
        violationSnippet?: string;
    };
}

export function calculateGrit(text: string): GritMetrics {
    const doc = nlp(text);
    
    // 1. Tokenizer & Word Counter
    const sentences = doc.sentences().json().map((s: any) => s.text);
    const sentenceLengths = sentences.map((s: string) => s.split(/\s+/).filter(w => w.length > 0).length);
    
    // 2. Burstiness Stats (Math Specialist)
    const n = sentenceLengths.length;
    const avg = n > 0 ? sentenceLengths.reduce((a, b) => a + b, 0) / n : 0;
    const variance = n > 0 ? sentenceLengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / n : 0;
    const sigma = Math.sqrt(variance);
    
    // Thresholds: Target > 8.0, Sludge < 4.5
    const burstinessSludge = sigma < 4.5 && n > 2;
    const burstinessTarget = sigma > 8.0;

    // 3. Concrete Ratio (POS Tagger)
    const nouns = doc.nouns().out('array');
    const adjectives = doc.adjectives().out('array');
    
    const nounCount = nouns.length;
    const adjCount = adjectives.length;
    
    // R = Nouns / Adjectives
    const ratio = adjCount > 0 ? nounCount / adjCount : nounCount; 
    
    // Thresholds: Target > 4.0, Sludge < 1.8
    const ratioSludge = ratio < 1.8 && (nounCount + adjCount) > 5;
    const ratioTarget = ratio > 4.0;

    // 4. Coda Veto (The Anti-Moralizer)
    const paragraphs = text.split(/\n\n+/);
    let hasConclusion = false;
    let abstractionLeak = false;
    let violationSnippet = '';
    const abstractWords = ['ultimately', 'legacy', 'shift', 'realization', 'testament', 'growth', 'meaning', 'lesson', 'summary', 'finally'];
    
    for (const p of paragraphs) {
        const pSentences = p.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
        if (pSentences.length === 0) continue;
        const lastSentence = pSentences[pSentences.length - 1].toLowerCase();
        
        if (abstractWords.some(w => lastSentence.includes(w))) {
            hasConclusion = true;
            abstractionLeak = true;
            violationSnippet = lastSentence;
            break;
        }
    }

    // 5. Violation Report (Numerical Mandates)
    const mandates: string[] = [];
    
    if (burstinessSludge) {
        const longestIdx = sentenceLengths.indexOf(Math.max(...sentenceLengths));
        mandates.push(`BURSTINESS FAIL (${sigma.toFixed(2)}): Your sentence lengths are too similar (Sludge).`);
        mandates.push(`MANDATE: Inject rhythmic chaos. Insert a sentence shorter than 4 words immediately after your longest sentence: "${sentences[longestIdx]?.substring(0, 50)}..."`);
    }
    
    if (ratioSludge) {
        const sampleAdjs = adjectives.slice(0, 5).join(', ');
        mandates.push(`CONCRETE RATIO FAIL (${ratio.toFixed(2)}): Too many "Vibe" adjectives detected (Glazing).`);
        mandates.push(`MANDATE: Purge these adjectives: [${sampleAdjs}]. Replace them with concrete physical objects or actions anchored in your Lore Axioms.`);
    }

    if (abstractionLeak) {
        mandates.push(`CODA VETO FAIL: Interpretive summary detected in paragraph end.`);
        mandates.push(`MANDATE: Delete the last sentence: "${violationSnippet}". Do not summarize meaning. Leave the reader on the edge of the last physical detail.`);
    }

    return {
        burstiness: {
            score: sigma,
            sentenceLengths,
            isSludge: burstinessSludge,
            isTarget: burstinessTarget
        },
        concreteRatio: {
            score: ratio,
            nounCount,
            adjectiveCount: adjCount,
            adjectivesFound: adjectives,
            isSludge: ratioSludge,
            isTarget: ratioTarget
        },
        coda: {
            hasConclusion,
            abstractionLeak,
            violationSnippet
        },
        mandates
    };
}

export function injectGritIntoAudit(audit: any, text: string) {
    const grit = calculateGrit(text);
    
    // Ensure audit.conflicts exists
    if (!audit.conflicts) audit.conflicts = [];

    // Inject the math mandates into the audit conflicts
    if (grit.burstiness.isSludge) {
        audit.conflicts.push({
            sentence: `Burstiness Score: ${grit.burstiness.score.toFixed(2)}`,
            reason: grit.mandates.find(m => m.startsWith('BURSTINESS FAIL')) || "Burstiness Sludge"
        });
        const burstMandate = grit.mandates.find(m => m.includes('Inject rhythmic chaos'));
        if (burstMandate) {
            audit.conflicts.push({
                sentence: "Rhythmic Mandate",
                reason: burstMandate
            });
        }
    }
    
    if (grit.concreteRatio.isSludge) {
        audit.conflicts.push({
            sentence: `Concrete Ratio: ${grit.concreteRatio.score.toFixed(2)}`,
            reason: grit.mandates.find(m => m.startsWith('CONCRETE RATIO FAIL')) || "Ratio Sludge"
        });
        const ratioMandate = grit.mandates.find(m => m.includes('Purge these adjectives'));
        if (ratioMandate) {
            audit.conflicts.push({
                sentence: "Lexical Mandate",
                reason: ratioMandate
            });
        }
    }

    if (grit.coda.abstractionLeak) {
        audit.conflicts.push({
            sentence: "Coda Integrity",
            reason: grit.mandates.find(m => m.startsWith('CODA VETO FAIL')) || "Abstract Coda Detected"
        });
        const codaMandate = grit.mandates.find(m => m.includes('Delete the last sentence'));
        if (codaMandate) {
            audit.conflicts.push({
                sentence: "Structural Mandate",
                reason: codaMandate
            });
        }
    }

    // Determine Veto
    const isGritFailed = grit.burstiness.isSludge || grit.concreteRatio.isSludge || grit.coda.abstractionLeak;
    
    return { grit, isGritFailed };
}
