import { GoogleGenAI, Type } from "@google/genai";

const SCENE_MODEL = "gemini-3-flash";

const cleanJsonResponse = (text: string | undefined): string => {
    const rawText = text || "[]";
    return rawText.replace(/^```json\n?/, '').replace(/```$/, '').trim();
};

export const generateSceneSummary = async (text: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Summarize the following scene in 2-3 concise sentences, focusing on the main events and character developments:\n\n${text}`;

    try {
        const response = await ai.models.generateContent({
            model: SCENE_MODEL,
            contents: prompt,
        });
        return response.text || '';
    } catch (error) {
        console.error("Scene summary error:", error);
        throw error;
    }
};

export const analyzeSceneContinuity = async (text: string, previousSummaries: string[]): Promise<string[]> => {
    if (!previousSummaries || previousSummaries.length === 0) return [];

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
        Analyze the following current scene against the summaries of previous scenes to identify any potential continuity errors or inconsistencies.
        Focus on character locations, states, items, time progression, and established facts.
        
        Previous Scene Summaries:
        ${previousSummaries.map((s, i) => `Scene ${i + 1}: ${s}`).join('\n')}
        
        Current Scene:
        "${text}"
        
        Return a JSON array of strings, where each string describes a potential continuity issue. If none are found, return an empty array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: SCENE_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(cleanJsonResponse(response.text));
    } catch (error) {
        console.error("Continuity analysis error:", error);
        return [];
    }
};

export const generateSceneSuggestions = async (text: string): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `
        Based on the following scene, provide 2-3 brief, creative suggestions for what could happen next.
        Keep suggestions concise and focused on narrative progression or character conflict.
        
        Scene:
        "${text}"
        
        Return a JSON array of strings.
    `;

    try {
        const response = await ai.models.generateContent({
            model: SCENE_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });
        return JSON.parse(cleanJsonResponse(response.text));
    } catch (error) {
        console.error("Scene suggestions error:", error);
        return [];
    }
};

export const generateSceneTitle = async (text: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Generate a short, evocative title (1-4 words) for the following scene:\n\n${text}`;

    try {
        const response = await ai.models.generateContent({
            model: SCENE_MODEL,
            contents: prompt,
        });
        return (response.text || '').replace(/["']/g, '').trim();
    } catch (error) {
        console.error("Scene title error:", error);
        return "Untitled Scene";
    }
};
