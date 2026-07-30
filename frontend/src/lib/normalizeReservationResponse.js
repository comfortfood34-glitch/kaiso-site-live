/**
 * Normalize reservation response from API (legacy or plugin mode).
 *
 * Validates response structure and fills missing fields from input data.
 *
 * @param {object} response - API response object
 * @param {object} inputData - Original form input data
 * @returns {object|null} Normalized reservation object, or null if validation fails
 * @throws {string} Error message if response is invalid
 */
export function normalizeReservationResponse(response, inputData) {
  // Reject invalid response types
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    throw 'Respuesta inválida del servidor. Por favor, intente nuevamente.';
  }

  // Identify response mode (legacy or plugin)
  const hasId = response.id || response.reservation_id;
  const isLegacy = response.id ? true : false;
  const isPlugin = response.reservation_id ? true : false;

  // Legacy mode: requires 'id' field
  if (isLegacy && !response.id) {
    throw 'Respuesta inválida: identificador faltante.';
  }

  // Plugin mode: requires 'reservation_id' and 'status' fields
  if (isPlugin) {
    if (!response.reservation_id || typeof response.reservation_id !== 'string' || !response.reservation_id.trim()) {
      throw 'Respuesta inválida: identificador de reserva ausente.';
    }
    if (!response.status || !['pending', 'confirmed'].includes(response.status)) {
      throw 'Respuesta inválida: estado no reconocido.';
    }
  }

  // Neither legacy nor plugin valid format
  if (!hasId) {
    throw 'Respuesta inválida: sin identificador de reserva.';
  }

  // Complete response with input data for missing fields
  const normalized = {
    ...inputData,
    ...response,
    // Ensure both id and reservation_id are present (canonical contract)
    id: response.id || response.reservation_id,
    reservation_id: response.reservation_id || response.id,
    // Complete date/time fields from input if not in response
    reservation_date: response.reservation_date || inputData.reservation_date,
    reservation_time: response.reservation_time || inputData.reservation_time,
    guests: response.guests !== undefined ? response.guests : inputData.guests,
    customer_name: response.customer_name || inputData.customer_name
  };

  return normalized;
}
