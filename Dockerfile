FROM node:22-slim AS base
WORKDIR /app

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

COPY package.json package-lock.json ./
RUN npm ci


FROM deps AS development

ENV NODE_ENV=development

COPY . .
RUN mkdir -p /app/.tmp /app/public/uploads

EXPOSE 1337
CMD ["npm", "run", "develop"]


FROM deps AS build

ENV NODE_ENV=production

COPY . .
RUN npm run build \
  && npm prune --omit=dev


FROM base AS production

ENV NODE_ENV=production

COPY --from=build --chown=node:node /app /app
RUN mkdir -p /app/.tmp /app/public/uploads \
  && chown -R node:node /app/.tmp /app/public/uploads

EXPOSE 1337
USER node
CMD ["npm", "run", "start"]
