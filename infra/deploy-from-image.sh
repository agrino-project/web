#!/bin/bash
# ===========================================
# Agrino Web Deployment Script
# ===========================================
# Usage:
#   ./infra/deploy-from-image.sh <image_or_tar> [options]
#
# Examples:
#
#   === Deploy from a registry ===
#   ./infra/deploy-from-image.sh agrino/web:latest
#   ./infra/deploy-from-image.sh agrino/web:v1.0.0 --publish 8080
#
#   === Deploy from a local .tar file ===
#   ./infra/deploy-from-image.sh ./images/agrino-web-20260503.tar
#   ./infra/deploy-from-image.sh /path/to/agrino-web.tar --publish 127.0.0.1:8080:80
#
#   === With custom options ===
#   ./infra/deploy-from-image.sh agrino/web:latest --name agrino-web-staging
#   ./infra/deploy-from-image.sh agrino/web:latest --network my-net --publish 80
#   ./infra/deploy-from-image.sh agrino/web:latest --config /etc/agrino/config.json
#   ./infra/deploy-from-image.sh agrino/web:latest --env-file infra/.env.production
#
# Defaults (matched to the docker-compose `element-web` service):
#   container name : element-web
#   network        : synapse-network
#   exposed port   : 80   (no host publish unless --publish is passed)
#   config mount   : /root/web/config.json -> /app/config.json:ro
#   restart policy : unless-stopped
#
# So the typical server invocation is just:
#   ./infra/deploy-from-image.sh ./images/agrino-web-YYYYMMDD.tar
# (a reverse-proxy such as Synapse/Caddy on synapse-network can then reach
#  it as element-web:80.) Pass --no-config to skip the host config mount,
#  or --publish 8080 to bind it to the host instead.
# ===========================================

set -euo pipefail

# --- Defaults (mirror docker-compose service `element-web`) ---
DEFAULT_NAME="element-web"
DEFAULT_NETWORK="synapse-network"
DEFAULT_PORT=80
DEFAULT_CONFIG_FILE="/root/web/config.json"

# --- Parse arguments ---
if [ $# -lt 1 ]; then
  cat <<EOF
Usage: $0 <image_or_tar> [options]

Deploy from a registry:
  $0 agrino/web:latest

Deploy from a local .tar file:
  $0 ./images/agrino-web-20260503.tar

Options:
  --name NAME              Container name (default: $DEFAULT_NAME)
  --network NETWORK        Docker network (default: $DEFAULT_NETWORK)
  --port PORT              Container port to expose to network (default: $DEFAULT_PORT)
  --publish HOST[:CONT]    Publish container port to host (passed to docker -p).
                           Examples: --publish 8080  ->  -p 8080:80
                                     --publish 127.0.0.1:8080:80
  --config FILE            Mount a host config.json over /app/config.json
                           (default: $DEFAULT_CONFIG_FILE)
  --no-config              Do not mount any host config.json (use the one baked into the image)
  --modules DIR            Mount a host directory at /modules (for runtime modules)
  --env-file FILE          Pass an env file to the container
  --no-pull                Skip 'docker pull' even when source is a registry image
  --extra ARGS             Extra raw args appended to 'docker run' (quoted string)
  -h, --help               Show this help
EOF
  exit 1
fi

IMAGE_SOURCE="$1"
shift

IS_LOCAL_TAR=false
IMAGE_NAME=""
APP_NAME="$DEFAULT_NAME"
NETWORK_NAME="$DEFAULT_NETWORK"
CONTAINER_PORT="$DEFAULT_PORT"
PUBLISH_SPEC=""
CONFIG_FILE="$DEFAULT_CONFIG_FILE"
MODULES_DIR=""
ENV_FILE=""
NO_PULL=false
EXTRA_ARGS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)        APP_NAME="$2"; shift 2 ;;
    --network)     NETWORK_NAME="$2"; shift 2 ;;
    --port)        CONTAINER_PORT="$2"; shift 2 ;;
    --publish)     PUBLISH_SPEC="$2"; shift 2 ;;
    --config)      CONFIG_FILE="$2"; shift 2 ;;
    --no-config)   CONFIG_FILE=""; shift ;;
    --modules)     MODULES_DIR="$2"; shift 2 ;;
    --env-file)    ENV_FILE="$2"; shift 2 ;;
    --no-pull)     NO_PULL=true; shift ;;
    --extra)       EXTRA_ARGS="$2"; shift 2 ;;
    -h|--help)
      "$0"  # re-run with no args to print usage
      exit 0
      ;;
    *)
      echo "❌ Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

# --- Detect: tar file vs registry image ---
if [[ "$IMAGE_SOURCE" == *.tar ]] || [[ -f "$IMAGE_SOURCE" && "$IMAGE_SOURCE" != *:* ]]; then
  IS_LOCAL_TAR=true

  if [[ ! -f "$IMAGE_SOURCE" ]]; then
    echo "❌ Tar file not found: $IMAGE_SOURCE" >&2
    exit 1
  fi

  echo "📦 Detected local tar file: $IMAGE_SOURCE"
  echo "🔍 Loading image..."

  LOAD_OUTPUT=$(docker load -i "$IMAGE_SOURCE")
  echo "$LOAD_OUTPUT"

  IMAGE_NAME=$(echo "$LOAD_OUTPUT" | grep -oP 'Loaded image(?:\(s\))?: \K\S+' | head -n1 || true)

  if [[ -z "$IMAGE_NAME" ]]; then
    echo "❌ Could not determine image name from tar file" >&2
    exit 1
  fi

  echo "✅ Loaded image: $IMAGE_NAME"
