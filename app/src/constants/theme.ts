/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export type BrandPalette = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryContainer: string;
  ink: string;
  body: string;
  muted: string;
  surface: string;
  surfacePage: string;
  surfaceTint: string;
  surfaceTint2: string;
  outline: string;
  outlineSoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  onPrimary: string;
};

/** LUMINA брэндийн өнгөнүүд — frontend/src/app/globals.css-тэй яг адил (цайвар горим). */
export const LightBrand: BrandPalette = {
  primary: '#8a4853',
  primaryDark: '#70343e',
  primaryLight: '#a6606b',
  primaryContainer: '#ffd9dd',
  ink: '#211a1b',
  body: '#524345',
  muted: '#857374',
  surface: '#fffbff',
  surfacePage: '#fff8f7',
  surfaceTint: '#fff0f1',
  surfaceTint2: '#faeaeb',
  outline: '#d7c1c3',
  outlineSoft: '#eedfe0',
  danger: '#ba1a1a',
  dangerSoft: '#fee2e2',
  success: '#16a34a',
  successSoft: '#dcfce7',
  warning: '#f59e0b',
  warningSoft: '#fef3c7',
  onPrimary: '#ffffff',
};

/** Мөн адил токенууд — бараан горимд зориулав. */
export const DarkBrand: BrandPalette = {
  primary: '#c98894',
  primaryDark: '#a6606b',
  primaryLight: '#e3aab2',
  primaryContainer: '#4a2b30',
  ink: '#f5ecec',
  body: '#d6c7c8',
  muted: '#a08e90',
  surface: '#241a1c',
  surfacePage: '#160f10',
  surfaceTint: '#2c2124',
  surfaceTint2: '#332628',
  outline: '#4d3a3d',
  outlineSoft: '#3a2c2e',
  danger: '#ff8080',
  dangerSoft: '#4a2323',
  success: '#4ade80',
  successSoft: '#1e3a2a',
  warning: '#fbbf24',
  warningSoft: '#3d3116',
  onPrimary: '#ffffff',
};

/** Хараахан dark mode-д шилжээгүй дэлгэцүүдэд ашиглах анхны (цайвар) утга. */
export const Brand = LightBrand;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
