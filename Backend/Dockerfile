# Stage: Production Node.js Backend
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install curl for optional container healthchecks
RUN apk --no-cache add curl

# Copy dependency manifests first for optimal Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose backend REST API port
EXPOSE 5000

# Health check to monitor container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Start the Express server
CMD ["npm", "start"]
