import type { ReactElement } from 'react';

/**
 * @react-lite-toast/icons
 *
 * Official SVG icon pack for react-lite-toast.
 *
 * All icons are inline SVG React components — zero external dependencies,
 * zero HTTP requests, zero config. They render at exactly the right size
 * via CSS (currentColor for stroke/fill, em units for sizing).
 */

export const ICONS_VERSION = '0.1.0' as const;

/**
 * Base props shared by all icon components.
 */
export interface IconProps {
  readonly size?: number | string;
  readonly className?: string;
  readonly 'aria-hidden'?: boolean;
}

export function SuccessIcon({
  size = '1em',
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function ErrorIcon({
  size = '1em',
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function WarningIcon({
  size = '1em',
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function InfoIcon({
  size = '1em',
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function LoadingIcon({
  size = '1em',
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)" fill="none" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" fill="none" />
    </svg>
  );
}
