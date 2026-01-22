import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterErrorBoundary } from '../src/error-boundary';

describe('RouterErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <RouterErrorBoundary>
        <div>Normal Content</div>
      </RouterErrorBoundary>
    );

    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

  it('should catch errors and render default fallback', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <RouterErrorBoundary>
        <ThrowError />
      </RouterErrorBoundary>
    );

    expect(screen.getByText('Routing Error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should catch errors and render custom fallback', () => {
    const ThrowError = () => {
      throw new Error('Custom error');
    };

    const Fallback = ({ error }: { error: Error }) => (
      <div>Custom Fallback: {error.message}</div>
    );

    render(
      <RouterErrorBoundary fallback={Fallback}>
        <ThrowError />
      </RouterErrorBoundary>
    );

    expect(screen.getByText('Custom Fallback: Custom error')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Callback error');
    };

    const onError = vi.fn();

    render(
      <RouterErrorBoundary onError={onError}>
        <ThrowError />
      </RouterErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toBe('Callback error');
  });

  it('should render error message when error has message', () => {
    const ThrowError = () => {
      throw new Error('Error with message');
    };

    render(
      <RouterErrorBoundary>
        <ThrowError />
      </RouterErrorBoundary>
    );

    expect(screen.getByText('Error with message')).toBeInTheDocument();
  });

  it('should render unknown error message when error has no message', () => {
    const ThrowError = () => {
      throw Object.create(Error.prototype); // Error without message
    };

    render(
      <RouterErrorBoundary>
        <ThrowError />
      </RouterErrorBoundary>
    );

    expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
  });

  it('should handle getDerivedStateFromError correctly', () => {
    const error = new Error('Test error');
    const state = RouterErrorBoundary.getDerivedStateFromError(error);

    expect(state).toEqual({
      hasError: true,
      error,
    });
  });

  it('should call console.error when no onError callback provided', () => {
    const ThrowError = () => {
      throw new Error('Console error');
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RouterErrorBoundary>
        <ThrowError />
      </RouterErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
    // Find the call that contains our expected message
    const foundCall = consoleErrorSpy.mock.calls.some((call) =>
      call[0] === 'Router error caught by boundary:'
    );
    expect(foundCall).toBe(true);

    consoleErrorSpy.mockRestore();
  });

  it('should pass errorInfo to fallback', () => {
    const ThrowError = () => {
      throw new Error('Error with info');
    };

    const Fallback = ({ errorInfo }: { error: Error; errorInfo: any }) => (
      <div>Error Info: {errorInfo ? 'present' : 'null'}</div>
    );

    render(
      <RouterErrorBoundary fallback={Fallback}>
        <ThrowError />
      </RouterErrorBoundary>
    );

    // React's componentDidCatch passes errorInfo to the fallback component
    expect(screen.getByText('Error Info: present')).toBeInTheDocument();
  });
});
