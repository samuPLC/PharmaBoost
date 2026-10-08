FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY scripts ./scripts
COPY database ./database
COPY web ./web
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3080
USER node
EXPOSE 3080
CMD ["sh", "-c", "node scripts/setup-production.js && node server/index.js"]
