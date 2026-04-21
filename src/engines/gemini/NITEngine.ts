import { NarrativeInstability } from "../../types";

export const NITEngine = {
    /**
     * Calculates the Narrative Instability Field (NIT v1.0).
     */
    calculateInstability(state: any): NarrativeInstability {
        const { options } = state;
        
        // Base instability from options, defaulting to a natural texture
        let global_instability = options.narrativeInstability?.global_instability ?? 0.25;

        // Auto-modulators based on session context
        if (options.focusAreas?.includes('characterArc')) global_instability += 0.1;
        if (options.focusAreas?.includes('psychological')) global_instability += 0.15;
        if (options.feedbackDepth === 'in-depth') global_instability += 0.05;

        // Clamp to valid range
        global_instability = Math.max(0, Math.min(1.0, global_instability));

        // Determine type based on tuned scale
        let type: NarrativeInstability['instability_type'] = 'none';
        if (global_instability >= 0.8) type = 'breakdown';
        else if (global_instability >= 0.6) type = 'chaotic';
        else if (global_instability >= 0.4) type = 'unstable';
        else if (global_instability >= 0.2) type = 'textured';

        return {
            global_instability,
            instability_type: type,
            instability_targets: options.narrativeInstability?.instability_targets ?? ['all'],
            stability_floor: options.narrativeInstability?.stability_floor ?? 0.4
        };
    },

    /**
     * Generates modulation parameters for the expression layer.
     */
    getModulators(instability: NarrativeInstability) {
        const i = instability.global_instability;
        return {
            sentence_variance: 0.1 + (i * 0.6), // 0.1 to 0.7
            dialogue_misalignment: i * 0.4,
            reaction_delay: Math.floor(i * 500), // ms (simulated perception delay)
            perceptual_noise: i > 0.7 ? 'symbolic' : 'grounded',
            emotional_drift: i * 0.35,
            redundancy_tolerance: i * 0.5,
            hesitation_frequency: i * 0.6
        };
    }
};
