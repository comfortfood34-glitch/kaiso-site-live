/**
 * Hotfix validation tests for ReservationSystem - Part 2
 *
 * Tests:
 * - Idempotency key header passing
 * - Invalid response handling (empty object, array, missing fields)
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

describe('ReservationSystem - Hotfix Validation Tests (Part 2)', () => {
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

  test('Idempotency key passed as header to API', async () => {
    api.createReservation.mockResolvedValueOnce({
      reservation_id: 'res_idem_001',
      status: 'confirmed',
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

    const callArgs = api.createReservation.mock.calls[0];
    expect(callArgs[1]).toBeDefined(); // Second argument is idempotencyKey
    expect(typeof callArgs[1]).toBe('string');
  });

  test('Invalid response (empty object) displays error', async () => {
    api.createReservation.mockResolvedValueOnce({});

    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(<ReservationSystem onClose={mockOnClose} />);
    await submitReservation(user);

    await waitFor(() => {
      expect(screen.getByText(/inválida|error|erro/i)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('step-success')).not.toBeInTheDocument();
  });

  test('Invalid response (array) displays error', async () => {
    api.createReservation.mockResolvedValueOnce([]);

    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(<ReservationSystem onClose={mockOnClose} />);
    await submitReservation(user);

    await waitFor(() => {
      expect(screen.getByText(/inválida|error|erro/i)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('step-success')).not.toBeInTheDocument();
  });

  test('Response with reservation_id but no status displays error', async () => {
    api.createReservation.mockResolvedValueOnce({
      reservation_id: 'res_invalid_001'
    });

    const mockOnClose = jest.fn();
    const user = userEvent.setup();

    render(<ReservationSystem onClose={mockOnClose} />);
    await submitReservation(user);

    await waitFor(() => {
      expect(screen.getByText(/inválida|error|erro/i)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('step-success')).not.toBeInTheDocument();
  });
});
