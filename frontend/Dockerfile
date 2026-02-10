FROM node:20-alpine

WORKDIR /app

# Copy package metadata and install
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source files, build production assets
COPY . ./
RUN npm run build

EXPOSE 3000

# Use vite preview to serve production build
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
