import { RefineDraftOptions, LoreEntry, VoiceProfile, MemoryAxiom } from "../../types";
import { callAiApi, countTokens } from "./api";
import { zodToGeminiSchema } from "../../utils/zodToGemini";
import { PreFlightOutputSchema } from "../../schemas/refinementSchemas";

/**
 * ContextEngine: Manages the semantic triage and pruning of active context
 * to maintain high-fidelity AI performance within token limits.
 */
export const ContextEngine = {
    async analyzeContext(
        text: string, 
        loreEntries: LoreEntry[], 
        voiceProfiles: VoiceProfile[],
        scope: 'scene' | 'chapter' = 'scene',
        memoryAxioms: MemoryAxiom[] = []
    ): Promise<{ density: any; semantic: { loreIds: string[], voiceIds: string[], axiomIds: string[] } }> {
        const textForAnalysis = typeof text === 'string' ? text : String(text || '');
        if (!textForAnalysis.trim()) {
            return { 
                density: { primary: 'exposition', segments: [] }, 
                semantic: { loreIds: [], voiceIds: [], axiomIds: [] } 
            };
        }

        const contextList = [
            ...loreEntries.map(l => `[LORE:${l.id}] ${l.title}: ${String(l.description || '').substring(0, 100)}`),
            ...voiceProfiles.map(v => `[VOICE:${v.id}] ${v.name}: ${String(v.soulPattern || '').substring(0, 100)}`),
            ...memoryAxioms.map(a => `[AXIOM:${a.id}] Type: ${a.type} | Rule: ${a.axiom}`)
        ].join('\n');

        const prompt = `
Analyze the following text and perform two tasks:
1. Classify Narrative Density: Determine if the text is primarily "action", "dialogue", or "exposition".
2. Semantic Anchoring: Identify which Lore, Voice, or Axiom IDs are relevant to this text.

TEXT:
"${textForAnalysis.substring(0, 2000)}"

AVAILABLE CONTEXT:
${contextList}


Return a JSON object:
{
  "density": {
    "primary": "action" | "dialogue" | "exposition",
    "segments": [{"startIndex": 0, "endIndex": 100, "mode": "action", "snippet": "..."}]
  },
  "semantic": {
    "loreIds": ["id1"],
    "voiceIds": ["id2"],
    "axiomIds": ["id3"]
  }
}
`;

        try {
            const response = await callAiApi({
                model: 'gemini-3.1-flash-lite-preview',
                prompt,
                systemInstruction: "You are a Sovereign Archivist. Perform pre-flight analysis to anchor context, respecting the author's established narrative patterns.",
                responseSchema: zodToGeminiSchema(PreFlightOutputSchema),
                temperature: 0.1
            });

            let parsedPreFlight = JSON.parse(response.text || '{"density":{"primary":"exposition","segments":[]}, "semantic":{"loreIds":[], "voiceIds":[], "axiomIds":[]}}');
            try {
                if (!parsedPreFlight.semantic.axiomIds) parsedPreFlight.semantic.axiomIds = [];
                parsedPreFlight = PreFlightOutputSchema.parse(parsedPreFlight);
            } catch(e) {
                console.warn("Instructor Zod Validation warning:", e);
            }
            return parsedPreFlight;
        } catch (e) {
            console.error("Context Analysis Error:", e);
            return { 
                density: { primary: 'exposition', segments: [] }, 
                semantic: { loreIds: [], voiceIds: [], axiomIds: [] } 
            };
        }
    },

    async pruneContext(
        loreEntries: LoreEntry[], 
        voiceProfiles: VoiceProfile[], 
        targetTokenLimit: number
    ): Promise<{ lore: LoreEntry[], voices: VoiceProfile[] }> {
        const auditorActiveLore = loreEntries.filter(e => e.isActive);
        const auditorActiveVoices = voiceProfiles.filter(v => v.isActive);

        const loreContext = auditorActiveLore.map(l => {
            let str = `${l.title}: ${l.description} ${l.sensoryPalette || ''}`;
            if (l.domainData) str += ` ${JSON.stringify(l.domainData)}`;
            if (l.foundationalTruths) str += ` ${l.foundationalTruths.join(' ')}`;
            return str;
        }).join('\n');
        const voiceContext = auditorActiveVoices.map(v => 
            `${v.name}: ${v.soulPattern} ${v.cognitiveSpeech} ${v.coreMotivation}`
        ).join('\n');
        
        const totalContext = loreContext + voiceContext;
        const tokenCount = await countTokens(totalContext);

        if (tokenCount <= targetTokenLimit) {
            return { lore: auditorActiveLore, voices: auditorActiveVoices };
        }

        console.warn(`Context Pruning Triggered: ${tokenCount} > ${targetTokenLimit} tokens.`);

        const sortedLore = [...auditorActiveLore].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return (String(a.description || '').length) - (String(b.description || '').length);
        });

        const sortedVoices = [...auditorActiveVoices].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return (String(a.soulPattern || '').length) - (String(b.soulPattern || '').length);
        });

        const currentLore: LoreEntry[] = [];
        const currentVoices: VoiceProfile[] = [];
        let currentTokens = 0;

        for (const v of sortedVoices) {
            const vText = `${v.name}: ${v.soulPattern} ${v.cognitiveSpeech} ${v.coreMotivation}`;
            const vTokens = await countTokens(vText);
            if (currentTokens + vTokens < targetTokenLimit * 0.4) { 
                currentVoices.push(v);
                currentTokens += vTokens;
            }
        }

        for (const l of sortedLore) {
            const lText = `${l.title}: ${l.description} ${l.sensoryPalette || ''}`;
            const lTokens = await countTokens(lText);
            if (currentTokens + lTokens < targetTokenLimit) {
                currentLore.push(l);
                currentTokens += lTokens;
            } else {
                break;
            }
        }

        return { lore: currentLore, voices: currentVoices };
    }
};
