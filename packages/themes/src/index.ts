/**
 * @react-lite-toast/themes
 *
 * Official theme collection for react-lite-toast.
 *
 * Available themes:
 *   - light   (default, clean white background)
 *   - dark    (deep dark background with subtle borders)
 *   - colored (type-specific background colors)
 *   - glass   (glassmorphism — backdrop-filter blur)
 *   - minimal (stripped-down, no shadows or borders)
 *
 * Each theme is implemented entirely via CSS custom properties.
 * Consumers can apply themes by:
 *
 * Option A — Import the CSS file directly:
 *   import '@react-lite-toast/themes/dark';
 *
 * Option B — Apply via data attribute (set by the library at runtime):
 *   The container receives data-theme="dark" automatically
 *   when theme: 'dark' is set in toast options.
 *
 * CSS variables are documented in the theme CSS files.
 * All themes use the same variable names — only the values differ.
 */

export const THEMES_VERSION = '0.1.0' as const;

export type ThemeName = 'light' | 'dark' | 'colored' | 'glass' | 'minimal' | 'custom';

/**
 * The CSS custom property prefix used by all theme variables.
 * Changing this would be a breaking change.
 */
export const CSS_VAR_PREFIX = '--toast' as const;

/**
 * All CSS custom properties used by the default theme.
 * Use this to validate or enumerate all themeable properties.
 */
export const CSS_VARIABLES = {
  bg: '--toast-bg',
  color: '--toast-color',
  border: '--toast-border',
  shadow: '--toast-shadow',
  radius: '--toast-radius',
  padding: '--toast-padding',
  gap: '--toast-gap',
  width: '--toast-width',
  fontSize: '--toast-font-size',
  zIndex: '--toast-z-index',
  animationDuration: '--toast-animation-duration',
  progressBg: '--toast-progress-bg',
  iconColor: '--toast-icon-color',
  closeColor: '--toast-close-color',
  successColor: '--toast-success-color',
  errorColor: '--toast-error-color',
  warningColor: '--toast-warning-color',
  infoColor: '--toast-info-color',
} as const;

export type CSSVariableName = (typeof CSS_VARIABLES)[keyof typeof CSS_VARIABLES];
