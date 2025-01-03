# Stage 1: Install Node.js for building the Angular app
FROM node:lts AS build-stage
# Set working directory for the client
WORKDIR /app/client
# Copy only necessary files for npm install
COPY client/package.json client/angular.json ./
# Install dependencies
RUN npm install
# Copy the rest of the client app (excluding node_modules due to .dockerignore)
COPY client/ .
# Build the Angular app
RUN npm run build --prod

# Stage 2: Use Bun for the production environment
FROM oven/bun:latest
# Set the working directory to server
WORKDIR /app/server
# Copy server's package.json and bun.lockb
COPY server/package.json server/bun.lockb ./
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