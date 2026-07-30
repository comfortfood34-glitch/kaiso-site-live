"""Canonical index definitions for WhatsApp outbox and related collections.

Source of truth for index names, fields, unique constraints.
All index creation scripts must import from here to avoid duplication.
"""

WHATSAPP_OUTBOX_INDEXES = {
    "whatsapp_outbox_events": [
        {
            "fields": [("restaurant_id", 1), ("key", 1)],
            "unique": True,
            "name": "unique_outbox_per_tenant_key",
        },
        {
            "fields": [("restaurant_id", 1), ("state", 1), ("next_retry_at", 1)],
            "name": "idx_outbox_recovery_by_tenant_state_retry",
        },
        {
            "fields": [("restaurant_id", 1), ("state", 1), ("processing_started_at", 1)],
            "name": "idx_outbox_abandoned_by_tenant",
        },
        {
            "fields": [("restaurant_id", 1), ("reservation_id", 1)],
            "name": "idx_outbox_by_tenant_reservation",
        },
    ],
}
