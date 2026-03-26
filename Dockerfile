FROM python:3.11-slim

# Install Node.js + system deps
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---- Build Frontend ----
COPY frontend/package.json /app/frontend/
RUN cd /app/frontend && yarn install

COPY frontend/ /app/frontend/
# Build with empty BACKEND_URL so API calls use relative paths (same origin)
RUN cd /app/frontend && REACT_APP_BACKEND_URL="" yarn build

# ---- Install Python dependencies ----
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# ---- Install WhatsApp Node.js dependencies ----
COPY whatsapp-service/package.json whatsapp-service/package-lock.json* /app/whatsapp-service/
RUN cd /app/whatsapp-service && npm install --production

# ---- Copy application code ----
COPY backend/ /app/backend/
COPY whatsapp-service/ /app/whatsapp-service/

# ---- Copy startup script ----
COPY deploy/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create necessary directories
RUN mkdir -p /tmp

CMD ["/app/start.sh"]
