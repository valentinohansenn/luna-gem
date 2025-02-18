FROM node:20-slim

WORKDIR /usr/src/wrap-up-bot

# Copy package files
COPY package*.json ./

# Install TypeScript globally
RUN npm install -g typescript

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Verify the build
RUN ls -la dist/

# Set Node to development for more verbose logging
ENV NODE_ENV=development

# Command to run with more verbose output
CMD ["sh", "-c", "NODE_DEBUG=* node dist/index.js"]
