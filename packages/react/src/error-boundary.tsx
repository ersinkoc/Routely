/**
 * Error Boundary component for catching routing errors.
 * @packageDocumentation
 */

import type { ReactNode, ComponentType } from 'react';
import { Component } from 'react';

export interface RouterErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error; errorInfo: any }>;
  onError?: (error: Error, errorInfo: any) => void;
}

export interface RouterErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for catching router-related errors.
 *
 * @example
 * ```tsx
 * <RouterErrorBoundary
 *   fallback={({ error }) => <div>Error: {error.message}</div>}
 *   onError={(error) => console.error(error)}
 * >
 *   <RouterProvider router={router}>
 *     <App />
 *   </RouterProvider>
 * </RouterErrorBoundary>
 * ```
 */
export class RouterErrorBoundary extends Component<
  RouterErrorBoundaryProps,
  RouterErrorBoundaryState
> {
  constructor(props: RouterErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): RouterErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      console.error('Router error caught by boundary:', error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;

      if (Fallback) {
        return <Fallback error={this.state.error!} errorInfo={null} />;
      }

      return (
        <div>
          <h2>Routing Error</h2>
          <p>{this.state.error?.message || 'An unknown error occurred'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
