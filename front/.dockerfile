# ====================

# Step 1 - Build stage

# ====================

FROM node:20 AS builder
 
# Create app directory

WORKDIR /app
 
# Copy package.json and lock files first for better cache

COPY package*.json* ./

COPY pnpm-lock.yaml ./
 
# Install dependencies

RUN npm install
 
# Copy all project files

COPY . .
 
# Build Next.js

RUN npm run build
 
 
# =========================

# Step 2 - Runtime stage

# =========================

FROM node:20
 
WORKDIR /app
 
# Copy built app from builder

COPY --from=builder /app ./
 
# Cloud Run will set PORT dynamically

ENV PORT 8080

EXPOSE 8080
 
# Start Next.js server

CMD ["npm", "start"]

 