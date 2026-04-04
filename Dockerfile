FROM node:24-alpine3.22 AS base
WORKDIR /app
COPY package.json package-lock.json ./

FROM base AS deps
RUN --mount=type=cache,target=/root/.npm npm ci --omit=optional

# Development Target
FROM deps AS development
ENV NODE_ENV=development
COPY . .
RUN npx prisma generate || true
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Build Target
FROM deps AS builder

COPY . .

RUN npx prisma generate
RUN npm run build
RUN --mount=type=cache,target=/root/.npm npm prune --omit=dev

# Production Target
FROM node:24-alpine3.22 AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

USER node
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
