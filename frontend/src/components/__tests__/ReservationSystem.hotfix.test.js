/**
 * Hotfix validation tests for ReservationSystem defensive response handling - Part 1
 *
 * Tests:
 * - Plugin minimal response with normalization
 * - Null response handling and retry behavior
 * - Legacy complete response acceptance
 * - Idempotency key reuse on retry
 * - Policy acceptance requirement
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservationSystem from '../ReservationSystem';
import * as api from '../../lib/api';

jest.mock('../../App', () => ({
  useLanguage: () => ({
    t: {
      reservation: {
        title: 'Reservar Mesa',
        select_date: 'Seleccionar fecha',
        select_time: 'Seleccionar hora',
        your_details: 'Tus datos',
        date: 'Data',
        time: 'Horário',
        name: 'Nome',
        email: 'Email',
        phone: 'Telefone',
        guests: 'Pessoas',
        policy: 'Aceitar política',
        submit: 'Confirmar',
        confirm: 'Confirmar',
        remaining: 'mesas disponíveis',
        lunch: 'Almoço',
        dinner: 'Jantar',
        observations: 'Observações',
        tasting_title: 'Menu degustación',
        tasting_desc: 'Premium tasting menu',
        tasting_price: '€19.90',
        tasting_availability: 'Available Wed 20:00-22:30',
        tasting_allergies: 'Alergias',
        hours_notice: 'Hacer su reserva aquí',
        success_title: 'Reserva Confirmada',
        success_message: 'Tu reserva ha sido confirmada',
        confirm_whatsapp: 'Compartir en WhatsApp',
      },
    },
    lang: 'es',
  }),
}));

jest.mock('react-day-picker', () => ({
  DayPicker: ({ onSelect }) => (
    <div data-testid="day-picker">
      <button
        data-testid="select-date-button"
        onClick={() => {
          const testDate = new Date(2026, 7, 1);
          onSelect(testDate);
        }}
      >
        Select Date
      </button>
    </div>
  ),
}));

jest.mock('../../lib/api', () => ({
  getAvailability: jest.fn(),
  createReservation: jest.fn(),
  getWhatsAppMessage: jest.fn(),
  trackEvent: jest.fn(),
}));

describe('ReservationSystem - Hotfix Validation Tests (Part 1)', () => {
  beforeAll(() => {
    window.scrollTo = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    if (!global.crypto) {
      global.crypto = {};
    }
    global.crypto.randomUUID = jest.fn(() => 'test-key-uuid');

    api.getAvailability.mockResolvedValue({
      available: true,
      slots: [
        { time: '20:00', remaining_people: 4, max_people: 12 },
        { time: '21:00', remaining_people: 2, max_people: 12 },
      ],
    });
    api.trackEvent.mockResolvedValue({});
  });

  async function submitReservation(user) {
    const selectDateBtn = screen.getByTestId('select-date-button');
    await user.click(selectDateBtn);

    await waitFor(() => {
      expect(api.getAvailability).toHaveBeenCalled();
    });

    const timeSlot = screen.getByTestId('time-2000');
    await user.click(timeSlot);

    const nameInput = screen.getByTestId('input-name');
    const phoneInput = screen.getByTestId('input-phone');
    const emailInput = screen.getByTestId('input-email');
    const policyCheckbox = screen.getByTestId('input-policy-accepted');

    await user.type(nameInput, 'João Silva');
    await user.type(phoneInput, '+55 11 9999-9999');
    await user.type(emailInput, 'joao@example.com');
    await user.click(policyCheckbox);

    const continueBtn = screen.getByTestId('continue-button');
    await user.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId('confirm-button');
    await user.click(confirmBtn);

    return api.createReservation.mock.calls;
  }

  test('Plugin minimal response with field normalization renders success screen', async () => {
    api.createReservation.mockResolvedValueOnce({
      reservation_id: 'res_123',
      status: 'pending',
      message: 'Reserva recibida'
    });

    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(<ReservationSystem onClose={mockOnClose} />);
    await submitReservation(user);

    await waitFor(() => {
      expect(api.createReservation).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId('step-success')).toBeInTheDocument();
    });

    expect(screen.getByText(/2026-08-01|agosto|august/i)).toBeInTheDocument();
    expect(screen.getByText(/20:00|20h|8:00 PM/i)).toBeInTheDocument();
  });

  test('Null response displays error and keeps confirm button available', async () => {
    api.createReservation.mockResolvedValueOnce(null);

    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(<ReservationSystem onClose={mockOnClose} />);
    await submitReservation(user);

    await waitFor(() => {
      expect(screen.getByText(/inválida|error|erro/i)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('step-success')).not.toBeInTheDocument();
    expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-button')).not.toBeDisabled();
  });

  test('Retry after null reuses same Idempotency-Key and succeeds', async () => {
    api.createReservation.mockResolvedValueOnce(null);
    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(<ReservationSystem onClose={mockOnClose} />);
    const firstCalls = await submitReservation(user);
    const firstKey = firstCalls[0][1];

    await waitFor(() => {
      expect(screen.getByText(/inválida|error|erro/i)).toBeInTheDocument();
    });

    api.createReservation.mockClear();
    api.createReservation.mockResolvedValueOnce({
      reservation_id: 'res_retry_001',
      status: 'confirmed',
      reservation_date: '2026-08-01',
      reservation_time: '20:00',
      guests: 2
    });

    const confirmBtn = screen.getByTestId('confirm-button');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(api.createReservation).toHaveBeenCalledTimes(1);
    });

    const secondKey = api.createReservation.mock.calls[0][1];
    expect(secondKey).toBe(firstKey);

    await waitFor(() => {
      expect(screen.getByTestId('step-success')).toBeInTheDocument();
    });
  });

  test('Legacy complete response renders success screen', async () => {
    api.createReservation.mockResolvedValueOnce({
      id: 'legacy_123',
      status: 'confirmada',
      reservation_date: '2026-08-01',
      reservation_time: '20:00',
      guests: 2
    });

    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(<ReservationSystem onClose={mockOnClose} />);
    await submitReservation(user);

    await waitFor(() => {
      expect(api.createReservation).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId('step-success')).toBeInTheDocument();
    });

    expect(screen.getByText(/2026-08-01|agosto|august/i)).toBeInTheDocument();
    expect(screen.getByText(/20:00|20h|8:00 PM/i)).toBeInTheDocument();
  });

  test('Policy acceptance required before reservation - form blocks without checkbox', async () => {
    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(<ReservationSystem onClose={mockOnClose} />);

    const selectDateBtn = screen.getByTestId('select-date-button');
    await user.click(selectDateBtn);

    await waitFor(() => {
      expect(api.getAvailability).toHaveBeenCalled();
    });

    const timeSlot = screen.getByTestId('time-2000');
    await user.click(timeSlot);

    const nameInput = screen.getByTestId('input-name');
    const phoneInput = screen.getByTestId('input-phone');
    const emailInput = screen.getByTestId('input-email');

    await user.type(nameInput, 'João Silva');
    await user.type(phoneInput, '+55 11 9999-9999');
    await user.type(emailInput, 'joao@example.com');

    // Try to continue WITHOUT checking policy
    const continueBtn = screen.getByTestId('continue-button');
    await user.click(continueBtn);

    // Should still be on details page (required validation prevents submission)
    await waitFor(() => {
      expect(screen.getByTestId('step-details')).toBeInTheDocument();
    });

    // Confirm button should NOT appear yet
    expect(screen.queryByTestId('confirm-button')).not.toBeInTheDocument();

    // Now mark the policy checkbox
    const policyCheckbox = screen.getByTestId('input-policy-accepted');
    await user.click(policyCheckbox);

    // Now continue should work
    await user.click(continueBtn);

    // Should advance to confirm page
    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    // Should NOT have called createReservation yet
    expect(api.createReservation).not.toHaveBeenCalled();
  });
});
