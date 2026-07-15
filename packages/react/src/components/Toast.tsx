import React from 'react';
import type { ReactElement } from 'react';
import { getEngineRegistry } from '@react-lite-toast/core';
import type { CoreToast } from '@react-lite-toast/core';
import { CloseButton } from './CloseButton';
import { ProgressBar } from './ProgressBar';
import {
  SuccessIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon,
  LoadingIcon,
} from '@react-lite-toast/icons';

export interface ToastProps {
  readonly toast: CoreToast;
}

/**
 * Toast Component
 *
 * Renders an individual toast notification.
 * Supports:
 * - Built-in SVG icons mapping to toast type.
 * - ARIA accessibility attributes (roles, live regions).
 * - Mouse hover event listeners to pause/resume auto-dismiss timers.
 * - Progress bar and close button rendering.
 */
export function Toast({ toast: toastItem }: ToastProps): ReactElement {
  const { store } = getEngineRegistry();

  const handleDismiss = (): void => {
    store.dispatch({ type: 'TOAST_DISMISS', payload: { id: toastItem.id } });
    if (toastItem.onClose) {
      try {
        toastItem.onClose(toastItem);
      } catch (err) {
        console.error('Error in toast onClose callback:', err);
      }
    }
  };

  const handleMouseEnter = (): void => {
    if (toastItem.pauseOnHover && toastItem.state === 'VISIBLE') {
      store.dispatch({ type: 'TOAST_PAUSE', payload: { id: toastItem.id } });
    }
  };

  const handleMouseLeave = (): void => {
    if (toastItem.pauseOnHover && toastItem.state === 'PAUSED') {
      store.dispatch({ type: 'TOAST_RESUME', payload: { id: toastItem.id } });
    }
  };

  const renderIcon = (type: string): ReactElement | null => {
    switch (type) {
      case 'success':
        return <SuccessIcon className="react-lite-toast__icon react-lite-toast__icon--success" size="1.25em" />;
      case 'error':
        return <ErrorIcon className="react-lite-toast__icon react-lite-toast__icon--error" size="1.25em" />;
      case 'warning':
        return <WarningIcon className="react-lite-toast__icon react-lite-toast__icon--warning" size="1.25em" />;
      case 'info':
        return <InfoIcon className="react-lite-toast__icon react-lite-toast__icon--info" size="1.25em" />;
      case 'loading':
        return <LoadingIcon className="react-lite-toast__icon react-lite-toast__icon--loading" size="1.25em" />;
      default:
        return null;
    }
  };

  const isAlert = toastItem.type === 'error' || toastItem.type === 'warning';
  const role = isAlert ? 'alert' : 'status';
  const ariaLive = isAlert ? 'assertive' : 'polite';

  const baseClassName = 'react-lite-toast__toast';
  const modifierClassName = `${baseClassName}--${toastItem.type}`;
  const stateClassName = `${baseClassName}--${toastItem.state.toLowerCase()}`;
  const classes = [baseClassName, modifierClassName, stateClassName].join(' ');

  return (
    <div
      id={`toast-${toastItem.id}`}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={classes}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        pointerEvents: 'auto',
        background: 'white',
        color: '#1a1a1a',
        padding: '12px 16px',
        margin: '8px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative',
        minWidth: '280px',
        maxWidth: '420px',
        boxSizing: 'border-box',
      }}
    >
      {renderIcon(toastItem.type)}

      <div
        className="react-lite-toast__content"
        style={{ flex: 1, fontSize: '14px', lineHeight: '1.4' }}
      >
        {typeof toastItem.content === 'function'
          ? (toastItem.content as () => React.ReactNode)()
          : (toastItem.content as React.ReactNode)}
      </div>

      {toastItem.closeButton && <CloseButton onClick={handleDismiss} />}

      {toastItem.progressBar && (
        <ProgressBar
          duration={toastItem.duration}
          remainingTime={toastItem.remainingTime}
          state={toastItem.state}
        />
      )}
    </div>
  );
}

export default Toast;
