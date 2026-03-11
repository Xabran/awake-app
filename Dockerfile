FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.32.0 --activate

WORKDIR /app

# Copy workspace config first for better layer caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api/ apps/api/
COPY packages/shared/ packages/shared/

EXPOSE 3000

CMD ["pnpm", "dev:api"]
