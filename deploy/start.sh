#!/bin/bash
# Render Entrypoint Script
# Generates backend/.env from Render environment variables
# then starts the application

ENV_FILE="/app/backend/.env"
APP_PORT="${PORT:-8001}"

echo "=== Generating backend .env from environment ==="

> "$ENV_FILE"

[ -n "$MONGO_URL" ] && echo "MONGO_URL=\"$MONGO_URL\"" >> "$ENV_FILE"
[ -n "$DB_NAME" ] && echo "DB_NAME=\"$DB_NAME\"" >> "$ENV_FILE"
[ -n "$CORS_ORIGINS" ] && echo "CORS_ORIGINS=\"$CORS_ORIGINS\"" >> "$ENV_FILE"
[ -n "$ADMIN_USER" ] && echo "ADMIN_USER=$ADMIN_USER" >> "$ENV_FILE"
[ -n "$ADMIN_PASSWORD" ] && echo "ADMIN_PASSWORD=$ADMIN_PASSWORD" >> "$ENV_FILE"
[ -n "$SMTP_HOST" ] && echo "SMTP_HOST=$SMTP_HOST" >> "$ENV_FILE"
[ -n "$SMTP_PORT" ] && echo "SMTP_PORT=$SMTP_PORT" >> "$ENV_FILE"
[ -n "$SMTP_USER" ] && echo "SMTP_USER=$SMTP_USER" >> "$ENV_FILE"
[ -n "$SMTP_PASS" ] && echo "SMTP_PASS=$SMTP_PASS" >> "$ENV_FILE"
[ -n "$ADMIN_EMAIL_FROM" ] && echo "ADMIN_EMAIL_FROM=$ADMIN_EMAIL_FROM" >> "$ENV_FILE"
[ -n "$NOTIFY_TO" ] && echo "NOTIFY_TO=$NOTIFY_TO" >> "$ENV_FILE"
[ -n "$CC_TO" ] && echo "CC_TO=$CC_TO" >> "$ENV_FILE"

echo "=== .env generated with $(wc -l < "$ENV_FILE") variables ==="
echo "=== Starting Kaisō Sushi on port $APP_PORT ==="

cd /app/backend
exec uvicorn server:app --host 0.0.0.0 --port "$APP_PORT"
