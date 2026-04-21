import { VoiceProfile, LoreEntry, RefineDraftOptions } from "../../types";

export interface ResolvedProfileFields {
    tone?: string;
    speech_style?: string;
    emotional_access?: string;
    power_access?: number;
    core_motivation?: string;
    soul_pattern?: string;
    cognitive_speech?: string;
    internal_monologue?: string;
    [key: string]: any;
}

export const ProfileResolutionEngine = {
    /**
     * Resolves all active profiles for a scene using Versioned Profile Inheritance (VPI v1.0).
     */
    resolveActiveProfiles(state: any) {
        const { 
            historicalVoices, 
            historicalLore, 
            narrativeLayerOutput,
            options 
        } = state;

        const sceneContext = {
            sceneType: narrativeLayerOutput?.scene_structure?.pacing || 'medium',
            emotionalCurve: narrativeLayerOutput?.scene_structure?.emotional_curve || 'stable',
            focusWeights: narrativeLayerOutput?.focus_weights || { sensory: 0.5, dialogue: 0.5, action: 0.5, exposition: 0.5 },
            storyDay: options.storyDay || 0
        };

        const activeProfiles: Record<string, any> = {};

        // Resolve Voices
        const bases = historicalVoices.filter((v: any) => !v.parentId);
        const deltas = historicalVoices.filter((v: any) => !!v.parentId);

        bases.forEach((base: any) => {
            activeProfiles[base.name] = this.resolveIndividual(base, deltas, sceneContext);
        });

        // Resolve Lore (optional, but requested for "Lore system")
        const loreBases = historicalLore.filter((l: any) => !l.parentId);
        const loreDeltas = historicalLore.filter((l: any) => !!l.parentId);

        loreBases.forEach((base: any) => {
            activeProfiles[base.title] = this.resolveIndividual(base, loreDeltas, sceneContext);
        });

        return activeProfiles;
    },

    resolveIndividual(base: any, deltas: any[], context: any) {
        // Step 1: Gather all versions (Base + Relevant Deltas)
        const versions = [base, ...deltas.filter(d => d.parentId === base.id)];
        
        // Step 2: Resolve per field
        const resolved: any = { ...base };
        
        const fieldsToResolve = [
            'tone', 'speech_style', 'emotional_access', 'power_access',
            'coreMotivation', 'soulPattern', 'cognitiveSpeech', 'internalMonologue',
            'vocabularyDiction', 'pacingRhythm', 'description', 'foundationalTruths',
            'tensionVectors'
        ];

        fieldsToResolve.forEach(field => {
            const winner = this.resolveField(field, versions, context);
            if (winner !== undefined) {
                resolved[field] = winner;
            }
        });

        return resolved;
    },

    resolveField(field: string, versions: any[], context: any) {
        // VPI v1.0 Priority System
        const fieldPriority: Record<string, number> = {
            lore_locked: 100, // Axiom level absolute
            scene_locked: 90, // Specific match for scene type
            recent_versions: 70, // Chronological weight
            context_match: 80, // Day/Timeline proximity
            author_override: 60 // Pinned or forced
        };

        const candidates = versions
            .filter(v => v[field] !== undefined && v[field] !== null && v[field] !== '')
            .map((v, index) => {
                let score = 0;
                
                // 1. Lore Locked (Priority 100)
                if (v.axiomLevel === 'absolute' || v.foundationalTruths?.length > 0) {
                    score += fieldPriority.lore_locked;
                }
                
                // 2. Scene Locked (Priority 90)
                // Heuristic: Check if the version is specifically for this scene type (combat, dialogue, etc)
                if (v.category?.toLowerCase() === context.sceneType?.toLowerCase()) {
                    score += fieldPriority.scene_locked;
                }

                // 3. Context Match (Priority 80)
                if (v.storyDay === context.storyDay) {
                    score += fieldPriority.context_match;
                } else if (v.storyDay && Math.abs(v.storyDay - context.storyDay) <= 3) {
                    score += fieldPriority.context_match * 0.5;
                }

                // 4. Recent Versions (Priority 70)
                // Weight by position in the stack (newer is later in index)
                const recencyWeight = (index + 1) / versions.length;
                score += recencyWeight * fieldPriority.recent_versions;

                // 5. Author Override (Priority 60)
                if (v.isPinned) {
                    score += fieldPriority.author_override;
                }

                return { value: v[field], score };
            })
            .sort((a, b) => b.score - a.score);

        return candidates[0]?.value;
    }
};
