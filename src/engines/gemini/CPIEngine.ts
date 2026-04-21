import { VoiceProfile, LoreEntry } from "../../types";

export interface InfluenceVector {
    dominance_pressure?: number;
    emotional_clarity?: number;
    control_stability?: number;
    entropy_force?: number;
    structural_distortion?: number;
    directive_intensity?: number;
    visceral_gravity?: number;
}

export interface InteractionDistortion {
    source: string;
    target: string;
    field: string;
    effect: string;
    strength: number;
}

export const CPIEngine = {
    /**
     * Calculates the Interaction Physics between active profiles (CPI v1.0).
     */
    calculateInteractionField(activeProfiles: Record<string, any>, draft: string) {
        const profileNames = Object.keys(activeProfiles);
        const interactionField: Record<string, any> = {};

        // 1. Generate Influence Vectors for each active profile
        const vectors: Record<string, InfluenceVector> = {};
        profileNames.forEach(name => {
            vectors[name] = this.getInfluenceVector(name, activeProfiles[name]);
        });

        // 2. Map Interaction Types & Matrix
        profileNames.forEach(source => {
            profileNames.forEach(target => {
                if (source === target) return;
                
                const key = `${source} ↔ ${target}`;
                if (interactionField[key]) return; // Avoid duplicate bidirectional keys if already handled

                const interaction = this.getInteractionType(source, target, activeProfiles);
                interactionField[key] = {
                    type: interaction,
                    vectors: {
                        [source]: vectors[source],
                        [target]: vectors[target]
                    },
                    proximityFactor: this.calculateProximity(source, target, draft)
                };
            });
        });

        return { interactionField, vectors };
    },

    /**
     * Applies distortions to the resolved profiles based on the interaction field.
     */
    applyDistortions(activeProfiles: Record<string, any>, interactionData: any, instability: any) {
        const { interactionField, vectors } = interactionData;
        const distortedProfiles: Record<string, any> = JSON.parse(JSON.stringify(activeProfiles));

        const noise = instability?.global_instability ?? 0;

        Object.keys(distortedProfiles).forEach(targetName => {
            const profile = distortedProfiles[targetName];
            const name = targetName;
            
            // Find all influencers
            Object.keys(vectors).forEach(sourceName => {
                if (targetName === sourceName) return;

                const influence = vectors[sourceName];
                const interactionKey = interactionField[`${sourceName} ↔ ${targetName}`] || interactionField[`${targetName} ↔ ${sourceName}`];
                
                if (!interactionKey || interactionKey.proximityFactor <= 0.1) return;

                // Instability increases the variance of the influence strength
                const baseStrength = interactionKey.proximityFactor;
                const unstableStrength = Math.max(0.1, baseStrength + ( (Math.random() - 0.5) * noise ));

                // Apply Logic: Distortion Layers
                this.distortProfile(profile, sourceName, influence, unstableStrength, interactionKey.type);
            });
        });

        return distortedProfiles;
    },

    getInfluenceVector(name: string, profile: any): InfluenceVector {
        // Factory for known profiles, fallback to DNA-based inference
        if (name.toLowerCase().includes('anya')) {
            return { dominance_pressure: 0.8, emotional_clarity: 0.2, control_stability: 0.9 };
        }
        if (name.toLowerCase().includes('lance')) {
            return { entropy_force: 1.0, structural_distortion: 0.7, directive_intensity: 0.95 };
        }
        if (name.toLowerCase().includes('zarkov')) {
            return { dominance_pressure: 0.5, visceral_gravity: 0.6 };
        }

        // Inference from DNA (VoiceProfile has DNA)
        const dna = profile.dna || {};
        return {
            dominance_pressure: (dna.dominance || 50) / 100,
            control_stability: (dna.stability || 50) / 100,
            emotional_clarity: (dna.warmth || 50) / 100,
            entropy_force: (dna.complexity || 50) / 100
        };
    },

    getInteractionType(source: string, target: string, profiles: any) {
        // Heuristic mapping for interaction types
        const s = source.toLowerCase();
        const t = target.toLowerCase();

        if ((s.includes('anya') && t.includes('lance')) || (s.includes('lance') && t.includes('anya'))) {
            return 'bonded_host'; // Bidirectional distortion
        }
        if (s.includes('lance') && t.includes('anya')) {
            return 'dominance_chain'; // Override bias
        }
        if (s.includes('zarkov')) {
            return 'observational'; // Perception distortion only
        }

        return 'standard_resonant';
    },

    calculateProximity(source: string, target: string, draft: string) {
        // Deterministic proximity: Check distance between names in draft
        const sIndex = draft.toLowerCase().indexOf(source.toLowerCase());
        const tIndex = draft.toLowerCase().indexOf(target.toLowerCase());

        if (sIndex === -1 || tIndex === -1) return 0.2; // Background presence

        const distance = Math.abs(sIndex - tIndex);
        if (distance < 100) return 1.0; // Intense
        if (distance < 500) return 0.6; // Moderate
        return 0.3; // Distant
    },

    distortProfile(profile: any, sourceName: string, influence: InfluenceVector, strength: number, interactionType: string) {
        // Modify probabilities of expression via bias strings appended to fields
        // This ensures identity is preserved but "cognition under pressure" is expressed
        
        if (influence.entropy_force && influence.entropy_force > 0.6) {
            const bias = `[Distortion: Destabilized by ${sourceName}'s entropy force (${(influence.entropy_force * strength).toFixed(2)})]`;
            if (profile.tone) profile.tone = `${profile.tone} -- ${bias}`;
            if (profile.speech_style) profile.speech_style = `${profile.speech_style} -- ${bias}`;
        }

        if (influence.dominance_pressure && influence.dominance_pressure > 0.7) {
            const bias = `[Pressure: Compressed by ${sourceName}'s dominance (${(influence.dominance_pressure * strength).toFixed(2)})]`;
            if (profile.emotional_access) profile.emotional_access = `${profile.emotional_access} -- ${bias}`;
        }

        if (interactionType === 'bonded_host') {
            const bias = `[Recursion: Deep structural overlap with ${sourceName}]`;
            if (profile.internal_monologue) profile.internal_monologue = `${profile.internal_monologue} -- ${bias}`;
        }

        // EDE v2.0 - Kinetic Engine: Tension Drift Logic
        // If a character is under significant pressure, their Tension Vectors begin to 'crack'
        if (profile.tensionVectors && profile.tensionVectors.length > 0) {
            profile.tensionVectors.forEach((tv: any) => {
                const crackChance = tv.driftModifier * strength;
                // If crackChance crosses threshold, essence begins to bleed through performance
                if (crackChance > 0.4) {
                    const bias = `[FORCE_DRIFT] The tension on the ${tv.axis.toUpperCase()} axis is peaking. The Performance ("${tv.performance}") is failing; the Essence ("${tv.essence}") is bleeding into the subtext.`;
                    if (profile.internal_monologue) profile.internal_monologue += `\n${bias}`;
                    if (profile.speech_style) profile.speech_style += ` -- ${bias}`;
                }
            });
        }
    }
};
