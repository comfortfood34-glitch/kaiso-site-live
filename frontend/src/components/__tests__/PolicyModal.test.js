import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PolicyModal from '../PolicyModal';

describe('PolicyModal', () => {
  it('should not render when isOpen is false', () => {
    const { queryByTestId } = render(
      <PolicyModal isOpen={false} onClose={() => {}} />
    );
    expect(queryByTestId('policy-modal-overlay')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    const { getByTestId } = render(
      <PolicyModal isOpen={true} onClose={() => {}} />
    );
    expect(getByTestId('policy-modal-overlay')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const { getByTestId, getByRole } = render(
      <PolicyModal isOpen={true} onClose={() => {}} />
    );
    const modal = getByTestId('policy-modal-content');
    expect(modal.parentElement).toHaveAttribute('role', 'dialog');
    expect(modal.parentElement).toHaveAttribute('aria-modal', 'true');
  });

  it('should display policy title', () => {
    const { getByText } = render(
      <PolicyModal isOpen={true} onClose={() => {}} />
    );
    expect(getByText('Política de Reservas')).toBeInTheDocument();
  });

  it('should display full policy text in Spanish', () => {
    const { getByText } = render(
      <PolicyModal isOpen={true} onClose={() => {}} />
    );
    expect(getByText(/POLÍTICA DE RESERVAS Y NO-SHOW/)).toBeInTheDocument();
    expect(getByText(/Versión 2026-07-16/)).toBeInTheDocument();
    expect(getByText(/RESERVAS GRATUITAS Y LIMITADAS/)).toBeInTheDocument();
  });

  it('should call onClose when close button (X) is clicked', async () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <PolicyModal isOpen={true} onClose={onClose} />
    );
    const closeXButton = getByTestId('policy-modal-close-x');
    fireEvent.click(closeXButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when "Cerrar" button is clicked', async () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <PolicyModal isOpen={true} onClose={onClose} />
    );
    const closeButton = getByTestId('policy-modal-close-button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when Escape key is pressed', async () => {
    const onClose = jest.fn();
    render(
      <PolicyModal isOpen={true} onClose={onClose} />
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when clicking outside the modal (on overlay)', async () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <PolicyModal isOpen={true} onClose={onClose} />
    );
    const overlay = getByTestId('policy-modal-overlay');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('should NOT call onClose when clicking inside the modal content', async () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <PolicyModal isOpen={true} onClose={onClose} />
    );
    const content = getByTestId('policy-modal-content');
    fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should hide body overflow when open', async () => {
    const { rerender } = render(
      <PolicyModal isOpen={false} onClose={() => {}} />
    );
    expect(document.body.style.overflow).not.toBe('hidden');

    rerender(
      <PolicyModal isOpen={true} onClose={() => {}} />
    );
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  it('should restore body overflow when closed', async () => {
    const { rerender } = render(
      <PolicyModal isOpen={true} onClose={() => {}} />
    );
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });

    rerender(
      <PolicyModal isOpen={false} onClose={() => {}} />
    );
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('');
    });
  });

  it('should have scrollable policy body', () => {
    const { getByTestId } = render(
      <PolicyModal isOpen={true} onClose={() => {}} />
    );
    const body = getByTestId('policy-modal-body');
    expect(body).toHaveClass('overflow-y-auto');
  });

  it('should have proper styling for modal header and footer', () => {
    const { getByTestId } = render(
      <PolicyModal isOpen={true} onClose={() => {}} />
    );
    const content = getByTestId('policy-modal-content');
    expect(content).toHaveClass('bg-kaiso-bg');
    expect(content).toHaveClass('border');
    expect(content).toHaveClass('border-kaiso-border');
  });
});
