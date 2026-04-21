import { AuthorialIntent } from "../../types";

export const AuthorIntentEngine = {
    /**
     * Resolves the Authorial Intent Layer (AIS v1.0).
     */
    resolveIntent(state: any): AuthorialIntent {
        const { options, preFlight } = state;
        
        // 1. Determine Lenses based on focus areas and density
        const lenses = this.determineActiveLenses(options, preFlight);
        
        // 2. Resolve weights
        const weights: Record<string, number> = {};
        lenses.forEach(lens => {
            weights[lens] = this.calculateLensWeight(lens, options);
        });

        // 3. Select Primary Lens (The Max Weighted)
        const primary_lens = lenses.reduce((prev, curr) => 
            (weights[curr] > weights[prev] ? curr : prev), lenses[0] || 'Narrative Voice'
        );

        // 4. Determine Intent Mode
        const intent_mode = this.resolveIntentMode(primary_lens, options);

        return {
            primary_lens,
            active_lenses: lenses,
            lens_weights: weights,
            intent_mode
        };
    },

    determineActiveLenses(options: any, preFlight: any): string[] {
        const lenses = new Set<string>(['Narrative Voice']); // Base lens

        if (preFlight?.density?.primary === 'dialogue') lenses.add('Dialogue');
        if (preFlight?.density?.primary === 'exposition') lenses.add('Atmosphere');
        
        if (options.focusAreas?.includes('sensory')) lenses.add('Atmosphere');
        if (options.focusAreas?.includes('characterArc')) lenses.add('Character Proximity');
        if (options.focusAreas?.includes('pacing')) lenses.add('Narrative Voice');

        return Array.from(lenses);
    },

    calculateLensWeight(lens: string, options: any): number {
        let weight = 0.5; // Neutral base

        // Bias based on focus areas
        if (lens === 'Narrative Voice') {
            if (options.focusAreas?.includes('pacing') || options.focusAreas?.includes('flow')) weight += 0.3;
        }
        if (lens === 'Dialogue') {
            if (options.focusAreas?.includes('dialogue') || options.focusAreas?.includes('voice')) weight += 0.4;
        }
        if (lens === 'Atmosphere') {
            if (options.focusAreas?.includes('sensory') || options.focusAreas?.includes('worldBuilding')) weight += 0.3;
        }
        if (lens === 'Character Proximity') {
            if (options.focusAreas?.includes('internal') || options.focusAreas?.includes('characterArc')) weight += 0.4;
        }

        return Math.min(1.0, weight);
    },

    resolveIntentMode(primary: string, options: any): string {
        // Personas as decision filters
        if (primary === 'Narrative Voice') return 'cinematic_clinical';
        if (primary === 'Dialogue') return 'raw_cognitive_realism';
        if (primary === 'Atmosphere') return 'sensory_heavy_immersion';
        if (primary === 'Character Proximity') return 'psychological_visceral';
        
        return 'balanced_sovereign';
    }
};
