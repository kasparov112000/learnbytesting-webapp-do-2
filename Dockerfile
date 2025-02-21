# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and npmrc
COPY package*.json .npmrc ./

# Install dependencies securely
RUN --mount=type=secret,id=npm_token \
    export NPM_TOKEN="$(cat /run/secrets/npm_token)" && \
    npm config set //npm.pkg.github.com/:_authToken ${NPM_TOKEN} && \
    npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Setup production environment
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/* /etc/nginx/nginx.conf

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app to nginx serve directory
COPY --from=builder /app/dist/angular-ngrx-material-starter /usr/share/nginx/html

# Expose port 55000
EXPOSE 55000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
