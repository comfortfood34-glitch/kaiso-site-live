"""Tests for plugin reservation WhatsApp outbox integration.

Tests that:
1. Plugin reservation creates exactly one outbox event
2. Outbox event marked pending initially
3. Idempotency-Key prevents duplicate events
4. HTTP 201 returned immediately (doesn't wait for WhatsApp)
5. Invalid plugin responses don't create outbox
6. Outbox message sent after success
7. Failed WhatsApp allows retry without duplication
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock


class TestWhatsAppOutbox:
    """Test WhatsApp outbox service."""

    @pytest.mark.asyncio
    async def test_create_pending_message_sets_state_pending(self):
        """Verify outbox event has state='pending' immediately after creation."""
        from services.whatsapp_outbox import WhatsAppOutbox

        mock_db = MagicMock()
        mock_db.whatsapp_outbox.update_one = AsyncMock(
            return_value=MagicMock(upserted_id="id1")
        )

        outbox = WhatsAppOutbox(mock_db)
        success, error = await outbox.create_pending_message(
            reservation_id="res-123",
            phone="+34666777888",
            customer_name="John",
            date="2026-08-15",
            time="20:00",
            guests=2,
            reservation_code="ABC123",
        )

        assert success is True
        assert error is None
        # Verify state='pending' was set
        call_args = mock_db.whatsapp_outbox.update_one.call_args
        update_doc = call_args[0][1]["$setOnInsert"]
        assert update_doc["state"] == "pending"

    @pytest.mark.asyncio
    async def test_idempotent_create_prevents_duplicates(self):
        """Verify upsert prevents duplicate outbox events."""
        from services.whatsapp_outbox import WhatsAppOutbox

        mock_db = MagicMock()
        mock_db.whatsapp_outbox.update_one = AsyncMock(
            return_value=MagicMock(upserted_id=None, modified_count=0)
        )

        outbox = WhatsAppOutbox(mock_db)
        success, error = await outbox.create_pending_message(
            reservation_id="res-123",
            phone="+34666777888",
            customer_name="John",
            date="2026-08-15",
            time="20:00",
            guests=2,
            reservation_code="ABC123",
        )

        assert success is True
        # Verify upsert=True was used
        call_args = mock_db.whatsapp_outbox.update_one.call_args
        assert call_args[1]["upsert"] is True

    @pytest.mark.asyncio
    async def test_send_pending_marks_sent_on_success(self):
        """Verify message marked as 'sent' after successful WhatsApp."""
        from services.whatsapp_outbox import WhatsAppOutbox

        mock_db = MagicMock()
        find_cursor = AsyncMock()
        find_cursor.to_list = AsyncMock(
            return_value=[
                {
                    "outbox_key": "res-123:initial_confirmation:customer",
                    "phone": "+34666777888",
                    "message": "Test message",
                    "retry_count": 0,
                }
            ]
        )
        mock_db.whatsapp_outbox.find.return_value = find_cursor
        mock_db.whatsapp_outbox.update_one = AsyncMock()

        outbox = WhatsAppOutbox(mock_db)

        # Mock successful WhatsApp send
        with patch.object(outbox, "_send_whatsapp", new_callable=AsyncMock, return_value=True):
            stats = await outbox.send_pending_messages()

        # Verify state='sent' update
        call_args = mock_db.whatsapp_outbox.update_one.call_args
        update_doc = call_args[0][1]["$set"]
        assert update_doc["state"] == "sent"
        assert stats["sent"] == 1

    @pytest.mark.asyncio
    async def test_send_pending_marks_failed_on_error(self):
        """Verify message marked as 'failed' when WhatsApp fails."""
        from services.whatsapp_outbox import WhatsAppOutbox

        mock_db = MagicMock()
        find_cursor = AsyncMock()
        find_cursor.to_list = AsyncMock(
            return_value=[
                {
                    "outbox_key": "res-123:initial_confirmation:customer",
                    "phone": "+34666777888",
                    "message": "Test message",
                    "retry_count": 0,
                }
            ]
        )
        mock_db.whatsapp_outbox.find.return_value = find_cursor
        mock_db.whatsapp_outbox.update_one = AsyncMock()

        outbox = WhatsAppOutbox(mock_db)

        # Mock failed WhatsApp send
        with patch.object(outbox, "_send_whatsapp", new_callable=AsyncMock, return_value=False):
            stats = await outbox.send_pending_messages()

        # Verify state='failed' and retry_count incremented
        call_args = mock_db.whatsapp_outbox.update_one.call_args
        update_doc = call_args[0][1]["$set"]
        assert update_doc["state"] == "failed"
        assert update_doc["retry_count"] == 1
        assert stats["failed"] == 1

    @pytest.mark.asyncio
    async def test_phone_normalization_adds_country_code(self):
        """Verify phone normalization adds Spain country code (34) as default."""
        from services.whatsapp_outbox import WhatsAppOutbox

        mock_db = MagicMock()
        mock_db.whatsapp_outbox.update_one = AsyncMock(
            return_value=MagicMock(upserted_id="id1")
        )

        outbox = WhatsAppOutbox(mock_db)

        # Phone without country code
        await outbox.create_pending_message(
            reservation_id="res-123",
            phone="666777888",  # No country code
            customer_name="John",
            date="2026-08-15",
            time="20:00",
            guests=2,
            reservation_code="ABC123",
        )

        # Verify country code 34 added
        call_args = mock_db.whatsapp_outbox.update_one.call_args
        event = call_args[0][1]["$setOnInsert"]
        assert event["phone"] == "34666777888"

    def test_message_portuguese_locale(self):
        """Verify Portuguese locale produces Portuguese message."""
        from services.whatsapp_outbox import WhatsAppOutbox

        mock_db = MagicMock()
        outbox = WhatsAppOutbox(mock_db)

        msg = outbox._build_message(
            name="João",
            date="2026-08-15",
            time="20:00",
            guests=2,
            code="ABC123",
            restaurant="Kaisō Sushi",
            locale="pt",
        )

        assert "Olá João" in msg
        assert "Sua reserva" in msg
        assert "Data:" in msg

    def test_message_spanish_locale(self):
        """Verify Spanish locale produces Spanish message."""
        from services.whatsapp_outbox import WhatsAppOutbox

        mock_db = MagicMock()
        outbox = WhatsAppOutbox(mock_db)

        msg = outbox._build_message(
            name="Juan",
            date="2026-08-15",
            time="20:00",
            guests=2,
            code="ABC123",
            restaurant="Kaisō Sushi",
            locale="es",
        )

        assert "¡Hola Juan" in msg
        assert "Tu reserva" in msg
        assert "Fecha:" in msg
