FROM python:3.11-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl supervisor && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Install Node.js dependencies
COPY whatsapp-service/package.json whatsapp-service/package-lock.json* /app/whatsapp-service/
RUN cd /app/whatsapp-service && npm install --production

# Copy app code
COPY backend/ /app/backend/
COPY whatsapp-service/ /app/whatsapp-service/

# Copy supervisor config
COPY deploy/supervisord.conf /etc/supervisor/conf.d/app.conf

# Create log directories
RUN mkdir -p /var/log/supervisor /tmp

EXPOSE 8001

CMD ["supervisord", "-n", "-c", "/etc/supervisor/conf.d/app.conf"]
