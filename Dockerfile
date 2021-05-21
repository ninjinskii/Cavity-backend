FROM node:16.2.0-buster-slim as development

ENV NODE_ENV=development
ENV PATH=/app/node_modules/.bin:$PATH

ENV HOST 0.0.0.0

RUN set -ex \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    ca-certificates \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
EXPOSE 3000

CMD ["yarn", "dev"]

# FROM node:16.2.0-buster-slim as production

# ENV NODE_ENV=production

# WORKDIR /app
# EXPOSE 3000
# USER node

# CMD ["yarn", "start"]
