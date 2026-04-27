"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for flashcard components
 */
export class FlashcardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[FlashcardErrorBoundary] Error caught:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-96 items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="size-4" />
              <AlertTitle>Có lỗi xảy ra</AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p className="text-sm">
                  {this.state.error?.message ||
                    "Không thể tải flashcard. Vui lòng thử lại."}
                </p>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Thử lại
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
