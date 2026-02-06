FROM node:22-slim AS base
WORKDIR /app
RUN corepack enable \
  && corepack prepare pnpm@10.7.1 --activate

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    git \
    libvips-dev \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*


FROM base AS deps

ENV NODE_ENV=development

COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
  && pnpm install --frozen-lockfile


FROM deps AS build

ENV NODE_ENV=production

COPY . .
RUN pnpm run build \
  && pnpm prune --prod


FROM base AS production

ENV NODE_ENV=production

COPY --from=build --chown=node:node /app /app
RUN mkdir -p /app/.tmp /app/public/uploads \
  && chown -R node:node /app/.tmp /app/public/uploads

EXPOSE 1337
USER node
CMD ["pnpm", "run", "start"]
