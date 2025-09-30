import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive">
          <h2 className="text-xl font-bold text-destructive">Something went wrong.</h2>
          <p className="text-muted-foreground mt-2">A component on this dashboard has crashed. You can try refreshing the page.</p>
          <details className="mt-4 text-sm bg-muted p-2 rounded">
            <summary>Error Details</summary>
            <pre className="whitespace-pre-wrap text-xs mt-2">{this.state.error?.toString()}</pre>
          </details>
          <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>Refresh Page</Button>
        </Card>
      );
    }

    return this.props.children;
  }
}
