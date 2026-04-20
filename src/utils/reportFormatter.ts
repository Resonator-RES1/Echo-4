import { RefinedVersion } from '../types';

const mapFocusArea = (fa: string) => fa.charAt(0).toUpperCase() + fa.slice(1).replace(/([A-Z])/g, ' $1');

export const formatReportForCopy = (version: RefinedVersion): string => {
    let friendly = `=== SECTION I: ECHO REFINEMENT REPORT (USER FRIENDLY) ===\nTITLE: ${version.title || 'Untitled'}\n\n`;
    friendly += `VERDICT:\n${version.summary || 'Summary unavailable.'}\n\n`;
    
    friendly += `SELF-CORRECTION LOG (PASSES: ${version.healingPasses || 0}):\n`;
    if (version.selfCorrections && version.selfCorrections.length > 0) {
        version.selfCorrections.forEach(sc => {
            friendly += `- ISSUE: ${sc.issueDetected}\n  REFINED: ${sc.correctionApplied}\n  RATIONALE: ${sc.diagnosticRationale}\n`;
        });
    } else {
        friendly += `All Clear\n`;
    }
    friendly += `\n`;
    
    friendly += `LORE CORRECTIONS:\n`;
    if (version.loreCorrections && version.loreCorrections.length > 0) {
        version.loreCorrections.forEach(c => {
            friendly += `- ${c.original} -> ${c.refined} (Reason: ${c.reason})\n`;
        });
    } else {
        friendly += `All Clear\n`;
    }
    friendly += `\n`;

    friendly += `LORE FRAYING:\n`;
    if (version.loreFraying && version.loreFraying.length > 0) {
        version.loreFraying.forEach(f => {
            friendly += `- SNIPPET: "${f.snippet}"\n  CONFLICT: ${f.conflict}\n  SUGGESTION: ${f.suggestion}\n`;
        });
    } else {
        friendly += `All Clear\n`;
    }
    friendly += `\n`;

    friendly += `VOICE RESONANCE:\n`;
    if (version.voiceAudits && version.voiceAudits.length > 0) {
        version.voiceAudits.forEach(v => {
            friendly += `- ${v.characterName}: ${v.resonanceScore}/10 - ${v.dissonanceReason || 'Stable'}\n`;
        });
    } else {
        friendly += `All Clear\n`;
    }
    friendly += `\n`;

    let technical = `=== SECTION II: ECHO REFINEMENT REPORT (TECHNICAL) ===\n`;
    technical += `DISCLAIMER: While these diagnostics are crucial for model refinement, remember: the goal is writing. Do not get trapped perfecting the report. If the prose sings, commit and return to the canvas.\n\n`;
    
    if (version.audit) {
        technical += `FIDELITY AUDIT:\n`;
        technical += `- VOICE FIDELITY: ${version.audit.voiceFidelityScore}/10 (${version.audit.voiceFidelityReasoning})\n`;
        technical += `- LORE COMPLIANCE: ${version.audit.loreCompliance}/10 (${version.audit.loreComplianceReasoning})\n`;
        technical += `- VOICE ADHERENCE: ${version.audit.voiceAdherence}/10 (${version.audit.voiceAdherenceReasoning})\n`;
        technical += `- FOCUS ALIGNMENT: ${version.audit.focusAreaAlignment}/10 (${version.audit.focusAreaAlignmentReasoning})\n`;
        if (version.audit.evolution_audit) {
            technical += `- EVOLUTIONARY DELTA: ${version.audit.evolution_audit.improvement_delta}/10\n  ANALYSIS: ${version.audit.evolution_audit.analysis}\n`;
        }
        technical += `\n`;
    }

    technical += `MIRROR EDITOR ANALYSIS:\n`;
    technical += `- SURGICAL JUSTIFICATION: ${version.justification || 'N/A'}\n`;
    technical += `- THE "WHY" BEHIND CHANGES: ${version.whyBehindChange || 'N/A'}\n`;
    technical += `- COLLISION ANALYSIS: ${version.collisionAnalysis || 'N/A'}\n`;
    technical += `- PHYSICAL COGNITIVE SYNC: ${version.syncAudit || 'N/A'}\n`;
    technical += `- NARRATIVE PATTERN AUDIT: ${version.analysis || 'N/A'}\n`;
    technical += `- EVIDENCE-BASED CLAIMS: ${version.evidenceBasedClaims || 'N/A'}\n`;
    technical += `- LORE LINEAGE PERSISTENCE: ${version.loreLineage || 'N/A'}\n`;
    if (version.mirrorEditorCritique) {
        technical += `- MIRROR EDITOR CRITIQUE: ${version.mirrorEditorCritique}\n`;
    }
    technical += `\n`;
    
    if (version.activeContext) {
        technical += `ACTIVE CONTEXT:\n`;
        technical += `- FOCUS AREAS: ${version.activeContext.focusAreas?.length > 0 ? version.activeContext.focusAreas.map(mapFocusArea).join(', ') : 'None'}\n`;
        technical += `- AUDIT SCOPE: ${version.activeContext.scope?.toUpperCase() || ''} | SURGICAL: ${version.activeContext.isSurgical ? 'YES' : 'NO'}\n`;
        technical += `- PRESETS: ${version.activeContext.presetName || ''} | PILLARS: ${version.activeContext.baselinePillars ? 'ON' : 'OFF'}\n`;
        technical += `- ENGINE: ${version.activeContext.model || ''} | TEMP: ${version.activeContext.temperature || ''} | THINKING: ${version.activeContext.thinkingLevel || ''}\n`;
        if (version.activeContext.customDirectives) technical += `- DIRECTIVES: ${version.activeContext.customDirectives}\n`;
        technical += `\n`;
    }

    if (version.metrics) {
        technical += `PROSE METRICS (ENTROPY):\n`;
        Object.entries(version.metrics).forEach(([key, metric]: [string, any]) => {
            technical += `- ${key.toUpperCase()}: ${metric.score}/10 (${metric.note || ''})\n`;
        });
        technical += `\n`;
    }
    
    technical += `RESTRAINT LOG:\n`;
    if (version.restraintLog && version.restraintLog.length > 0) {
        version.restraintLog.forEach(r => technical += `- ${r.category.toUpperCase()}: ${r.target}\n`);
    } else {
        technical += `All Clear\n`;
    }
    technical += `\n`;

    technical += `METADATA:\n`;
    technical += `- TIMESTAMP: ${version.timestamp}\n`;
    technical += `- VERSION ID: ${version.id}\n`;

    let thinking = `=== SECTION III: AI THINKING PROCESS (SOVEREIGN ENGINE SOURCE) ===\n\n`;
    
    thinking += `NARRATIVE BLUEPRINT:\n`;
    if (version.blueprint) {
        thinking += `- CHAPTER ARC: ${version.blueprint.chapterArc || 'N/A'}\n`;
        thinking += `- TONAL SIGNATURE: ${version.blueprint.tonalSignature || 'N/A'}\n`;
        thinking += `- PRIORITY FOCUS: ${version.blueprint.priorityFocus || 'N/A'}\n`;
        thinking += `- FORESHADOWING: ${version.blueprint.foreshadowingNotes || 'N/A'}\n`;
    } else {
        thinking += `N/A\n`;
    }
    thinking += `\n`;

    thinking += `MECHANICAL MANDATE:\n`;
    if (version.mandate) {
        thinking += `- AXIOMS: ${version.mandate.axioms?.join(' | ') || 'None'}\n`;
        if (version.mandate.objectives && version.mandate.objectives.length > 0) {
            thinking += `- OBJECTIVES:\n`;
            version.mandate.objectives.forEach(obj => {
                thinking += `  * [P${obj.p}] ${obj.t}: ${obj.r}\n`;
            });
        }
    } else {
        thinking += `N/A\n`;
    }
    thinking += `\n`;

    thinking += `NEGATIVE GUARD RAILS:\n`;
    if (version.mandate?.guardrails && version.mandate.guardrails.length > 0) {
        version.mandate.guardrails.forEach(g => thinking += `- ${g}\n`);
    } else {
        thinking += `None\n`;
    }
    thinking += `\n`;

    thinking += `INTERNAL REASONING CHAIN:\n`;
    thinking += `${version.thinking || 'N/A'}\n\n`;

    thinking += `FINAL ARCHITECTURAL JUSTIFICATION:\n`;
    thinking += `${version.justification || 'N/A'}\n`;

    return `${friendly}\n\n${technical}\n\n${thinking}`;
};
