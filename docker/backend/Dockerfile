FROM node:20-alpine

# Install build dependencies for native modules (bcrypt) and curl for healthcheck
RUN apk add --no-cache python3 make g++ postgresql-client curl

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application code
COPY . .

# Ensure entrypoint script is executable
RUN chmod +x entrypoint.sh

# Expose backend REST & WebSocket port
EXPOSE 3000

# Healthcheck endpoint
HEALTHCHECK --interval=5s --timeout=5s --retries=15 --start-period=5s \
  CMD curl -f http://localhost:3000/api/getStationConfig || exit 1

# Start via entrypoint
ENTRYPOINT ["./entrypoint.sh"]
