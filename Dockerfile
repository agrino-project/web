# syntax=docker.io/docker/dockerfile:1.19-labs@sha256:dce1c693ef318bca08c964ba3122ae6248e45a1b96d65c4563c8dc6fe80349a2

# Registries are split so each FROM can use a mirror that actually has the image:
#   BUILDER_REGISTRY hosts library/node (hub.hamdocker.ir mirrors only library/*).
#   APP_REGISTRY     hosts nginxinc/nginx-unprivileged (needs a full Docker Hub mirror).
# Override either at build time, e.g.
#   --build-arg APP_REGISTRY=docker.io
ARG BUILDER_REGISTRY=docker.io
ARG APP_REGISTRY=docker.io

# Builder
FROM --platform=$BUILDPLATFORM ${BUILDER_REGISTRY}/library/node:24-bullseye AS builder

# Support custom branch of the js-sdk. This also helps us build images of element-web develop.
ARG USE_CUSTOM_SDKS=false
ARG JS_SDK_REPO="https://github.com/matrix-org/matrix-js-sdk.git"
ARG JS_SDK_BRANCH="master"

WORKDIR /src

COPY --exclude=docker . /src
RUN /src/scripts/docker-link-repos.sh
RUN yarn config set npmRegistryServer https://mirror-npm.runflare.com
RUN yarn --network-timeout=200000 install
RUN /src/scripts/docker-package.sh

# Copy the config now so that we don't create another layer in the app image
RUN cp /src/config.sample.json /src/webapp/config.json

# App
ARG APP_REGISTRY
FROM ${APP_REGISTRY}/nginxinc/nginx-unprivileged:alpine-slim

# Need root user to install packages & manipulate the usr directory
USER root

# Install jq and moreutils for sponge, both used by our entrypoints
RUN apk add jq moreutils

COPY --from=builder /src/webapp /app

# Override default nginx config. Templates in `/etc/nginx/templates` are passed
# through `envsubst` by the nginx docker image entry point.
COPY /docker/nginx-templates/* /etc/nginx/templates/
COPY /docker/docker-entrypoint.d/* /docker-entrypoint.d/

RUN rm -rf /usr/share/nginx/html \
  && ln -s /app /usr/share/nginx/html

# Run as nginx user by default
USER nginx

# HTTP listen port
ENV ELEMENT_WEB_PORT=80

HEALTHCHECK --start-period=5s CMD wget -q --spider http://localhost:$ELEMENT_WEB_PORT/config.json
