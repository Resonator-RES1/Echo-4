import { GUIDE_SECTIONS, ECHO_MANUAL_CONTENT } from '../constants';

export const copyFullGuideToClipboard = () => {
    let fullGuide = "# THE ARCHITECT'S CODEX\n";
    fullGuide += "\"Reveal the author—clearly, faithfully, and without distortion.\"\n\n";
    fullGuide += "This document serves as the definitive guide to Echo's internal logic, philosophy, and technical boundaries. It is designed for writers who seek to master the system, not just use it.\n\n";
    fullGuide += "--- \n\n";
    
    GUIDE_SECTIONS.forEach(section => {
      fullGuide += `## ${section.title.toUpperCase()}\n`;
      fullGuide += `*${section.description}*\n\n`;
      
      if (section.features && section.features.length > 0) {
        fullGuide += `### Key Features\n`;
        section.features.forEach(feature => {
          fullGuide += `- ${feature}\n`;
        });
        fullGuide += `\n`;
      }
      
      if (section.categories) {
        section.categories.forEach(category => {
          fullGuide += `### ${category.title}\n\n`;
          category.items.forEach(item => {
            fullGuide += `#### ${item.title}\n`;
            fullGuide += `**The Theory:** ${item.description}\n`;
            
            if (item.proTips && item.proTips.length > 0) {
              fullGuide += `**The Logic:** ${item.proTips[0]}\n`;
              
              if (item.proTips.length > 1) {
                fullGuide += `**The Pro-Tip:** ${item.proTips[1]}\n`;
              }
            }
            
            if (item.example) {
              fullGuide += `\n**The Example:**\n`;
              fullGuide += `- Original Draft: "${item.example.before}"\n`;
              fullGuide += `- Echo Audited: "${item.example.after}"\n`;
            }
            fullGuide += `\n`;
          });
        });
      }
      fullGuide += `\n---\n\n`;
    });

    fullGuide += `## THE MANUAL (TECHNICAL SPECS)\n`;
    fullGuide += `*Technical boundaries and the philosophy of restraint.*\n\n`;
    
    ECHO_MANUAL_CONTENT.forEach(manual => {
      fullGuide += `### ${manual.feature}\n`;
      fullGuide += `**Philosophy:** ${manual.philosophy}\n`;
      fullGuide += `**Technical Constraints:** ${manual.technicalConstraints}\n\n`;
    });
    
    fullGuide += `\n---\n`;
    fullGuide += `End of Codex • Version 1.0.4\n`;
    
    navigator.clipboard.writeText(fullGuide);
};
