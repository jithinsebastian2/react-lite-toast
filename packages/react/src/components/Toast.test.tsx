import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import { getEngineRegistry, toToastId } from '@react-lite-toast/core';
import { Toast } from './Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    // Reset global registry and DOM
    const registry = getEngineRegistry();
    registry.mounted = false;
    registry.root = null;
    registry.store.setState({
      toasts: new Map(),
      containers: new Map(),
      bootstrapped: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should render content and appropriate ARIA accessibility attributes by type', () => {
    const mockToast = {
      id: toToastId('status-toast'),
      type: 'success' as const,
      content: 'Access Granted',
      state: 'VISIBLE' as const,
      position: 'top-right' as const,
      duration: 4000,
      containerId: 'default',
      priority: 0,
      createdAt: Date.now(),
      visibleAt: Date.now(),
      remainingTime: 4000,
      progressBar: false,
      closeButton: false,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnWindowBlur: false,
      animation: 'slide' as const,
      theme: 'light' as const,
      data: {},
      onOpen: null,
      onClose: null,
    };

    const { rerender } = render(<Toast toast={mockToast} />);

    // Success toast -> role="status", aria-live="polite"
    const toastEl = screen.getByRole('status');
    expect(toastEl).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Access Granted')).toBeInTheDocument();

    // Error toast -> role="alert", aria-live="assertive"
    const mockErrorToast = {
      ...mockToast,
      id: toToastId('alert-toast'),
      type: 'error' as const,
      content: 'Access Denied',
    };

    rerender(<Toast toast={mockErrorToast} />);
    const errorEl = screen.getByRole('alert');
    expect(errorEl).toHaveAttribute('aria-live', 'assertive');
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('should support function as content', () => {
    const mockToast = {
      id: toToastId('fn-content-toast'),
      type: 'info' as const,
      content: () => <span data-testid="custom-jsx">Fn Content</span>,
      state: 'VISIBLE' as const,
      position: 'top-right' as const,
      duration: 4000,
      containerId: 'default',
      priority: 0,
      createdAt: Date.now(),
      visibleAt: Date.now(),
      remainingTime: 4000,
      progressBar: false,
      closeButton: false,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnWindowBlur: false,
      animation: 'slide' as const,
      theme: 'light' as const,
      data: {},
      onOpen: null,
      onClose: null,
    };

    render(<Toast toast={mockToast} />);
    expect(screen.getByTestId('custom-jsx')).toBeInTheDocument();
  });

  it('should dispatch pause/resume actions on hover if pauseOnHover is enabled', () => {
    const registry = getEngineRegistry();
    const dispatchSpy = vi.spyOn(registry.store, 'dispatch');

    const mockToast = {
      id: toToastId('hover-toast'),
      type: 'info' as const,
      content: 'Hover me',
      state: 'VISIBLE' as const,
      position: 'top-right' as const,
      duration: 4000,
      containerId: 'default',
      priority: 0,
      createdAt: Date.now(),
      visibleAt: Date.now(),
      remainingTime: 4000,
      progressBar: false,
      closeButton: false,
      closeOnClick: false,
      pauseOnHover: true,
      pauseOnWindowBlur: false,
      animation: 'slide' as const,
      theme: 'light' as const,
      data: {},
      onOpen: null,
      onClose: null,
    };

    render(<Toast toast={mockToast} />);
    const toastEl = screen.getByRole('status');

    // Hover in -> dispatches TOAST_PAUSE
    fireEvent.mouseEnter(toastEl);
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'TOAST_PAUSE',
      payload: { id: mockToast.id },
    });

    // We simulate transition in state
    const mockPausedToast = {
      ...mockToast,
      state: 'PAUSED' as const,
    };
    cleanup();
    render(<Toast toast={mockPausedToast} />);
    const pausedEl = screen.getByRole('status');

    // Hover out -> dispatches TOAST_RESUME
    fireEvent.mouseLeave(pausedEl);
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'TOAST_RESUME',
      payload: { id: mockToast.id },
    });

    dispatchSpy.mockRestore();
  });

  it('should render close button and progress bar and handle close events', () => {
    const registry = getEngineRegistry();
    const dispatchSpy = vi.spyOn(registry.store, 'dispatch');
    const onCloseSpy = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockToast = {
      id: toToastId('interactive-toast'),
      type: 'warning' as const,
      content: 'Warning Message',
      state: 'VISIBLE' as const,
      position: 'top-right' as const,
      duration: 5000,
      containerId: 'default',
      priority: 0,
      createdAt: Date.now(),
      visibleAt: Date.now(),
      remainingTime: 3500,
      progressBar: true,
      closeButton: true,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnWindowBlur: false,
      animation: 'slide' as const,
      theme: 'light' as const,
      data: {},
      onOpen: null,
      onClose: onCloseSpy,
    };

    render(<Toast toast={mockToast} />);

    // Verify progress bar is rendered and respects remaining duration
    const progressBar = document.querySelector('.react-lite-toast__progress-bar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({
      animationDuration: '3500ms',
      animationPlayState: 'running',
    });

    // Close button clicking should dispatch dismiss and call onClose
    const closeBtn = screen.getByRole('button', { name: /dismiss notification/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'TOAST_DISMISS',
      payload: { id: mockToast.id },
    });
    expect(onCloseSpy).toHaveBeenCalledWith(mockToast);

    // Trigger onClose callback error safety path
    onCloseSpy.mockImplementationOnce(() => {
      throw new Error('callback crash');
    });
    fireEvent.click(closeBtn);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error in toast onClose callback:'),
      expect.any(Error)
    );

    dispatchSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('should render all basic icon types correctly', () => {
    const types = ['success', 'error', 'warning', 'info', 'loading'] as const;
    const baseToast = {
      id: toToastId('icon-toast'),
      content: 'Icon render test',
      state: 'VISIBLE' as const,
      position: 'top-right' as const,
      duration: 4000,
      containerId: 'default',
      priority: 0,
      createdAt: Date.now(),
      visibleAt: Date.now(),
      remainingTime: 4000,
      progressBar: false,
      closeButton: false,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnWindowBlur: false,
      animation: 'slide' as const,
      theme: 'light' as const,
      data: {},
      onOpen: null,
      onClose: null,
    };

    types.forEach((type) => {
      const { container } = render(<Toast toast={{ ...baseToast, type }} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass(`react-lite-toast__icon--${type}`);
      cleanup();
    });
  });

  it('should cover CloseButton hover states, ProgressBar false duration paths, and custom/unknown icon fallback', () => {
    const mockToast = {
      id: toToastId('coverage-toast'),
      type: 'custom' as any,
      content: 'Custom',
      state: 'VISIBLE' as const,
      position: 'top-right' as const,
      duration: false as const,
      remainingTime: false as const,
      containerId: 'default',
      priority: 0,
      createdAt: Date.now(),
      visibleAt: Date.now(),
      progressBar: true,
      closeButton: true,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnWindowBlur: false,
      animation: 'slide' as const,
      theme: 'light' as const,
      data: {},
      onOpen: null,
      onClose: null,
    };

    render(<Toast toast={mockToast} />);

    // Custom/unknown type should render null for SVG icon
    const svg = document.querySelector('svg');
    expect(svg).toBeNull();

    // Duration/remainingTime: false should render null for ProgressBar
    const progress = document.querySelector('.react-lite-toast__progress-bar');
    expect(progress).toBeNull();

    // Test remainingTime: false, duration: 4000
    const mockToastRemainingFalse = {
      ...mockToast,
      duration: 4000,
      remainingTime: false as const,
    };
    cleanup();
    render(<Toast toast={mockToastRemainingFalse} />);
    const progress2 = document.querySelector('.react-lite-toast__progress-bar');
    expect(progress2).toBeNull();

    // Test PAUSED state maps to animationPlayState: paused
    const mockToastPaused = {
      ...mockToast,
      duration: 4000,
      remainingTime: 2000,
      state: 'PAUSED' as const,
    };
    cleanup();
    render(<Toast toast={mockToastPaused} />);
    const progress3 = document.querySelector('.react-lite-toast__progress-bar');
    expect(progress3).toHaveStyle({
      animationPlayState: 'paused',
    });

    // Restore rendering to original to allow CloseButton queries to work
    cleanup();
    render(<Toast toast={mockToast} />);

    // CloseButton hover states trigger inline styles opacity update
    const closeBtn = screen.getByRole('button', { name: /dismiss notification/i });
    expect(closeBtn).toHaveStyle({ opacity: '0.5' });

    fireEvent.mouseEnter(closeBtn);
    expect(closeBtn).toHaveStyle({ opacity: '1' });

    fireEvent.mouseLeave(closeBtn);
    expect(closeBtn).toHaveStyle({ opacity: '0.5' });
  });
});
