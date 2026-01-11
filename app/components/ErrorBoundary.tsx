import { Component } from 'preact';
import { logger } from '../lib/logger';

interface ErrorBoundaryProps {
  children: preact.ComponentChildren;
  fallback?: preact.ComponentChildren;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component to catch and handle React/Preact errors
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown): void {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div class="error-boundary" style="padding: 20px; border: 2px solid #e74c3c; border-radius: 8px; background-color: #fee; margin: 20px;">
          <h3 style="color: #e74c3c; margin-top: 0;">Something went wrong</h3>
          <p>We encountered an error while calculating your wedding costs. Please try refreshing the page.</p>
          {this.state.error && (
            <details style="margin-top: 10px;">
              <summary style="cursor: pointer; color: #7f8c8d;">Technical details</summary>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; margin-top: 10px;">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            style="margin-top: 15px; padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

