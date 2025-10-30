FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src

# Build ESM bundle (outputs to dist/ by default)
RUN npm run build

FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copy only package files and install production deps
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 3333

# Run the built ESM server
CMD ["node", "dist/server.mjs"]
