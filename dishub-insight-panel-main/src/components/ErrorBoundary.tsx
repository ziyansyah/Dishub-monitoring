import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // In production, you could send error to logging service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-destructive/5 to-accent/10">
          <Card className="w-full max-w-lg p-8 border-destructive/20">
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full"></div>
                  <div className="relative p-4 bg-gradient-to-br from-destructive to-destructive/80 rounded-2xl shadow-lg">
                    <AlertTriangle className="h-14 w-14 text-white" />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">Terjadi Kesalahan</h1>
                <p className="text-muted-foreground">
                  Mohon maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau muat ulang halaman.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Muat Ulang Halaman
                </Button>
              </div>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-destructive mb-2">
                      Error Details (Development Only)
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div className="text-xs font-mono bg-background p-2 rounded border">
                        {this.state.error.toString()}
                      </div>
                      {this.state.errorInfo && (
                        <div className="text-xs font-mono bg-background p-2 rounded border overflow-auto max-h-32">
                          <pre className="whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;