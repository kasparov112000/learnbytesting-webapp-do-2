# Stage 1: Build the Angular application
FROM node:20-alpine as builder

# Copy package files
COPY package*.json ./

ARG NPM_TOKEN

# Set working directory
WORKDIR /app

# Copy and set up NPM authentication
ENV NPM_TOKEN=${NPM_TOKEN}

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build --prod

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the built application from builder stage
COPY --from=builder /app/dist/*/browser /usr/share/nginx/html

# Copy custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 55000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
