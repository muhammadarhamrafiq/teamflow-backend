# stage 1 - build the application
FROM node:24-alpine3.22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=development --omit=optional && npm cache clean --force

COPY . .

RUN npx prisma generate
RUN npm run build

RUN rm -rf node_modules

# stage 2 - run the production image
FROM node:24-alpine3.22 AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main.js"]