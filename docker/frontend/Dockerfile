FROM nginx:alpine

# Install curl for container health check
RUN apk add --no-cache curl

# Copy custom Nginx configuration with reverse proxy for /api/ and /ws
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-built Angular bundle directly to Nginx root
COPY html /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=5s --timeout=5s --retries=10 --start-period=5s \
  CMD curl -f http://localhost:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
