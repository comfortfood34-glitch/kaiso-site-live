import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = previousOverflow || '';
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ hasError: false, error: null });
    window.scrollTo(0, 0);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-kaiso-bg z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-kaiso-card border border-kaiso-border max-w-md w-full py-12 px-8 text-center">
            <div className="w-16 h-16 bg-kaiso-red/10 border border-kaiso-red/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-kaiso-red" />
            </div>

            <h1 className="font-serif text-2xl text-kaiso-gold mb-3">
              Oops!
            </h1>

            <p className="text-kaiso-muted text-sm leading-relaxed mb-8">
              Algo inesperado aconteceu. Sua reserva foi salva com segurança. Tente recarregar a página.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-kaiso-gold text-black py-3 uppercase tracking-widest text-xs font-bold hover:bg-kaiso-gold-light transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                Recarregar Página
              </button>

              <button
                onClick={this.handleHome}
                className="w-full border border-kaiso-gold text-kaiso-gold py-3 uppercase tracking-widest text-xs font-bold hover:bg-kaiso-gold/10 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={14} />
                Voltar ao Início
              </button>
            </div>

            <p className="text-kaiso-muted/50 text-xs mt-8">
              Se o problema persistir, contate-nos via WhatsApp: +34 673 036 835
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
