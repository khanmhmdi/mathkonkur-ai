import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = this.state.error?.message || "متاسفانه خطایی در برنامه رخ داده است.";

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-right" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 space-y-6">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-900">خطای غیرمنتظره</h2>
              <p className="text-slate-500 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
            >
              <RefreshCcw className="w-5 h-5" />
              تلاش مجدد
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
