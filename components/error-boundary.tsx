"use client";

import React, { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches errors in child components and displays fallback UI
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-lg border border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="text-center">
            <h2 className="font-semibold text-foreground">Đã có lỗi xảy ra</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {this.state.error.message || "Vui lòng thử lại sau."}
            </p>
          </div>
          <Button onClick={this.resetError} variant="outline" size="sm">
            Thử lại
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of Error Boundary for functional components
 * Note: React doesn't have a hook version yet, so use the class component above
 */
export function useErrorHandler(error: Error | null) {
  React.useEffect(() => {
    if (error) {
      console.error("Error:", error);
    }
  }, [error]);
}
