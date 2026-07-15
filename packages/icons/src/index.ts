/**
 * @react-lite-toast/icons
 *
 * Official SVG icon pack for react-lite-toast.
 *
 * All icons are inline SVG React components — zero external dependencies,
 * zero HTTP requests, zero config. They render at exactly the right size
 * via CSS (currentColor for stroke/fill, em units for sizing).
 *
 * Available icons:
 *   - SuccessIcon   — animated checkmark
 *   - ErrorIcon     — animated X mark
 *   - WarningIcon   — triangle with exclamation
 *   - InfoIcon      — circle with information symbol
 *   - LoadingIcon   — animated spinning circle
 *
 * Implementations are added in Phase 15 (Themes & Icons Packages).
 */

export const ICONS_VERSION = '0.1.0' as const;

/**
 * Base props shared by all icon components.
 * @internal — will be expanded with full implementation in Phase 15.
 */
export interface IconProps {
  readonly size?: number | string;
  readonly className?: string;
  readonly 'aria-hidden'?: boolean;
}
