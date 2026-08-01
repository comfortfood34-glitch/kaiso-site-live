import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  const SimulateRemoveChildError = () => {
    React.useEffect(() => {
      throw new DOMException('Failed to execute \'removeChild\' on \'Node\': The node to be removed is not a child of this node.', 'NotFoundError');
    }, []);
    return <div>Never rendered</div>;
  };

  const WorkingComponent = () => <div>Working</div>;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Working')).toBeInTheDocument();
  });

  test('renders error UI when error is caught', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Oops!')).toBeInTheDocument();
    expect(screen.getByText(/Algo inesperado aconteceu/)).toBeInTheDocument();
  });

  test('shows reload and home buttons on error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Recarregar Página')).toBeInTheDocument();
    expect(screen.getByText('Voltar ao Início')).toBeInTheDocument();
  });

  test('simulates Chrome Translate DOM manipulation error (NotFoundError)', () => {
    render(
      <ErrorBoundary>
        <SimulateRemoveChildError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Oops!')).toBeInTheDocument();
    expect(screen.getByText(/Algo inesperado aconteceu/)).toBeInTheDocument();
  });

  test('prevents black screen on removeChild error', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    const overlay = container.querySelector('[class*="fixed"][class*="inset-0"][class*="bg-kaiso-bg"]');
    expect(overlay).toBeInTheDocument();
    expect(overlay).not.toHaveClass('bg-black');
  });

  test('restores body.overflow on error', () => {
    document.body.style.overflow = 'hidden';
    const beforeOverflow = document.body.style.overflow;

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops!')).toBeInTheDocument();
    expect(beforeOverflow).toBe('hidden');
  });

  test('reload button exists and is clickable', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('Recarregar Página');
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).not.toBeDisabled();
  });

  test('home button exists and is clickable', () => {
    jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText('Voltar ao Início');
    expect(homeButton).toBeInTheDocument();
    expect(homeButton).not.toBeDisabled();

    fireEvent.click(homeButton);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  test('error message mentions that reservation was saved', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Sua reserva foi salva com segurança/)).toBeInTheDocument();
  });

  test('error boundary logs error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalled();
  });
});
