import { Type } from "@google/genai";
import { callAiApi } from "./api";
import { LoreEntry, VoiceProfile, Scene, CalendarConfig, ContinuityIssue } from "../../types";
import { formatStoryDate } from "../../utils/calendar";

export const checkConsistencyWithAI = async (
    text: string,
    loreEntries: LoreEntry[],
    voiceProfiles: VoiceProfile[],
    currentScene?: Scene,
    calendarConfig?: CalendarConfig
): Promise<ContinuityIssue[]> => {
    if (!text.trim() || (loreEntries.length === 0 && voiceProfiles.length === 0)) {
        return [];
    }

    const activeLore = loreEntries.filter(e => e.isActive);
    const activeVoices = voiceProfiles.filter(v => v.isActive);

    // If no active context, we can't check consistency against anything
    if (activeLore.length === 0 && activeVoices.length === 0) {
        return [];
    }

    const prompt = `
<CONTEXT>
  <LORE>
    ${activeLore.map(l => {
        let str = `- ${l.title} (${l.categoryId}): ${l.description}`;
        if (l.domainData && Object.keys(l.domainData).length > 0) {
            str += ` | Specifics: ${JSON.stringify(l.domainData)}`;
        }
        if (l.foundationalTruths && l.foundationalTruths.length > 0) {
            str += ` | Axioms: ${l.foundationalTruths.join(', ')}`;
        }
        return str;
    }).join('\n')}
  </LORE>
  <VOICES>
    ${activeVoices.map(v => `- ${v.name} (${v.archetype}): ${v.soulPattern}`).join('\n')}
  </VOICES>
  ${currentScene ? `
  <SCENE_CONTEXT>
    Story Date: ${formatStoryDate(currentScene.storyDate, calendarConfig)} (Absolute Day: ${currentScene.storyDay})
  </SCENE_CONTEXT>` : ''}
</CONTEXT>

<DRAFT_TEXT>
  ${text}
</DRAFT_TEXT>

<KINTSUGI_GUARDRAIL>
Before flagging a "consistency error":
1. Cross-reference the "weird" moment with the Character's 'Soul_Pattern' or Lore 'Axiom'.
2. If the anomaly aligns with intended character behavior or specific authorial intent (even if it violates generic logic rules), it is 'Gold' (Kintsugi). DO NOT FLAG IT.
3. Only flag 'Distortion' if the anomaly reflects an genuine error that obscures the author's narrative intent.
</KINTSUGI_GUARDRAIL>

<TASK>
Based on the information provided in <CONTEXT>, analyze the <DRAFT_TEXT> for actual narrative distortions, keeping the <KINTSUGI_GUARDRAIL> in mind.

  1. Lore Contradictions: Does the text contradict established facts that undermine the author's intent?
  2. Character Inconsistencies: Does a character act against their core motivation in a way that feels unearned (not just surprising)?
  3. Timeline Errors: Are there events happening out of order that break the chapter's integrity?

  Return an array of issues. If it's a Kintsugi moment, return an empty array.
</TASK>
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                severity: { type: Type.STRING },
                message: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                frictionPreservationLog: { type: Type.STRING, description: "If the AI decided to ignore the issue due to Kintsugi Guardrail, log the snippet and why it adds soul." },
                actionable: {
                    type: Type.OBJECT,
                    properties: {
                        original: { type: Type.STRING },
                        replacement: { type: Type.STRING }
                    }
                }
            },
            required: ["id", "type", "severity", "message"]
        }
    };

    try {
        const response = await callAiApi({
            model: 'gemini-3.1-flash-lite-preview',
            prompt,
            systemInstruction: "You are Echo, a Sovereign Archivist. Your role is the protection of the author's intent. You detect distortions, not friction.",
            responseSchema,
            thinkingConfig: { thinkingLevel: 'minimal' },
            temperature: 0.1 // Stricter for consistency
        });

        const issues: ContinuityIssue[] = JSON.parse(response.text || '[]');
        return issues;
    } catch (error) {
        console.error("AI Consistency Check Error:", error);
        return [];
    }
};
