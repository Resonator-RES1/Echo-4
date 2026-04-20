import { GoogleGenAI, Type } from "@google/genai";
import { LoreEntry, VoiceProfile } from '../../types';

export const extractLoreFromText = async (text: string): Promise<Partial<LoreEntry>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
        You are a Sovereign Archivist. Your duty is to identify and preserve the core narrative DNA within the text.
        Extract lore that is vital to the author's world, ignoring generic elements. 
        Focus strictly on elements that define the world's mechanics, history, or specific character contexts.
        
        TEXT:
        "${text}"
        
        Return a JSON object with:
        - title: The name of the subject
        - category: One of "World Mechanics", "Geography & Ecology", "Societal Strata", "Historical Context", "Current State"
        - content: A concise summary of the lore
        - aliases: An array of alternative names or titles mentioned
        - authorialIntentEvidence: Explain why this lore fragment matters to the author's established narrative intent.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        category: { type: Type.STRING },
                        content: { type: Type.STRING },
                        aliases: { type: Type.ARRAY, items: { type: Type.STRING } },
                        authorialIntentEvidence: { type: Type.STRING }
                    },
                    required: ["title", "category", "content", "authorialIntentEvidence"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Lore extraction error:", error);
        throw error;
    }
};

export const extractVoiceFromText = async (text: string): Promise<Partial<VoiceProfile>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
        You are a Sovereign Archivist. Your duty is to identify the unique "Voice DNA" within the text.
        Identify the character and analyze their speaking style, behavior, and archetype, focusing on what makes their voice uniquely human and jagged.
        
        TEXT:
        "${text}"
        
        Return a JSON object with:
        - name: The character's name
        - archetype: Their role or archetype
        - speechPatterns: Unique cadence, specific lexical tendencies, and idiosyncratic phrasing.
        - soulPattern: Their core motivation or worldview.
        - aliases: An array of alternative names or nicknames.
        - frictionSignature: Identify specific "awkward" or "jagged" speech mannerisms that define this character's uniqueness.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        archetype: { type: Type.STRING },
                        speechPatterns: { type: Type.STRING },
                        soulPattern: { type: Type.STRING },
                        aliases: { type: Type.ARRAY, items: { type: Type.STRING } },
                        frictionSignature: { type: Type.STRING }
                    },
                    required: ["name", "archetype", "speechPatterns", "soulPattern", "frictionSignature"]
                }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Voice extraction error:", error);
        throw error;
    }
};
