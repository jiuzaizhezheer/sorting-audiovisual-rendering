import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-6">
          <div className="max-w-md rounded-lg border border-red-200 bg-white p-8 text-center shadow-md">
            <h1 className="text-xl font-semibold text-red-700">出错了</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              应用遇到了未预期的错误，请尝试刷新页面。
            </p>
            <p className="mt-2 break-all font-mono text-xs text-slate-400">
              {this.state.error?.message ?? '未知错误'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex h-9 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white"
            >
              刷新页面
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
