export interface DomainField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
}

export const DOMAIN_FIELD_CONFIG: Record<string, DomainField[]> = {
  'cat-mythos': [
    { id: 'mechanics', label: 'System & Mechanics', placeholder: 'How does it function objectively? (The rules of the magic/power)', type: 'textarea' },
    { id: 'limitations', label: 'Constraints & Costs', placeholder: 'What is the price, threshold, or boundary of its usage?', type: 'textarea' },
    { id: 'origins', label: 'Mythic Origins', placeholder: 'Where does it come from? Who created it?', type: 'textarea' }
  ],
  'cat-world': [
    { id: 'topography', label: 'Topography & Climate', placeholder: 'Terrain, atmosphere, weather patterns...', type: 'textarea' },
    { id: 'landmarks', label: 'Key Landmarks', placeholder: 'Monuments, ruins, natural phenomena...', type: 'textarea' },
    { id: 'resources', label: 'Resources & Economy', placeholder: 'What sustains this place? What is fought over?', type: 'textarea' }
  ],
  'cat-factions': [
    { id: 'leadership', label: 'Power Structure', placeholder: 'Who leads? How is authority distributed?', type: 'textarea' },
    { id: 'ideology', label: 'Core Tenets & Ideology', placeholder: 'What are their unbreakable beliefs or goals?', type: 'textarea' },
    { id: 'modusOperandi', label: 'Modus Operandi', placeholder: 'How do they operate in the world?', type: 'textarea' }
  ],
  'cat-history': [
    { id: 'catalyst', label: 'The Catalyst', placeholder: 'What sparked this event or shifted this era?', type: 'textarea' },
    { id: 'resolution', label: 'The Resolution', placeholder: 'How did it end, stabilize, or evolve?', type: 'textarea' },
    { id: 'legacy', label: 'Lasting Legacy', placeholder: 'How does this permanently filter into the present?', type: 'textarea' }
  ],
  'cat-relics': [
    { id: 'properties', label: 'Anomalous Properties', placeholder: 'What supernatural or technical feats can it perform?', type: 'textarea' },
    { id: 'appearance', label: 'Visual & Material Signature', placeholder: 'What does it look and feel like? Signs of age?', type: 'textarea' },
    { id: 'whereabouts', label: 'Current Whereabouts', placeholder: 'Who holds it now? Is it lost?', type: 'text' }
  ],
  'cat-nature': [
    { id: 'habitat', label: 'Native Habitat', placeholder: 'Where in the world does it thrive?', type: 'textarea' },
    { id: 'behavior', label: 'Behavioral Traits', placeholder: 'Is it hostile, passive, intelligent, or parasitic?', type: 'textarea' },
    { id: 'ecology', label: 'Ecological Impact', placeholder: 'What is its structural role in the ecosystem?', type: 'textarea' }
  ],
  'cat-characters': [
    { id: 'appearance', label: 'Physical Manifestation', placeholder: 'Stature, scars, sartorial style, posture, resting expression...', type: 'textarea' },
    { id: 'psychology', label: 'Psychology & Wounds', placeholder: 'Core fears, traumas, attachment styles, cognitive biases...', type: 'textarea' },
    { id: 'motivation', label: 'Driving Motivation', placeholder: 'What do they want, regardless of the cost?', type: 'text' }
  ],
  'cat-other': [
    { id: 'details', label: 'Additional Parameters', placeholder: 'Any unstructured details crucial to this node...', type: 'textarea' }
  ]
};
