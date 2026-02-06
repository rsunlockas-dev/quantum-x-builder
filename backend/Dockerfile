FROM node:20-alpine

WORKDIR /app

COPY backend/package.json ./
RUN npm install --omit=dev

COPY backend/ ./

ENV PORT=8787
EXPOSE 8787

CMD ["node", "src/index.js"]
