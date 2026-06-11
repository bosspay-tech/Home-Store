# Production image: Vite storefront (dist/) + BossPay bridge API
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts/install-bridge.mjs ./scripts/
COPY bridge/package.json bridge/package-lock.json ./bridge/
COPY bridge/vendor ./bridge/vendor/

RUN npm ci --include=dev --include=optional

COPY . .

RUN npm run build

# ── Runtime ─────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
COPY scripts/install-bridge.mjs ./scripts/
COPY bridge/package.json bridge/package-lock.json ./bridge/
COPY bridge/vendor ./bridge/vendor/

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/bridge/dist ./bridge/dist

EXPOSE 3000

CMD ["npm", "start"]
