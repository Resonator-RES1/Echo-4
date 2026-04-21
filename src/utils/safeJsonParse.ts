export const safeJsonParse = (jsonString: string) => {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        // If it fails, attempt to strip comments or non-json wrappers
        let cleaned = jsonString.replace(/^\\s*```json\\n?/i, '').replace(/\\n?```\\s*$/i, '').trim();
        // Try finding the first { and last }
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
             cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        }
        try {
            // Attempt 2: Clean trailing commas and common LLM malformations
            const cleaned2 = cleaned.replace(/,\s*([}\]])/g, '$1');
            return JSON.parse(cleaned2);
        } catch (innerE2) {
            console.error("Failed to parse JSON even after structural cleaning:", innerE2);
            return {};
        }
    }
};
