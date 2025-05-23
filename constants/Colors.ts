const tintColorLight = '#3696A6'; // Primary brand color (light mode)
const tintColorDark = '#3696A6';  // Primary brand color (dark mode)

export const Colors = {
  light: {
    background: '#FFFFFF',     // Light background color
    button: '#3696A6',         // Primary button color
    text: '#323232',           // Large text color
    smallText: '#C9C9C9',      // Small/subtext color
    textField: '#F1F5F8',      // Text field background
    tint: tintColorLight,      // Accent color for icons, tabs
    icon: '#687076',           // General icon color
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    borderColor: '#E0E0E0',    // Light grey for borders
  },
  dark: {
    background: '#191C21',     // Dark background color
    button: '#3696A6',         // Primary button color
    text: '#F5F6FF',           // General text color
    smallText: '#F5F6FF',      // Using same as main text for consistency
    textField: '#121214',      // Text field background
    tint: tintColorDark,       // Accent color for icons, tabs
    icon: '#9BA1A6',           // General icon color
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    borderColor: '#2A2D34',    // Muted dark grey-blue for borders
  },
};
