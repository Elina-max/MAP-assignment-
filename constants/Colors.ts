/**
 * Colors used in the app, based on the Namibia Hockey Union logo.
 * Primary colors from the logo:
 * - Deep blue (shield): #003366
 * - Yellow/Gold (sun): #FFD700
 * - Red (hockey stick): #CC0000
 * - Black (text and ball): #000000
 * - White (outline): #FFFFFF
 */

// Primary colors from the logo
const namibiaBlue = '#003366';
const namibiaGold = '#FFD700';
const namibiaRed = '#CC0000';
const namibiaBlack = '#000000';
const namibiaWhite = '#FFFFFF';

// Tint colors (primary action colors)
const tintColorLight = namibiaRed;
const tintColorDark = namibiaGold;

// Card and border colors
const cardColorLight = '#f8f9fa';
const cardLighterColor = '#ffffff';
const cardColorDark = '#0A1929'; // Darker blue for dark mode cards
const cardDarkerColor = '#081621'; // Even darker blue for dark mode
const borderColorLight = '#e1e4e8';
const borderColorDark = '#1E3A5F'; // Medium blue for dark mode borders

// Chat colors
const botBubbleLight = '#003366'; // Namibia blue for bot messages in light mode
const botBubbleDark = '#004488'; // Slightly lighter blue for bot messages in dark mode
const inputBackgroundLight = '#ffffff';
const inputBackgroundDark = '#0e1f30';
const placeholderTextLight = '#9BA1A6';
const placeholderTextDark = '#687076';

export const Colors = {
  light: {
    text: namibiaBlack,
    background: namibiaWhite,
    tint: tintColorLight,
    icon: namibiaBlue,
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: cardColorLight,
    cardLight: cardLighterColor,
    border: borderColorLight,
    primary: namibiaBlue,
    secondary: namibiaRed,
    accent: namibiaGold,
    adminBubble: botBubbleLight,
    inputBackground: inputBackgroundLight,
    placeholderText: placeholderTextLight,
    otherBubble: '#666666', // For backward compatibility
  },
  dark: {
    text: namibiaWhite,
    background: namibiaBlue,
    tint: tintColorDark,
    icon: namibiaGold,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: cardColorDark,
    cardLight: cardDarkerColor,
    border: borderColorDark,
    primary: namibiaBlue,
    secondary: namibiaRed,
    accent: namibiaGold,
    adminBubble: botBubbleDark,
    inputBackground: inputBackgroundDark,
    placeholderText: placeholderTextDark,
    otherBubble: '#555555', // For backward compatibility
  },
};
