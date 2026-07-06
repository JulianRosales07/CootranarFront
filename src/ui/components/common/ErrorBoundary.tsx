import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#ef4444' }}>
            error
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '16px 0 8px 0' }}>
            Algo salió mal
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', maxWidth: '500px' }}>
            {this.state.error?.message || 'Ha ocurrido un error inesperado'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            style={{
              padding: '10px 24px',
              background: '#0D3B8E',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
