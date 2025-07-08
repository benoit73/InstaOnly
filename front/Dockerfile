# ====================
# Step 1 - Build stage
# ====================
FROM node:20 AS builder

WORKDIR /app

# Copie package.json et lock en premier pour cache
COPY package*.json* ./
COPY pnpm-lock.yaml ./

# Installer deps avec fallback peer-deps
RUN npm install --legacy-peer-deps

# Copier tout le reste
COPY . .

# Build Next.js
RUN npm run build


# =========================
# Step 2 - Runtime stage
# =========================
FROM node:20

WORKDIR /app

# Copier build depuis le builder
COPY --from=builder /app ./

# Cloud Run fournit PORT env var
ENV PORT 8080
EXPOSE 8080

# Lancer Next.js
CMD ["npm", "start"]
