# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Install all dependencies including devDependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files for production dependencies
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --production --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Create necessary directories
RUN mkdir -p logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Set the user to node for better security
USER node

# Start the application
CMD ["node", "dist/server.js"]
