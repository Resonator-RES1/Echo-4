import { LCRArbitration } from "../../types";

export const LCREngine = {
    /**
     * Executes the Layer Conflict Resolution (LCR v1.0).
     */
    arbitrate(state: any): LCRArbitration {
        const { narrativeInstability, authorialIntent, interactionField } = state;
        
        // 1. Define Priority Stack
        const priority_stack = [
            'WORLD (Absolute Truth)',
            'IDENTITY (Profiles / CPI)',
            'STRUCTURE (Narrative Control)',
            'AUTHORIAL INTENT (Lens weighting)',
            'INSTABILITY FIELD (Texture)',
            'EXPRESSION (Rendering)'
        ];

        // 2. Compute Expression Field Tension
        // Tension is higher when Instability is high but Author Intent wants precision
        let tension = 0.1;
        const i = narrativeInstability?.global_instability ?? 0.2;
        const aMode = authorialIntent?.intent_mode ?? 'balanced';
        
        if (i > 0.6 && aMode === 'cinematic_clinical') {
            tension += 0.5; // High conflict: Fragile reality vs clinical precision
        }
        
        if (Object.keys(interactionField || {}).length > 2 && i > 0.5) {
            tension += 0.3; // High conflict: Multiple interacting fields in an unstable environment
        }

        // 3. Resolution Rules Matrix
        const conflict_resolutions: Record<string, 'resolve' | 'blend' | 'preserve'> = {
            'FACT': 'resolve', // World always wins
            'STRUCTURAL': 'blend', // Support primary lens but preserve beats
            'EXPRESSION': tension > 0.5 ? 'preserve' : 'blend', // Intentionally preserve noise if tension is high
            'IDENTITY_DRIFT': 'blend'
        };

        return {
            tension: Math.min(1.0, tension),
            priority_stack,
            conflict_resolutions,
            coherence_threshold: 0.85 // If AI tries to be too clean (> 0.85), penalize normalization
        };
    }
};
