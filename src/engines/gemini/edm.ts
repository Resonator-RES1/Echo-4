import { LoreEntry, VoiceProfile, MemoryAxiom, TimelineEvent, CharacterArc } from '../../types';
import { callAiApi } from './api';
import { EDMSynthesisSchema } from '../../schemas/edmSchemas';
import { zodToGeminiSchema } from '../../utils/zodToGemini';
import { v4 as uuidv4 } from 'uuid';

export const synthesizeDynamicMemory = async (
    loreEntries: LoreEntry[],
    voiceProfiles: VoiceProfile[],
    timelineEvents: TimelineEvent[] = [],
    characterArcs: CharacterArc[] = []
): Promise<MemoryAxiom[]> => {
    
    // Convert entities into a highly scannable format for the AI
    const rawContext = [
        ...loreEntries.map(l => {
            let str = `[LORE_ID:${l.id}] Title: ${l.title}\nDesc: ${l.description}\nSensory: ${l.sensoryPalette || 'N/A'}`;
            if (l.domainData && Object.keys(l.domainData).length > 0) {
                str += `\nSpecifics: ${JSON.stringify(l.domainData)}`;
            }
            if (l.foundationalTruths && l.foundationalTruths.length > 0) {
                str += `\nAxioms: ${l.foundationalTruths.join(' | ')}`;
            }
            return str;
        }),
        ...voiceProfiles.map(v => `[VOICE_ID:${v.id}] Name: ${v.name}\nSoul Pattern: ${v.soulPattern}\nRules: ${v.cognitiveSpeech}`),
        ...timelineEvents.map(e => `[EVENT_ID:${e.id}] Day: ${e.absoluteDay}\nTitle: ${e.title}\nDesc: ${e.description}`),
        ...characterArcs.map(a => `[ARC_ID:${a.id}] Voice: ${a.voiceId}\nTitle: ${a.title}\nGoal: ${a.currentGoal}\nMilestones: ${a.milestones.map(m => `Day ${m.absoluteDay}: ${m.title}`).join(' | ')}`)
    ].join('\n\n---\n\n');

    const prompt = `
<TASK>
You are the Echo Dynamic Memory (EDM) Engine.
Your job is to read raw world-building data (Lore, Voices, Timeline, and Arcs) and synthesize them into precise, immutable "Axioms".
An Axiom is a boolean fact or hard constraint derived from the project data. It strips away the prose and leaves only the law.

<EXAMPLE>
Raw Lore: "Arin lost his left hand in the Battle of Toron five years ago. He is bitter about it."
Good Axiom: "Arin is missing his left hand." (Scope: local, Type: character_fact)
Good Axiom: "Arin cannot use two-handed weapons." (Scope: local, Type: world_rule)

Raw Timeline: "Day 12: The Void Breach. The city of Alara is consumed by darkness."
Good Axiom: "After Day 12, the city of Alara is inaccessible/destroyed." (Scope: global, Type: historical_event)
</EXAMPLE>

Extract all critical rules, facts, and events from the data below. For every axiom, strictly include the corresponding IDs (LORE_ID, VOICE_ID, EVENT_ID, or ARC_ID) in the entityIds array.
</TASK>

<RAW_DATA>
${rawContext}
</RAW_DATA>
`;

    try {
        const response = await callAiApi({
            // Using 2.5 Pro to handle potentially massive lore bases 
            model: 'gemini-2.5-pro',
            prompt,
            systemInstruction: "You are the Echo Dynamic Memory Engine. Extract strict, non-negotiable axioms. Eliminate fluff.",
            responseSchema: zodToGeminiSchema(EDMSynthesisSchema),
            temperature: 0.1 // Analytical configuration
        });

        const rawJson = response.text || '{"axioms":[]}';
        let parsed = JSON.parse(rawJson);
        
        try {
            parsed = EDMSynthesisSchema.parse(parsed);
        } catch (e) {
            console.error("Zod Validation Failed for EDM Synthesis", e);
        }

        const now = new Date().toISOString();
        const synthesizedAxioms: MemoryAxiom[] = parsed.axioms.map((a: any) => ({
            id: uuidv4(),
            type: a.type,
            scope: a.scope,
            entityIds: a.entityIds || [],
            axiom: a.axiom,
            context: a.context,
            lastSynthesized: now,
        }));

        return synthesizedAxioms;

    } catch (error) {
        console.error("Failed to perform Echo Dynamic Memory Synthesis:", error);
        return [];
    }
};
