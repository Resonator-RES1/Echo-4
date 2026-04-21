/**
 * Echo Dialogue Engine (EDE) - v1.0
 * The "Nervous System" of Echo.
 * Implements deterministic checks for tag sludge, talking heads, and narrative late entries.
 */

import { DSAResult } from "./DeterministicStylisticEngine";

export interface DialogueViolation {
  type: 'TagSludge' | 'LateEntry' | 'TalkingHead' | 'PoliteSludge' | 'DialogueCoda';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  matches?: string[];
}

export const DialogueEngine = {
  /**
   * Deterministic Audit: Runs code-only checks on dialogue mechanics.
   */
  analyze(text: string): DialogueViolation[] {
    const violations: DialogueViolation[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const dialogueLines = lines.filter(l => l.includes('"'));
    const actionBeats = lines.filter(l => !l.includes('"'));

    // 1. Tag Check: Scan for flowery tags (AI Sludge)
    // We target tags following a closing quote, optional comma, and a name/pronoun
    const floweryTags = ['retorted', 'exclaimed', 'bellowed', 'remarked', 'opined', 'countered', 'retaliated', 'illuminated', 'shared', 'stated', 'noted', 'whispered', 'replied'];
    const floweryTagRegex = new RegExp(`[,.?!"\\s]+(?:he|she|it|they|[A-Z][a-z]+)?\\s*(${floweryTags.join('|')})\\b`, 'gi');
    const floweryMatches = text.match(floweryTagRegex);
    if (floweryMatches) {
      violations.push({
        type: 'TagSludge',
        severity: 'high',
        message: 'Flowery dialogue tags detected. Use "said", "asked", or an action beat.',
        matches: floweryMatches.map(m => m.trim())
      });
    }

    // 2. Late Entry Check (The Greeting Purge)
    // Scenes should start mid-action, not with transactional greetings.
    const greetings = ['hello', 'hi', 'good morning', 'good evening', 'good afternoon', 'hey'];
    const firstLine = lines[0]?.toLowerCase() || "";
    if (greetings.some(g => firstLine.startsWith(g)) && !firstLine.includes('!')) {
      violations.push({
        type: 'LateEntry',
        severity: 'medium',
        message: 'Narrative Late Entry violation: Scene starts with transactional greeting. Cut to the action.'
      });
    }

    // 3. Talking Head Check: Dialogue vs Action Ratio
    // Mandate: 1 action beat for every 3 dialogue lines.
    if (dialogueLines.length > 3 && actionBeats.length === 0) {
      violations.push({
        type: 'TalkingHead',
        severity: 'critical',
        message: 'Talking Head Syndrome: Multiple lines of dialogue with zero physical action beats.'
      });
    } else if (dialogueLines.length > 0 && actionBeats.length > 0) {
      const ratio = dialogueLines.length / actionBeats.length;
      if (ratio > 3) {
        violations.push({
          type: 'TalkingHead',
          severity: 'high',
          message: `High talking-head ratio (${ratio.toFixed(1)}:1). Human dialogue requires physical interaction.`
        });
      }
    }

    // 4. Polite Sludge (Conflict Auditor)
    // AI loves characters who agree and validate each other.
    const politePatterns = ['i agree', 'you\'re right', 'i understand', 'exactly', 'fair point'];
    const politeHits = lines.filter(l => politePatterns.some(p => l.toLowerCase().includes(p)));
    if (politeHits.length > 2) {
      violations.push({
        type: 'PoliteSludge',
        severity: 'medium',
        message: 'Excessive character agreement (AI Politeness). Inject conflict or disagreement.',
        matches: politeHits
      });
    }

    // 5. Dialogue Coda Veto (The Moralizer)
    // Scenes should end on action or unanswered questions, not lessons.
    const lastLine = lines[lines.length - 1]?.toLowerCase() || "";
    const moralizingKeywords = ['lesson', 'choice', 'together', 'we can', 'finally understood', 'better way'];
    if (dialogueLines.length > 0 && lines.indexOf(dialogueLines[dialogueLines.length - 1]) === lines.length - 1) {
       // Last line is dialogue
       if (moralizingKeywords.some(w => lastLine.includes(w))) {
         violations.push({
           type: 'DialogueCoda',
           severity: 'high',
           message: 'Dialogue Coda detected: The scene ends on a thematic summary or "lesson learned". Kill it.'
         });
       }
    }

    return violations;
  },

  /**
   * Subtext & Intent Mandates
   */
  getDialogueMandate(): string {
    return `
### THE DIALOGUE ENGINE GAUNTLET (EDE v1.0)
1. **TAG VETO**: You are strictly limited to "said", "asked", or physical action beats. Delete all flowery tags (Countered, Retorted, etc).
2. **THE LATE ENTRY**: Start the scene after the "Hello". If the draft starts with transactional greetings, STRIP THEM.
3. **TALKING HEAD VETO**: For every 3 lines of dialogue, you MUST show character movement or environmental interaction. 
4. **CONFLICT MANDATE**: Characters are naturally resistant, defensive, or guarded. If they agree too easily ("I understand"), have them resist or question the subtext instead.
5. **CODA VETO**: Never end a scene with a character explaining the theme. End on a slam, a silence, or a sharp question.
`;
  }
};
