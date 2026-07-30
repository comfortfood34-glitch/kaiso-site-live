import { normalizeReservationResponse } from '../normalizeReservationResponse';

describe('normalizeReservationResponse', () => {
  const baseInputData = {
    customer_name: 'John Doe',
    customer_phone: '+34 600 000 000',
    customer_email: 'john@example.com',
    guests: 2,
    observations: 'No observations',
    has_tasting_menu: false,
    tasting_allergies: '',
    policy_accepted: true,
    reservation_date: '2026-08-01',
    reservation_time: '20:00'
  };

  describe('Plugin mode response', () => {
    it('should normalize plugin response with reservation_id', () => {
      const pluginResponse = {
        reservation_id: '95492c92-test',
        status: 'confirmed',
        message: 'Reserva creada exitosamente'
      };

      const result = normalizeReservationResponse(pluginResponse, baseInputData);

      expect(result).toBeDefined();
      expect(result.id).toBe('95492c92-test');
      expect(result.reservation_id).toBe('95492c92-test');
      expect(result.status).toBe('confirmed');
      expect(result.reservation_date).toBe('2026-08-01');
      expect(result.reservation_time).toBe('20:00');
      expect(result.guests).toBe(2);
      expect(result.customer_name).toBe('John Doe');
    });

    it('should fail if reservation_id is missing', () => {
      const invalidResponse = {
        status: 'confirmed'
      };

      expect(() => {
        normalizeReservationResponse(invalidResponse, baseInputData);
      }).toThrow('sin identificador de reserva');
    });

    it('should fail if status is not pending or confirmed', () => {
      const invalidResponse = {
        reservation_id: '95492c92-test',
        status: 'invalid_status'
      };

      expect(() => {
        normalizeReservationResponse(invalidResponse, baseInputData);
      }).toThrow('estado no reconocido');
    });
  });

  describe('Legacy mode response', () => {
    it('should normalize legacy response with id', () => {
      const legacyResponse = {
        id: 'legacy-id-123',
        status: 'confirmed'
      };

      const result = normalizeReservationResponse(legacyResponse, baseInputData);

      expect(result).toBeDefined();
      expect(result.id).toBe('legacy-id-123');
      expect(result.reservation_id).toBe('legacy-id-123');
      expect(result.status).toBe('confirmed');
    });
  });

  describe('Invalid responses', () => {
    it('should reject null response', () => {
      expect(() => {
        normalizeReservationResponse(null, baseInputData);
      }).toThrow('Respuesta inválida del servidor');
    });

    it('should reject array response', () => {
      expect(() => {
        normalizeReservationResponse([], baseInputData);
      }).toThrow('Respuesta inválida del servidor');
    });

    it('should reject response with no identifier', () => {
      expect(() => {
        normalizeReservationResponse({ status: 'confirmed' }, baseInputData);
      }).toThrow('sin identificador de reserva');
    });
  });

  describe('Field merging', () => {
    it('should merge response with input data', () => {
      const response = {
        reservation_id: '95492c92-test',
        status: 'confirmed'
      };

      const result = normalizeReservationResponse(response, baseInputData);

      expect(result.reservation_id).toBe('95492c92-test');
      expect(result.status).toBe('confirmed');
      expect(result.customer_name).toBe('John Doe');
      expect(result.customer_phone).toBe('+34 600 000 000');
      expect(result.customer_email).toBe('john@example.com');
      expect(result.reservation_date).toBe('2026-08-01');
      expect(result.reservation_time).toBe('20:00');
      expect(result.guests).toBe(2);
    });

    it('should override input fields if present in response', () => {
      const response = {
        reservation_id: '95492c92-test',
        status: 'confirmed',
        guests: 4
      };

      const result = normalizeReservationResponse(response, baseInputData);

      expect(result.guests).toBe(4);
    });
  });
});
