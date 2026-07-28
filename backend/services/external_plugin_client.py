"""External plugin client for Kaisō Sushi reservation integration.

This client proxies availability and reservation creation to the KaisoSystem
external-site plugin API. It handles:
- X-API-Key authentication (backend-only, discovers restaurant via API key)
- Idempotency-Key management (frontend-provided)
- Field mapping between kaiso-site and external API
- Timeout handling (503 without fallback)
- Multi-tenant isolation via API key
"""

import httpx
import logging
import os
from datetime import datetime, timezone
from typing import Dict, Optional, Tuple
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class PluginAvailabilityRequest(BaseModel):
    """Request to check availability via plugin."""
    date: str  # YYYY-MM-DD
    guests: int


class PluginAvailabilityResponse(BaseModel):
    """Response from plugin availability check."""
    available: bool
    slots: list = []
    message: Optional[str] = None


class PluginReservationPayload(BaseModel):
    """Payload for creating reservation via plugin."""
    customer_name: str
    customer_phone: str
    customer_email: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    guests: int
    notes: Optional[str] = ""
    policy_accepted: bool


class ExternalPluginClient:
    """
    Client for KaisoSystem external-site plugin API.

    Configuration:
    - KAISOSYSTEM_PLUGIN_URL: Base URL of plugin API (default: "http://localhost:8001")
    - KAISOSYSTEM_API_KEY: X-API-Key header value (required for plugin mode)
    - KAISOSYSTEM_PLUGIN_TIMEOUT_SECONDS: HTTP timeout in seconds (default: 10)

    Restaurant ID is discovered automatically by KaisoSystem from the API key.
    """

    def __init__(self):
        self.base_url = os.environ.get("KAISOSYSTEM_PLUGIN_URL", "http://localhost:8001")
        self.api_key = os.environ.get("KAISOSYSTEM_API_KEY", "")
        self.timeout = float(os.environ.get("KAISOSYSTEM_PLUGIN_TIMEOUT_SECONDS", "10"))

        if not self.api_key:
            raise ValueError("KAISOSYSTEM_API_KEY must be set for plugin mode")

    async def get_availability(
        self, date: str, guests: int
    ) -> Tuple[bool, Optional[Dict], Optional[str]]:
        """
        Check availability via plugin API.

        Args:
            date: Date in YYYY-MM-DD format
            guests: Number of guests

        Returns:
            Tuple of (success: bool, response: dict, error: Optional[str])
            - success=True: response contains availability data with slots array
            - success=False: error contains reason (timeout returns 503 reason)
        """
        url = f"{self.base_url}/api/plugins/external-site/reservations/availability"
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
        }
        params = {"date": date, "guests": guests}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers, params=params)

                if response.status_code == 200:
                    data = response.json()
                    return True, data, None
                elif response.status_code == 401:
                    error = "Plugin API authentication failed"
                    logger.error(f"{error}: {response.text}")
                    return False, None, error
                elif response.status_code == 400:
                    error = f"Plugin API bad request: {response.json().get('detail', response.text)}"
                    logger.error(error)
                    return False, None, error
                else:
                    error = f"Plugin API error: {response.status_code}"
                    logger.error(f"{error}: {response.text}")
                    return False, None, error

        except httpx.TimeoutException:
            error = "Plugin API timeout (10s) - reservation availability unavailable"
            logger.error(error)
            return False, None, error
        except Exception as e:
            error = f"Plugin API connection error: {str(e)}"
            logger.error(error)
            return False, None, error

    async def create_reservation(
        self,
        customer_name: str,
        customer_phone: str,
        customer_email: str,
        date: str,
        time: str,
        guests: int,
        observations: Optional[str] = None,
        idempotency_key: Optional[str] = None,
    ) -> Tuple[bool, Optional[Dict], Optional[str]]:
        """
        Create reservation via plugin API.

        Payload sent to KaisoSystem contains:
        - customer name, phone, email
        - reservation date, time, guest count
        - notes (from observations + tasting menu data)
        - policy_accepted flag

        Restaurant ID is determined by KaisoSystem from API key.

        Args:
            customer_name: Customer name
            customer_phone: Customer phone
            customer_email: Customer email
            date: Date in YYYY-MM-DD format
            time: Time in HH:MM format
            guests: Number of guests
            observations: Optional notes with tasting menu data
            idempotency_key: Optional idempotency key (from frontend)

        Returns:
            Tuple of (success: bool, response: dict, error: Optional[str])
            - success=True: response contains reservation_id, status, etc.
            - success=False: error contains reason (timeout returns 503 reason)
        """
        url = f"{self.base_url}/api/plugins/external-site/reservations"
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json",
        }

        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key

        payload = {
            "customer_name": customer_name,
            "customer_phone": customer_phone,
            "customer_email": customer_email,
            "date": date,
            "time": time,
            "guests": guests,
            "notes": observations or "",
            "policy_accepted": True,  # Frontend already validated this
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, headers=headers, json=payload)

                if response.status_code == 201:
                    data = response.json()
                    return True, data, None
                elif response.status_code == 400:
                    error = f"Plugin API validation error: {response.json().get('detail', response.text)}"
                    logger.error(error)
                    return False, None, error
                elif response.status_code == 401:
                    error = "Plugin API authentication failed"
                    logger.error(f"{error}: {response.text}")
                    return False, None, error
                elif response.status_code == 409:
                    # Idempotency conflict (same key, different payload)
                    error = f"Plugin API conflict: {response.json().get('detail', 'Request body mismatch')}"
                    logger.error(error)
                    return False, None, error
                else:
                    error = f"Plugin API error: {response.status_code}"
                    logger.error(f"{error}: {response.text}")
                    return False, None, error

        except httpx.TimeoutException:
            error = "Plugin API timeout (10s) - reservation creation unavailable"
            logger.error(error)
            return False, None, error
        except Exception as e:
            error = f"Plugin API connection error: {str(e)}"
            logger.error(error)
            return False, None, error


# Global client instance
_client_instance: Optional[ExternalPluginClient] = None


def get_plugin_client() -> ExternalPluginClient:
    """Get or create plugin client instance."""
    global _client_instance
    if _client_instance is None:
        _client_instance = ExternalPluginClient()
    return _client_instance
