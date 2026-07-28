/**
 * Tests for normalizeReservationResponse utility function
 */

import { normalizeReservationResponse } from '../normalizeReservationResponse';

describe('normalizeReservationResponse', () => {
  const inputData = {
    customer_name: 'João Silva',
    customer_phone: '+34 673 036 835',
    customer_email: 'joao@example.com',
    guests: 2,
    reservation_date: '2026-07-31',
    reservation_time: '22:15'
  };

  describe('Valid Responses', () => {
    test('Legacy response with valid id field is accepted', () => {
      const legacyResponse = {
        id: 'uuid-001',
        reservation_date: '2026-07-31',
        reservation_time: '22:15',
        guests: 2,
        status: 'confirmada',
        customer_name: 'João Silva'
      };

      const result = normalizeReservationResponse(legacyResponse, inputData);
      expect(result).toBeDefined();
      expect(result.id).toBe('uuid-001');
      expect(result.status).toBe('confirmada');
    });

    test('Plugin response with valid reservation_id and pending status accepted', () => {
      const pluginResponse = {
        reservation_id: 'res-plugin-001',
        status: 'pending',
        message: 'Reserva recibida'
      };

      const result = normalizeReservationResponse(pluginResponse, inputData);
      expect(result).toBeDefined();
      expect(result.reservation_id).toBe('res-plugin-001');
      expect(result.status).toBe('pending');
      // Fallback: input fields are present
      expect(result.reservation_date).toBe('2026-07-31');
      expect(result.reservation_time).toBe('22:15');
      expect(result.guests).toBe(2);
    });

    test('Plugin response with valid reservation_id and confirmed status accepted', () => {
      const pluginResponse = {
        reservation_id: 'res-plugin-002',
        status: 'confirmed'
      };

      const result = normalizeReservationResponse(pluginResponse, inputData);
      expect(result).toBeDefined();
      expect(result.reservation_id).toBe('res-plugin-002');
      expect(result.status).toBe('confirmed');
    });
  });

  describe('Invalid Responses - Rejection Cases', () => {
    test('Null response is rejected', () => {
      expect(() => {
        normalizeReservationResponse(null, inputData);
      }).toThrow();
    });

    test('Undefined response is rejected', () => {
      expect(() => {
        normalizeReservationResponse(undefined, inputData);
      }).toThrow();
    });

    test('Empty object {} is rejected (no identifier)', () => {
      expect(() => {
        normalizeReservationResponse({}, inputData);
      }).toThrow();
    });

    test('Array response is rejected', () => {
      expect(() => {
        normalizeReservationResponse([], inputData);
      }).toThrow();
    });

    test('String response is rejected', () => {
      expect(() => {
        normalizeReservationResponse('invalid response', inputData);
      }).toThrow();
    });

    test('Object without id or reservation_id is rejected', () => {
      expect(() => {
        normalizeReservationResponse({ status: 'pending' }, inputData);
      }).toThrow();
    });

    test('Object with empty reservation_id is rejected', () => {
      expect(() => {
        normalizeReservationResponse({ reservation_id: '', status: 'pending' }, inputData);
      }).toThrow();
    });

    test('Object with whitespace-only reservation_id is rejected', () => {
      expect(() => {
        normalizeReservationResponse({ reservation_id: '   ', status: 'pending' }, inputData);
      }).toThrow();
    });

    test('Plugin response with missing status is rejected', () => {
      expect(() => {
        normalizeReservationResponse({ reservation_id: 'res-001' }, inputData);
      }).toThrow();
    });

    test('Plugin response with invalid status is rejected', () => {
      expect(() => {
        normalizeReservationResponse({ reservation_id: 'res-001', status: 'unknown' }, inputData);
      }).toThrow();
    });
  });

  describe('Field Completion', () => {
    test('Plugin minimal response completed with input fallback data', () => {
      const pluginResponse = {
        reservation_id: 'res-minimal-001',
        status: 'pending',
        message: 'Reserva recibida'
      };

      const result = normalizeReservationResponse(pluginResponse, inputData);
      expect(result.reservation_date).toBe(inputData.reservation_date);
      expect(result.reservation_time).toBe(inputData.reservation_time);
      expect(result.guests).toBe(inputData.guests);
      expect(result.customer_name).toBe(inputData.customer_name);
    });

    test('Plugin response with override date/time uses plugin values', () => {
      const pluginResponse = {
        reservation_id: 'res-override-001',
        status: 'confirmed',
        reservation_date: '2026-08-15',
        reservation_time: '19:30',
        guests: 4
      };

      const result = normalizeReservationResponse(pluginResponse, inputData);
      expect(result.reservation_date).toBe('2026-08-15');
      expect(result.reservation_time).toBe('19:30');
      expect(result.guests).toBe(4);
    });
  });

  describe('Error Messages', () => {
    test('Null/undefined errors contain inválida', () => {
      expect(() => {
        normalizeReservationResponse(null, inputData);
      }).toThrow(/inválida/);
    });

    test('Array rejection error is thrown', () => {
      expect(() => {
        normalizeReservationResponse([], inputData);
      }).toThrow();
    });

    test('Missing identifier error is thrown', () => {
      expect(() => {
        normalizeReservationResponse({}, inputData);
      }).toThrow();
    });
  });

  describe('Both legacy and plugin modes', () => {
    test('Legacy id takes precedence if both id and reservation_id present', () => {
      const response = {
        id: 'legacy-id-001',
        reservation_id: 'plugin-id-001',
        status: 'pending'
      };

      const result = normalizeReservationResponse(response, inputData);
      expect(result.id).toBe('legacy-id-001');
    });
  });
});
