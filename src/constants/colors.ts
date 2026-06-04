/**
 * Premium color palette for the YGO Calculator tournament utility.
 * Tailored with dark aesthetics, card-gold highlights, and clear semantic colors.
 */
export const COLORS = {
  // Backgrounds
  background: '#0F0F12',       // Pure dark, slightly blue/purple tint
  surface: '#1A1A22',          // Card/Section backgrounds
  surfaceElevated: '#252530',  // Modals or interactive buttons
  
  // Accents (Yu-Gi-Oh! theme card colors)
  primary: '#D4AF37',          // Card Gold (Premium Accent)
  primaryDark: '#B3922E',
  secondary: '#3A7DFF',        // Spell/Trap Blue
  
  // Semantic Colors
  text: '#F5F5F7',             // Off-white primary text
  textMuted: '#9898A0',        // Subdued labels
  lpGain: '#4CAF50',           // Green for adding Life Points
  lpLoss: '#FF4D4D',           // Crimson Red for subtracting Life Points
  border: '#2C2C35',           // Subdued grid borders
  
  // Status Colors
  warning: '#FF9800',          // Orange warning (e.g. low LP under 2000)
  danger: '#F44336',           // Critical danger
};
