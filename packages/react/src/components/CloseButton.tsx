import type { ReactElement } from 'react';

export interface CloseButtonProps {
  readonly onClick: () => void;
  readonly ariaLabel?: string;
}

/**
 * CloseButton
 *
 * Headless-ready close button component for react-lite-toast.
 * Renders a clean, highly accessible button to dismiss a toast.
 */
export function CloseButton({
  onClick,
  ariaLabel = 'Dismiss notification',
}: CloseButtonProps): ReactElement {
  return (
    <button
      type="button"
      className="react-lite-toast__close-button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        background: 'none',
        border: 'none',
        padding: '4px',
        margin: '0',
        cursor: 'pointer',
        fontSize: '18px',
        lineHeight: '1',
        color: 'currentColor',
        opacity: 0.5,
        transition: 'opacity 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.5';
      }}
    >
      ×
    </button>
  );
}

export default CloseButton;
