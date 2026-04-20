import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SovereignErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("Cynical Mirror Crash:", error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('activeTab'); // Clear tab state
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-surface text-on-surface p-5 text-center">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-error" />
          </div>
          <h2 className="font-headline text-2xl font-bold mb-2">Cynical Mirror Recovery</h2>
          <p className="text-on-surface-variant mb-8 max-w-md">
            The system has encountered an unexpected state. To protect your manuscript's integrity, we have halted operations.
          </p>
          <button 
            onClick={this.handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold uppercase tracking-widest text-xs rounded-full hover:bg-primary/90 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Console & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
