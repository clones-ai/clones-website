FROM node:lts-slim AS base

LABEL fly_launch_runtime="Vite React"

# Install ALL system packages first (best caching)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        build-essential \
        node-gyp \
        pkg-config \
        python-is-python3 \
        curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

# App lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Change ownership to app user
RUN chown nodejs:nodejs /app

# Throw-away build stage to reduce size of final image
FROM base AS build

# Build arguments from fly.toml
ARG VITE_API_URL
ARG VITE_AUTH_ENDPOINT
ARG VITE_DESKTOP_SCHEME
ARG VITE_BASESCAN_BASE_URL
ARG VITE_FAUCET_CONTRACT_ADDRESS
ARG VITE_WALLETCONNECT_PROJECT_ID

# Convert build args to env vars for Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_ENDPOINT=$VITE_AUTH_ENDPOINT
ENV VITE_DESKTOP_SCHEME=$VITE_DESKTOP_SCHEME
ENV VITE_BASESCAN_BASE_URL=$VITE_BASESCAN_BASE_URL
ENV VITE_FAUCET_CONTRACT_ADDRESS=$VITE_FAUCET_CONTRACT_ADDRESS
ENV VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Install node modules
RUN npm ci --include=dev

# Copy application code
COPY --chown=nodejs:nodejs . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev


# Final stage for app image
FROM base

# Switch to non-root user
USER nodejs

# Copy built application
COPY --from=build --chown=nodejs:nodejs /app/dist /app/dist
COPY --from=build --chown=nodejs:nodejs /app/node_modules /app/node_modules
COPY --from=build --chown=nodejs:nodejs /app/package.json /app/package.json

# Copy server.js
COPY --from=build --chown=nodejs:nodejs /app/server.js /app/server.js

# Health check using our /healthz endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/healthz || exit 1

# Start the server by default, this can be overwritten at runtime
EXPOSE 8080
CMD [ "npm", "start" ]