else
  IMAGE_NAME="$IMAGE_SOURCE"
  echo "🐋 Using registry image: $IMAGE_NAME"
fi

# --- Validate optional mounts ---
if [ -n "$CONFIG_FILE" ] && [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Config file not found: $CONFIG_FILE" >&2
  exit 1
fi
if [ -n "$MODULES_DIR" ] && [ ! -d "$MODULES_DIR" ]; then
  echo "❌ Modules directory not found: $MODULES_DIR" >&2
  exit 1
fi
if [ -n "$ENV_FILE" ] && [ ! -f "$ENV_FILE" ]; then
  echo "❌ Env file not found: $ENV_FILE" >&2
  exit 1
fi

# --- If --publish is just a number, expand to "<n>:<container_port>" ---
if [[ "$PUBLISH_SPEC" =~ ^[0-9]+$ ]]; then
  PUBLISH_SPEC="${PUBLISH_SPEC}:${CONTAINER_PORT}"
fi

echo "🔄 Deploying $APP_NAME"
echo "   Image:   $IMAGE_NAME"
echo "   Network: $NETWORK_NAME"
echo "   Port:    $CONTAINER_PORT (expose)"
[ -n "$PUBLISH_SPEC" ] && echo "   Publish: $PUBLISH_SPEC"
[ -n "$CONFIG_FILE" ]  && echo "   Config:  $CONFIG_FILE -> /app/config.json"
[ -n "$MODULES_DIR" ]  && echo "   Modules: $MODULES_DIR -> /modules"
[ -n "$ENV_FILE" ]     && echo "   Env:     $ENV_FILE"

# --- Pull (if from registry and not skipped) ---
if [[ "$IS_LOCAL_TAR" == false && "$NO_PULL" == false ]]; then
  echo "📦 Pulling image: $IMAGE_NAME"
  docker pull "$IMAGE_NAME"
else
  echo "⏭️  Skipping pull"
fi

# --- Stop & remove old container if present ---
if [ "$(docker ps -q -f name=^${APP_NAME}$)" ]; then
  echo "🛑 Stopping running container: $APP_NAME"
  docker stop "$APP_NAME" >/dev/null
fi
if [ "$(docker ps -aq -f name=^${APP_NAME}$)" ]; then
  echo "🗑️  Removing old container: $APP_NAME"
  docker rm "$APP_NAME" >/dev/null
fi

# --- Ensure network exists ---
if ! docker network ls --format '{{.Name}}' | grep -qx "$NETWORK_NAME"; then
  echo "🌐 Creating network: $NETWORK_NAME"
  docker network create "$NETWORK_NAME" >/dev/null
fi

# --- Build docker run command ---
DOCKER_CMD="docker run -d --name $APP_NAME --restart unless-stopped --network $NETWORK_NAME --expose $CONTAINER_PORT"

if [ -n "$PUBLISH_SPEC" ]; then
  DOCKER_CMD+=" -p $PUBLISH_SPEC"
fi

if [ -n "$ENV_FILE" ]; then
  DOCKER_CMD+=" --env-file $ENV_FILE"
fi

# Always set ELEMENT_WEB_PORT to whatever we're exposing, so nginx listens on it.
DOCKER_CMD+=" -e ELEMENT_WEB_PORT=$CONTAINER_PORT"

if [ -n "$CONFIG_FILE" ]; then
  DOCKER_CMD+=" -v $(realpath "$CONFIG_FILE"):/app/config.json:ro"
fi

if [ -n "$MODULES_DIR" ]; then
  DOCKER_CMD+=" -v $(realpath "$MODULES_DIR"):/modules:ro"
fi

if [ -n "$EXTRA_ARGS" ]; then
  DOCKER_CMD+=" $EXTRA_ARGS"
fi

DOCKER_CMD+=" $IMAGE_NAME"

# --- Run ---
echo "🚀 Running: $DOCKER_CMD"
eval "$DOCKER_CMD"

# --- Health check ---
echo "🩺 Checking container status..."
sleep 3
if docker ps --format '{{.Names}}' | grep -qx "$APP_NAME"; then
  echo "✅ $APP_NAME is running."
  echo "   Logs:    docker logs -f $APP_NAME"
  if [ -n "$PUBLISH_SPEC" ]; then
    echo "   Visit:   http://localhost:${PUBLISH_SPEC%%:*} (or whatever host you bound)"
  else
    echo "   Reachable on Docker network '$NETWORK_NAME' as: $APP_NAME:$CONTAINER_PORT"
  fi
else
  echo "❌ Container failed to start. Run: docker logs $APP_NAME" >&2
  exit 1
fi

echo "🎉 Deploy complete."
