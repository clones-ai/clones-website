import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Call optional error handler
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
            // TODO: Integrate with Sentry or similar
            // sendErrorToService(error, errorInfo);
        }
    }

    public render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="ultra-premium-glass-card rounded-2xl p-8 max-w-md text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-text-primary mb-4">
                            Something went wrong
                        </h2>
                        <p className="text-text-secondary mb-6">
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            Refresh Page
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-text-tertiary mb-2">
                                    Error Details (Development)
                                </summary>
                                <pre className="text-xs bg-red-900/20 p-4 rounded overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Specialized error boundary for 3D scenes
export function SplineErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="w-full h-[500px] flex items-center justify-center ultra-premium-glass-card rounded-2xl">
                    <div className="text-center">
                        <div className="text-4xl mb-4">🎨</div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">
                            3D Scene Unavailable
                        </h3>
                        <p className="text-text-secondary">
                            The 3D experience couldn't load. This might be due to browser compatibility or graphics limitations.
                        </p>
                    </div>
                </div>
            }
            onError={(error) => {
                console.warn('3D Scene Error:', error);
                // Track 3D-specific errors separately
            }}
        >
            {children}
        </ErrorBoundary>
    );
}
