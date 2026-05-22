# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
# Vite outputs static files — we serve them with nginx, not Node.
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
# nginx config that handles client-side routing (all paths → index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
