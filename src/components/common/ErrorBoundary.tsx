import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // If the error comes from third-party browser extensions (such as MetaMask, Phantom, etc.), ignore it
    const msg = error?.message || '';
    if (
      msg.includes('MetaMask') ||
      msg.includes('ethereum') ||
      msg.includes('solana') ||
      msg.includes('web3')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log application-specific errors
    const msg = error?.message || '';
    if (
      !msg.includes('MetaMask') &&
      !msg.includes('ethereum') &&
      !msg.includes('solana') &&
      !msg.includes('web3')
    ) {
      console.error('Uncaught React error:', error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Erro de Execução</h2>
              <p className="text-xs text-slate-400 mt-1">
                Ocorreu uma instabilidade pontual na interface.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors w-full cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Aplicação
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
