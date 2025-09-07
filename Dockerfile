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

# Health check (curl already installed in base)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000" ]
