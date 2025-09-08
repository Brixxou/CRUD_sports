FROM node:18-bullseye-slim

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and generate client if present
COPY prisma ./prisma
RUN npx prisma generate || true

# Copy application sources
COPY . .

EXPOSE 3001

# Start the application
CMD ["node", "app.js"]
