FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm i


FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Increase heap size to 4GB
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build && \
    cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/standalone/.next ./.next
COPY --from=builder /app/.next/standalone/public ./public
EXPOSE 3000
CMD HOSTNAME="0.0.0.0" node server.js
