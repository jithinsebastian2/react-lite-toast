import type { ReactElement } from 'react';

export interface ProgressBarProps {
  readonly duration: number | false;
  readonly remainingTime: number | false;
  readonly state: string;
}

/**
 * ProgressBar
 *
 * Headless-ready, hardware-accelerated progress bar for react-lite-toast.
 * Uses a pure CSS keyframe shrink animation with animationPlayState mapping
 * to pause/resume seamlessly without JS loops.
 */
export function ProgressBar({
  duration,
  remainingTime,
  state,
}: ProgressBarProps): ReactElement | null {
  if (duration === false || remainingTime === false) {
    return null;
  }

  const isPaused = state === 'PAUSED';
  const playState = isPaused ? 'paused' : 'running';

  // Force re-render of progress bar animation on timer change (resuming/updating)
  const animationKey = `${duration}-${remainingTime}`;

  return (
    <div
      className="react-lite-toast__progress-bar-container"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes react-lite-toast-shrink {
              from { transform: scaleX(1); }
              to { transform: scaleX(0); }
            }
          `,
        }}
      />
      <div
        key={animationKey}
        className="react-lite-toast__progress-bar"
        style={{
          height: '100%',
          width: '100%',
          background: 'currentColor',
          transformOrigin: 'left',
          animation: 'react-lite-toast-shrink linear forwards',
          animationDuration: `${remainingTime}ms`,
          animationPlayState: playState,
        }}
      />
    </div>
  );
}

export default ProgressBar;
