FROM oven/bun
WORKDIR /app

# Copy the lock and package file
COPY bun.lockb . 
COPY package.json . 

# Install dependencies
RUN bun install --frozen-lockfile

# Copy your source code
# If only files in the src folder changed, this is the only step that gets executed!
COPY api ./api 

CMD ["bun", "api/index.ts"]
