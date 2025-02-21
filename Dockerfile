# Stage 1: Build the Angular application
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files and npmrc
COPY package*.json .npmrc ./

# Build arguments for GitHub registry authentication
ARG GITHUB_TOKEN
ENV NPM_TOKEN=$GITHUB_TOKEN

# Install dependencies
RUN npm config set //npm.pkg.github.com/:_authToken ${NPM_TOKEN} && \
    npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build --prod

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app to Nginx serve directory
COPY --from=builder /app/dist/angular-ngrx-material-starter /usr/share/nginx/html

# Expose port 55000
EXPOSE 55000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
