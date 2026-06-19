# Stage 1: Install Bun for building the Angular app
FROM oven/bun:latest AS build-stage
# Set working directory for the client
WORKDIR /app/client
# Copy package.json and workspace configurations
COPY client/package.json client/tsconfig.json client/tsconfig.app.json client/angular.json ./
# Install dependencies
RUN bun install
# Copy the rest of the client app
COPY client/ .
# Build the Angular app
RUN bun run build

# Stage 2: Use Bun for the production environment
FROM oven/bun:latest
# Set the working directory to server
WORKDIR /app/server
# Copy server's package.json
COPY server/package.json ./
# Install server dependencies
RUN bun install
# Copy the rest of the server application
COPY server/ .
# Copy the built Angular app from the first stage
COPY --from=build-stage /app/client/dist /app/client/dist
# Expose the port the app runs on
EXPOSE 3000
# Define the command to run your app
CMD ["bun", "run", "src/index.ts"]
