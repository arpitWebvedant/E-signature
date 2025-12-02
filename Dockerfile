# syntax=docker/dockerfile:1.7
# Optimized Next.js E-Signature App with smart caching and auto-healing

FROM node:20-alpine AS base
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache python3 make g++ curl dumb-init && \
    rm -rf /var/cache/apk/*
WORKDIR /app
RUN npm config set cache /root/.npm --global

# Production dependencies stage (CACHED - only changes when package.json changes)
FROM base AS deps
ARG NPM_TOKEN
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked,id=npm-global \
    if [ -n "$NPM_TOKEN" ]; then \
      echo "@OmnisAIOrg:registry=https://npm.pkg.github.com/" > .npmrc && \
      echo "registry=https://registry.npmjs.org/" >> .npmrc && \
      echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc; \
    fi && \
    if [ -f package-lock.json ]; then \
        npm ci --omit=dev --legacy-peer-deps --prefer-offline; \
    else \
        echo "No package-lock.json found, using npm install..." && \
        npm install --omit=dev --legacy-peer-deps --prefer-offline; \
    fi && \
    rm -f .npmrc

# Build dependencies stage (CACHED - only changes when package.json changes)
FROM base AS build-deps
ARG NPM_TOKEN
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked,id=npm-global \
    if [ -n "$NPM_TOKEN" ]; then \
      echo "@OmnisAIOrg:registry=https://npm.pkg.github.com/" > .npmrc && \
      echo "registry=https://registry.npmjs.org/" >> .npmrc && \
      echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc; \
    fi && \
    if [ -f package-lock.json ]; then \
        npm ci --legacy-peer-deps --prefer-offline; \
    else \
        echo "No package-lock.json found, using npm install..." && \
        npm install --legacy-peer-deps --prefer-offline; \
    fi && \
    rm -f .npmrc

# Build stage (rebuilds when source code changes)
FROM build-deps AS builder
COPY . .

# Build arguments for Next.js environment variables
ARG NEXT_PUBLIC_CENTRALIZED_AUTH_BACKEND_URL
ARG NEXT_PUBLIC_CENTRALIZED_AUTH_FRONTEND_URL
ARG NEXT_PUBLIC_APP_API_BASE_URL
ARG NEXT_PUBLIC_PRODUCT_NAME

# Convert ARG to ENV for Next.js build
ENV NEXT_PUBLIC_CENTRALIZED_AUTH_BACKEND_URL=$NEXT_PUBLIC_CENTRALIZED_AUTH_BACKEND_URL
ENV NEXT_PUBLIC_CENTRALIZED_AUTH_FRONTEND_URL=$NEXT_PUBLIC_CENTRALIZED_AUTH_FRONTEND_URL
ENV NEXT_PUBLIC_APP_API_BASE_URL=$NEXT_PUBLIC_APP_API_BASE_URL
ENV NEXT_PUBLIC_PRODUCT_NAME=$NEXT_PUBLIC_PRODUCT_NAME
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build with optimized caching
RUN --mount=type=cache,target=/app/.next/cache,sharing=locked,id=nextjs-build \
    --mount=type=cache,target=/app/node_modules/.cache,sharing=locked,id=node-cache \
    NODE_OPTIONS="--max-old-space-size=2048" npm run build && \
    test -d .next || (echo "Build failed: .next directory not found" && exit 1)

# Final runtime image (clean, minimal)
FROM base AS app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy production dependencies and built app
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create logs directory
RUN mkdir -p logs && chown -R nextjs:nodejs logs .next

USER nextjs
EXPOSE 3000

CMD ["dumb-init", "node", "node_modules/next/dist/bin/next", "start"]