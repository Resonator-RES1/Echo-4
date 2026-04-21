import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { getSetting } from "../../services/dbService";
import { AiPayload } from "../../types";

export async function countTokens(text: string, model?: string): Promise<number> {
    const apiKey = process.env.GEMINI_API_KEY 
        || (await getSetting('api_key'))
        || import.meta.env.VITE_GEMINI_API_KEY 
        || import.meta.env.VITE_API_KEY;
        
    if (!apiKey) return Math.ceil(text.length / 4); // Fallback estimate

    const ai = new GoogleGenAI({ apiKey });
    const modelName = model || "gemini-3.1-flash-lite-preview";
    
    try {
        const result = await ai.models.countTokens({
            model: modelName,
            contents: [{ parts: [{ text }] }]
        });
        return result.totalTokens;
    } catch (e) {
        console.error("Token Count Error:", e);
        return Math.ceil(text.length / 4);
    }
}

export async function callAiApi(payload: AiPayload, retryCount = 0): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY 
        || (await getSetting('api_key'))
        || import.meta.env.VITE_GEMINI_API_KEY 
        || import.meta.env.VITE_API_KEY;
        
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please check your environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const { model, prompt, systemInstruction, temperature, thinkingConfig, responseSchema, feedbackDepth, onStream } = payload;
    const modelName = model || "gemini-3.1-flash-lite-preview";

    // Intelligence Model & Polish Depth Optimization
    // Tie thinking level to the user's requested polish depth and model capabilities
    let thinkingLevel = ThinkingLevel.LOW; // Default
    const isLite = modelName.includes('lite');
    const supportsThinking = modelName.includes('3.1') || modelName.includes('thinking');

    // MAPPING LOGIC (Sovereign Engine Directive)
    if (thinkingConfig?.thinkingLevel) {
        thinkingLevel = thinkingConfig.thinkingLevel === 'high' ? ThinkingLevel.HIGH : 
                        thinkingConfig.thinkingLevel === 'medium' ? (ThinkingLevel as any).MEDIUM || ThinkingLevel.LOW :
                        thinkingConfig.thinkingLevel === 'low' ? ThinkingLevel.LOW : 
                        thinkingConfig.thinkingLevel === 'minimal' ? ThinkingLevel.MINIMAL :
                        ThinkingLevel.LOW;
    } else if (feedbackDepth === 'in-depth') {
        // Only allow HIGH thinking if not a Lite model (Physics constraint)
        thinkingLevel = isLite ? ThinkingLevel.LOW : ThinkingLevel.HIGH; 
    } else if (feedbackDepth === 'balanced') {
        // Balanced on non-lite can use MEDIUM if supported, otherwise LOW
        thinkingLevel = isLite ? ThinkingLevel.MINIMAL : (ThinkingLevel as any).MEDIUM || ThinkingLevel.LOW;
    } else {
        // 'casual' -> ThinkingLevel.MINIMAL
        thinkingLevel = ThinkingLevel.MINIMAL;
    }

    const config: any = {
        systemInstruction,
        // MANDATE: When thinking is active on 3.1+, temperature MUST be 1.0 per Google specs
        temperature: (supportsThinking && modelName.includes('3.1')) ? 1.0 : (temperature ?? 0.7), 
        responseMimeType: "application/json",
        responseSchema: responseSchema,
    };

    // Only inject thinkingConfig if the model is known to support it (3.x or explicit thinking models)
    if (supportsThinking) {
        config.thinkingConfig = { thinkingLevel };
    }

    try {
        if (onStream) {
            const responseStream = await ai.models.generateContentStream({
                model: modelName,
                contents: [{ parts: [{ text: prompt }] }],
                config
            });

            let fullText = "";
            let fullThinking = "";

            for await (const chunk of responseStream) {
                let text = "";
                let thinking = "";

                const parts = chunk.candidates?.[0]?.content?.parts || [];
                for (const part of parts) {
                    // Handle both possible SDK representations of thoughts
                    if (part.thought) {
                        if (typeof part.thought === 'string') {
                            thinking += part.thought;
                        } else if (part.thought === true && part.text) {
                            thinking += part.text;
                        }
                    } else if (part.text) {
                        text += part.text;
                    }
                }
                
                fullText += text;
                fullThinking += thinking;

                onStream({ text, thinking });
            }

            // Return a mock response object that matches the structure expected by callers
            return {
                text: fullText,
                candidates: [{
                    content: {
                        parts: [
                            { text: fullText },
                            ...(fullThinking ? [{ thought: fullThinking }] : [])
                        ]
                    }
                }]
            };
        } else {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: [{ parts: [{ text: prompt }] }],
                config
            });

            return response;
        }
    } catch (error: any) {
        const isRateLimit = error?.message?.includes('429') || error?.status === 429 || JSON.stringify(error).includes('429');
        
        if (isRateLimit && retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 2000 + Math.random() * 1000;
            console.warn(`Rate limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${retryCount + 1}/3)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callAiApi(payload, retryCount + 1);
        }
        
        throw error;
    }
}
