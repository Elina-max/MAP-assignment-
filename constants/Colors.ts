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
const cardColorDark = '#0A1929'; // Darker blue for dark mode cards
const borderColorLight = '#e1e4e8';
const borderColorDark = '#1E3A5F'; // Medium blue for dark mode borders

export const Colors = {
  light: {
    text: namibiaBlack,
    background: namibiaWhite,
    tint: tintColorLight,
    icon: namibiaBlue,
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: cardColorLight,
    border: borderColorLight,
    primary: namibiaBlue,
    secondary: namibiaRed,
    accent: namibiaGold,
  },
  dark: {
    text: namibiaWhite,
    background: namibiaBlue,
    tint: tintColorDark,
    icon: namibiaGold,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: cardColorDark,
    border: borderColorDark,
    primary: namibiaBlue,
    secondary: namibiaRed,
    accent: namibiaGold,
  },
};
