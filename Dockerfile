# =====================================================================
#  MULTI-STAGE DOCKERFILE
#  Stage 1 ("build"): uses Node to turn our React code into static files.
#  Stage 2 ("runtime"): uses Nginx to serve those files.
#  Why two stages? The final image only contains Nginx + the built files,
#  NOT Node or node_modules, so it is much smaller (~50 MB vs ~1 GB).
# =====================================================================

# ---------- Stage 1: build ----------
FROM node:22-alpine AS build

# All following commands run inside /app in the container
WORKDIR /app

# Copy ONLY the package files first. Docker caches each step ("layer"),
# so if package.json hasn't changed, `npm ci` is skipped on rebuilds = faster.
COPY package.json package-lock.json ./
RUN npm ci

# Now copy the rest of the source code
COPY . .

# A build argument lets the pipeline stamp a version (e.g. the git commit)
ARG APP_VERSION=docker-local
ENV VITE_APP_VERSION=$APP_VERSION

# Produce the optimised static site in /app/dist
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM nginx:stable-alpine AS runtime

# Replace the default Nginx config with ours
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from stage 1 into Nginx's web folder
COPY --from=build /app/dist /usr/share/nginx/html

# Document which port the container listens on
EXPOSE 80

# Lets Docker check the container is actually serving pages
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/health || exit 1

# Run Nginx in the foreground (containers stop when the main process exits)
CMD ["nginx", "-g", "daemon off;"]
