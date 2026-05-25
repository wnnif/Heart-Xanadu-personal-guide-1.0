FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV HOST=0.0.0.0
ENV PORT=3000
ENV DB_PATH=/app/data/daohang.sqlite
ENV UPLOAD_DIR=/app/public/uploads

EXPOSE 3000
CMD ["node", "src/server.js"]
