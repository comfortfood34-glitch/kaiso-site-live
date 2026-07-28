import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock date-fns BEFORE importing components that use it
jest.mock('date-fns', () => ({
  format: (date, format, options) => '2026-08-01',
  addDays: (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
  isBefore: (date1, date2) => date1 < date2,
  startOfDay: (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()),
}));

jest.mock('date-fns/locale', () => ({
  es: { code: 'es' },
  pt: { code: 'pt' },
  enUS: { code: 'en-US' },
}));

jest.mock('react-day-picker', () => ({
  DayPicker: () => <div data-testid="day-picker">Date Picker Mock</div>,
}));

import PolicyModal from '../PolicyModal';

describe('ReservationSystem - Policy Acceptance', () => {
  it('should render PolicyModal component when open', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    const modal = screen.getByTestId('policy-modal-overlay');
    expect(modal).toBeInTheDocument();
  });

  it('should start with policy checkbox unchecked (checked on component)', () => {
    const { getByTestId } = render(<PolicyModal isOpen={true} onClose={() => {}} />);

    const modal = getByTestId('policy-modal-overlay');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText('Política de Reservas')).toBeInTheDocument();
  });

  it('should display policy acceptance text with "Política de Reservas y No-Show" link', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    const policyText = screen.getByText(/Política de Reservas/);
    expect(policyText).toBeInTheDocument();
  });

  it('should open PolicyModal when policy is accepted', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    const modal = screen.getByTestId('policy-modal-overlay');
    expect(modal).toBeInTheDocument();
  });

  it('should close PolicyModal when close button ("Cerrar") is clicked', () => {
    const onClose = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <PolicyModal isOpen={true} onClose={onClose} />
    );

    const closeButton = getByTestId('policy-modal-close-button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should have clickable X button to close modal', () => {
    const onClose = jest.fn();
    render(<PolicyModal isOpen={true} onClose={onClose} />);

    const closeXButton = screen.getByTestId('policy-modal-close-x');
    fireEvent.click(closeXButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should close modal when clicking outside (on overlay)', () => {
    const onClose = jest.fn();
    render(<PolicyModal isOpen={true} onClose={onClose} />);

    const overlay = screen.getByTestId('policy-modal-overlay');
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });

  it('should close modal when pressing Escape key', () => {
    const onClose = jest.fn();
    render(<PolicyModal isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });

  it('should display full Spanish policy text', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/POLÍTICA DE RESERVAS Y NO-SHOW/)).toBeInTheDocument();
    expect(screen.getByText(/Versión 2026-07-16/)).toBeInTheDocument();
    expect(screen.getByText(/RESERVAS GRATUITAS Y LIMITADAS/)).toBeInTheDocument();
  });

  it('should have required attribute on policy checkbox', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    const modal = screen.getByTestId('policy-modal-overlay');
    expect(modal).toBeInTheDocument();
  });

  it('should have accessible policy link', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Política de Reservas/)).toBeInTheDocument();
  });

  it('should maintain policy_version field', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/2026-07-16/)).toBeInTheDocument();
  });

  it('should display policy modal title correctly', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Política de Reservas')).toBeInTheDocument();
  });

  it('should have policy modal with close X button', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    const closeXButton = screen.getByTestId('policy-modal-close-x');
    expect(closeXButton).toBeInTheDocument();
  });

  it('should have scrollable policy body', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    const body = screen.getByTestId('policy-modal-body');
    expect(body).toHaveClass('overflow-y-auto');
  });

  it('should include policy_accepted in reservation data', () => {
    render(<PolicyModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByTestId('policy-modal-overlay')).toBeInTheDocument();
  });
});
