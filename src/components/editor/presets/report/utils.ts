import { ProseMetrics, FocusArea, RefinedVersion } from '../../../../types';

export const getRecommendations = (metrics: ProseMetrics) => {
    const sortedMetrics = Object.entries(metrics)
        .filter(([key]) => key !== 'voice_consistency') // Voice consistency is always "By Design"
        .filter(([_, val]) => val.qualifier === 'Opportunity')
        .sort((a, b) => a[1].score - b[1].score);

    const suggestions: Record<string, { text: string, area: FocusArea, why: string }> = {
        sensory_vividness: { 
            text: "Enhance Atmosphere", 
            area: 'sensory', 
            why: "The scene lacks physical grounding. Adding sensory details will make it more immersive." 
        },
        pacing_rhythm: { 
            text: "Audit Rhythm", 
            area: 'rhythm', 
            why: "Sentence flow is repetitive. Varying the cadence will improve narrative drive." 
        },
        dialogue_authenticity: { 
            text: "Sharpen Dialogue", 
            area: 'dialogue', 
            why: "Spoken lines feel a bit stiff. Injecting more subtext will make characters feel real." 
        }
    };
    
    // Return top 2 recommendations
    return sortedMetrics.slice(0, 2).map(([key]) => suggestions[key]).filter(Boolean);
};

export const copyReportToClipboard = async (currentVersion: RefinedVersion, showToast: (msg: string) => void) => {
    const { audit, analysis, metrics, summary, activeContext, restraintLog, expressionProfile } = currentVersion;
    
    let reportMarkdown = `# Audit Log\n\n`;

    if (activeContext) {
        reportMarkdown += `## Active Context (Source of Truth)\n`;
        reportMarkdown += `- **Author Voices:** ${activeContext.authorVoices?.length ? activeContext.authorVoices.join(', ') : "None (Respecting Draft)"}\n`;
        reportMarkdown += `- **Character Voices:** ${activeContext.characterVoices?.length ? activeContext.characterVoices.join(', ') : "None"}\n`;
        reportMarkdown += `- **Lore Profiles:** ${activeContext.loreProfiles?.length ? activeContext.loreProfiles.join(', ') : "None"}\n`;
        reportMarkdown += `- **Focus Areas:** ${activeContext.focusAreas?.length ? activeContext.focusAreas.join(', ') : "None"}\n\n`;
    }

    if (audit) {
        reportMarkdown += `## Audit Log\n`;
        reportMarkdown += `**Voice Fidelity Score:** ${audit.voiceFidelityScore}/10\n`;
        reportMarkdown += `*Reasoning:* ${audit.voiceFidelityReasoning}\n\n`;
        
        reportMarkdown += `### Compliance & Adherence\n`;
        reportMarkdown += `- **Lore Compliance:** ${audit.loreCompliance}/10\n`;
        reportMarkdown += `  *Reasoning:* ${audit.loreComplianceReasoning}\n`;
        reportMarkdown += `- **Voice Adherence:** ${audit.voiceAdherence}/10\n`;
        reportMarkdown += `  *Reasoning:* ${audit.voiceAdherenceReasoning}\n`;
        reportMarkdown += `- **Focus Area Alignment:** ${audit.focusAreaAlignment}/10\n`;
        reportMarkdown += `  *Reasoning:* ${audit.focusAreaAlignmentReasoning}\n\n`;
    }

    if (restraintLog && restraintLog.length > 0) {
        reportMarkdown += `## Restraint Log\n`;
        restraintLog.forEach(log => {
            reportMarkdown += `- **[${log.category}]** ${log.target}\n`;
            reportMarkdown += `  *Justification:* ${log.justification}\n`;
        });
        reportMarkdown += `\n`;
    }

    if (analysis) {
        reportMarkdown += `## Mirror Editor Analysis\n`;
        reportMarkdown += `> ${analysis}\n\n`;
    }

    if (expressionProfile && expressionProfile.length > 0) {
        reportMarkdown += `## Expression Profile (Prose Analytics)\n`;
        expressionProfile.forEach(profile => {
            reportMarkdown += `- **${profile.vibe}:** ${profile.score}/10 (${profile.qualifier})\n`;
            reportMarkdown += `  *Note:* ${profile.note}\n`;
        });
        reportMarkdown += `\n`;
    } else if (metrics) {
        reportMarkdown += `## Expression Profile (Prose Analytics)\n`;
        reportMarkdown += `- **Sensory Vividness:** ${metrics.sensory_vividness.score}/10 (${metrics.sensory_vividness.qualifier})\n`;
        reportMarkdown += `  *Note:* ${metrics.sensory_vividness.note}\n`;
        reportMarkdown += `- **Pacing Rhythm:** ${metrics.pacing_rhythm.score}/10 (${metrics.pacing_rhythm.qualifier})\n`;
        reportMarkdown += `  *Note:* ${metrics.pacing_rhythm.note}\n`;
        reportMarkdown += `- **Dialogue Authenticity:** ${metrics.dialogue_authenticity.score}/10 (${metrics.dialogue_authenticity.qualifier})\n`;
        reportMarkdown += `  *Note:* ${metrics.dialogue_authenticity.note}\n`;
        reportMarkdown += `- **Voice Consistency:** ${metrics.voice_consistency.score}/10 (${metrics.voice_consistency.qualifier})\n`;
        reportMarkdown += `  *Note:* ${metrics.voice_consistency.note}\n\n`;
    }

    if (summary) {
        reportMarkdown += `## Editor's Summary\n`;
        reportMarkdown += `${summary}\n`;
    }

    try {
        await navigator.clipboard.writeText(reportMarkdown);
        showToast("Report copied to clipboard!");
    } catch (err) {
        console.error('Failed to copy report: ', err);
        showToast("Failed to copy report.");
    }
};
