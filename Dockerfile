# Multi-stage build for production

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all necessary files for frontend build
COPY client ./client
COPY vite.config.ts ./
COPY vite-plugin-meta-images.ts ./
COPY tsconfig.json ./
COPY components.json ./
COPY postcss.config.js ./
COPY attached_assets ./attached_assets

# Build frontend
RUN npx vite build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend source
COPY server ./server
COPY prisma ./prisma
COPY script ./script

# Generate Prisma client
RUN npx prisma generate

# Build backend only (frontend already built in previous stage)
# Copy script to use its build logic
RUN mkdir -p dist && npx esbuild server/index.ts \
  --bundle \
  --platform=node \
  --format=cjs \
  --outfile=dist/index.cjs \
  --external:@prisma/client \
  --external:@prisma/adapter-pg \
  --external:pg \
  --external:express \
  --external:express-session \
  --external:multer \
  --external:zod \
  --external:nanoid \
  --external:ws \
  --minify \
  --define:"process.env.NODE_ENV=\"production\""

# Stage 3: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy built files
COPY --from=frontend-builder /app/dist/public ./dist/public
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma schema
COPY prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "dist/index.cjs"]

