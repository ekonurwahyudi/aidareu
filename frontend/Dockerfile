# Dockerfile untuk Next.js Frontend
# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Memodifikasi package.json untuk menghapus script postinstall
RUN cat package.json | grep -v "postinstall" > temp.json && mv temp.json package.json || true

# Install dependencies
RUN npm ci --legacy-peer-deps

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application files
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Create icon directories and run the icon bundling script manually
RUN mkdir -p src/assets/iconify-icons || true
RUN touch src/assets/iconify-icons/bundle-icons-css.ts || true
RUN mkdir -p public/assets/iconify-icons || true
RUN mkdir -p src/assets/iconify-icons/generated || true
RUN touch src/assets/iconify-icons/generated-icons.css || true

# Run the icon bundling script manually
RUN node_modules/.bin/tsx src/assets/iconify-icons/bundle-icons-css.ts || true

# Build application with --no-lint flag to skip linting
RUN npm run build -- --no-lint
 
# Stage 3: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
