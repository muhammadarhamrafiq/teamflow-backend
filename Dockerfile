# stage 1 - build the application
FROM node:24-alpine3.22 AS builder

WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

# stage 2 - run the production image
FROM node:24-alpine3.22

WORKDIR /app
COPY package*.json .
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

EXPOSE 3000
CMD ["node", "dist/main.js"]