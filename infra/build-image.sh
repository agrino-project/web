#!/bin/bash
# ===========================================
# Agrino Web - Build & Publish Script
# Description: Builds the agrino/web Docker image with optional push or save to tar
#
# Examples:
#
# Build only (default):
#   ./infra/build-image.sh
#   ./infra/build-image.sh -t v1.0.0
#
# Build and save to tar file (primary use case):
#   ./infra/build-image.sh -o ./images/agrino-web-$(date +%Y%m%d).tar
#   ./infra/build-image.sh -t v1.0.0 -o ./images/agrino-web-v1.0.0.tar
#
# Build and push to registry:
#   ./infra/build-image.sh --push
#   ./infra/build-image.sh -t v1.0.0 -P
#
# With custom branch (auto-suffixes image name):
#   ./infra/build-image.sh -b develop --push
#   → Creates: agrino/web-develop:develop
#
# Pass an env file (forwarded as --build-arg KEY=VALUE):
#   ./infra/build-image.sh -e infra/.env.production
#
# Skip git pull / disable cache:
#   ./infra/build-image.sh -s -n
#
# Override image / Dockerfile manually:
#   ./infra/build-image.sh -f Dockerfile -i myrepo/myimage -t latest --push
# ===========================================

set -euo pipefail

# --- Configuration ---
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)
readonly LOG_DIR="${SCRIPT_DIR}/logs"
readonly LOG_FILE="${LOG_DIR}/build_${TIMESTAMP}.log"
readonly DEFAULT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)"
readonly DEFAULT_DOCKERFILE="Dockerfile"
readonly DEFAULT_IMAGE_NAME="agrino/web"
readonly DEFAULT_TAG="latest"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# --- Logging ---
log()         { echo -e "${BLUE}[$(date +'%F %T')]${NC} $*" | tee -a "$LOG_FILE"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG_FILE"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $*" | tee -a "$LOG_FILE"; exit 1; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $*" | tee -a "$LOG_FILE"; }

# --- Help ---
show_help() {
    cat <<EOF
Usage: $0 [OPTIONS]

Build the agrino/web Docker image (and optionally push or save to a tar file).

Options:
  -h, --help               Show this help
  -b, --branch BRANCH      Git branch to pull (default: $DEFAULT_BRANCH)
  -t, --tag TAG            Docker image tag (default: $DEFAULT_TAG)
  -f, --dockerfile FILE    Path to Dockerfile (default: $DEFAULT_DOCKERFILE)
  -i, --image IMAGE        Image name (default: $DEFAULT_IMAGE_NAME)
  -e, --env-file FILE      Optional .env file; each KEY=VAL is forwarded as --build-arg
  -P, --push               Push image to registry after build
  -o, --output FILE        Save image to tar file after build
  -s, --skip-git           Skip git pull
  -n, --no-cache           Build without Docker cache
  -c, --clean              Run docker cleanup before building (if infra/docker-cleanup.sh exists)
  -d, --dry-run            Show actions without executing

Examples:
  $0                                          # Build only
  $0 -o ./images/agrino-web.tar               # Build and save to tar
  $0 -t v1.0.0 --push                         # Build and push with tag
  $0 -b develop -P                            # Build develop branch and push
EOF
    exit 0
}

# --- Defaults ---
GIT_BRANCH=$DEFAULT_BRANCH
IMAGE_NAME=""
IMAGE_TAG=$DEFAULT_TAG
DOCKERFILE=$DEFAULT_DOCKERFILE
ENV_FILE=""
OUTPUT_FILE=""
SKIP_GIT=false
NO_CACHE=false
PUSH_IMAGE=false
DRY_RUN=false
CLEANUP=false

# --- Parse arguments ---
parse_args() {
    local branch_was_set=false
    local image_was_set=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)        show_help ;;
            -b|--branch)      GIT_BRANCH="$2"; branch_was_set=true; shift 2 ;;
            -t|--tag)         IMAGE_TAG="$2"; shift 2 ;;
            -f|--dockerfile)  DOCKERFILE="$2"; shift 2 ;;
            -i|--image)       IMAGE_NAME="$2"; image_was_set=true; shift 2 ;;
            -e|--env-file)    ENV_FILE="$2"; shift 2 ;;
            -P|--push)        PUSH_IMAGE=true; shift ;;
            -o|--output)      OUTPUT_FILE="$2"; shift 2 ;;
            -s|--skip-git)    SKIP_GIT=true; shift ;;
            -n|--no-cache)    NO_CACHE=true; shift ;;
            -c|--clean)       CLEANUP=true; shift ;;
            -d|--dry-run)     DRY_RUN=true; shift ;;
            *)                log_error "Unknown argument: $1 (use -h for help)" ;;
        esac
    done

    if [ -z "$IMAGE_NAME" ]; then
        IMAGE_NAME=$DEFAULT_IMAGE_NAME
    fi

    # Auto-suffix image name when a non-default branch is explicitly passed
    if [ "$branch_was_set" = true ] && [ "$image_was_set" = false ]; then
        local sanitized_branch
        sanitized_branch=$(echo "$GIT_BRANCH" | tr '/' '-' | tr '[:upper:]' '[:lower:]')

        if [ "$GIT_BRANCH" != "$DEFAULT_BRANCH" ]; then
            IMAGE_NAME="${IMAGE_NAME}-${sanitized_branch}"
            log "Detected non-default branch: ${GIT_BRANCH}"
            log "Auto-adjusted image name: ${IMAGE_NAME}"
        fi
    fi
}

# --- Load environment variables (optional) ---
load_env() {
    [ -z "$ENV_FILE" ] && return 0

    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file not found: $ENV_FILE"
    fi

    log "Loading environment variables from $ENV_FILE..."
    log "Preview of .env file contents:"
    grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | tee -a "$LOG_FILE" || true

    set -a
    while IFS= read -r line || [ -n "$line" ]; do
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        if [[ "$line" == *"="* ]]; then
            local key="${line%%=*}"
            local value="${line#*=}"
            if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
                if [[ "$value" == \"*\" ]]; then
                    value="${value:1:${#value}-2}"
                fi
                export "${key}=${value}"
            fi
        fi
    done < "$ENV_FILE"
    set +a

    log_success "Environment file loaded."
}

# --- Cleanup Docker resources ---
run_cleanup() {
    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would run docker cleanup"
        return
    fi

    local cleanup_script="${SCRIPT_DIR}/docker-cleanup.sh"
    if [ -f "$cleanup_script" ]; then
        log "Running Docker cleanup..."
        bash "$cleanup_script" | tee -a "$LOG_FILE"
        log_success "Cleanup completed"
    else
        log_warn "Cleanup script not found at $cleanup_script, skipping"
    fi
}

# --- Git operations ---
update_git() {
    if [ "$SKIP_GIT" = true ]; then
        log "Skipping git pull."
        return
    fi

    local current_branch
    current_branch=$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD)

    # Only switch branches if the user explicitly asked for a different one.
    # Building on the wrong branch silently is worse than skipping the pull.
    if [ "$current_branch" != "$GIT_BRANCH" ]; then
        log_warn "Current branch ($current_branch) != requested ($GIT_BRANCH). Skipping checkout to avoid losing local state — pass -s to silence, or check out '$GIT_BRANCH' manually."
        return
    fi

    if ! git -C "$PROJECT_ROOT" diff --quiet || ! git -C "$PROJECT_ROOT" diff --cached --quiet; then
        log_warn "Working tree has uncommitted changes — skipping git pull."
        return
    fi

    log "Pulling latest changes from branch: $GIT_BRANCH"
    git -C "$PROJECT_ROOT" pull --ff-only origin "$GIT_BRANCH" || log_warn "git pull failed (non-fatal); building from current HEAD"
    log_success "Building from $(git -C "$PROJECT_ROOT" rev-parse --short HEAD)"
}

# --- Build image ---
build_image() {
    if [ ! -f "$PROJECT_ROOT/$DOCKERFILE" ]; then
        log_error "Dockerfile not found: $PROJECT_ROOT/$DOCKERFILE"
    fi

    log "Building image from $DOCKERFILE"

    local build_cmd="docker build -f $DOCKERFILE -t $IMAGE_NAME:$IMAGE_TAG"

    # If an env file was provided, forward each entry as --build-arg
    if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
        log "Forwarding env entries as --build-arg from: $ENV_FILE"
        while IFS= read -r line || [ -n "$line" ]; do
            [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
            if [[ "$line" == *"="* ]]; then
                local key="${line%%=*}"
                local value="${line#*=}"
                if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
                    if [[ "$value" == \"*\" ]]; then
                        value="${value:1:${#value}-2}"
                    fi
                    build_cmd+=" --build-arg ${key}=\"${value}\""
                fi
            fi
        done < "$ENV_FILE"
    fi

    if [ "$NO_CACHE" = true ]; then
        build_cmd+=" --no-cache"
    fi

    build_cmd+=" ."

    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would run: $build_cmd"
        return
    fi

    log "Running Docker build command:"
    echo "$build_cmd" | tee -a "$LOG_FILE"

    (cd "$PROJECT_ROOT" && eval "$build_cmd") | tee -a "$LOG_FILE"

    log_success "Image built: $IMAGE_NAME:$IMAGE_TAG"
}

# --- Push image ---
push_image() {
    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would push image: $IMAGE_NAME:$IMAGE_TAG"
        return
    fi

    log "Pushing image to registry..."
    docker push "$IMAGE_NAME:$IMAGE_TAG" | tee -a "$LOG_FILE"
    log_success "Image pushed."
}

# --- Save image to file ---
save_image() {
    if [ "$DRY_RUN" = true ]; then
        log "[DRY-RUN] Would save image to: $OUTPUT_FILE"
        return
    fi

    local output_dir
    output_dir=$(dirname "$OUTPUT_FILE")
    mkdir -p "$output_dir"

    log "Saving image to file: $OUTPUT_FILE"
    docker save "$IMAGE_NAME:$IMAGE_TAG" -o "$OUTPUT_FILE"

    local file_size
    file_size=$(du -h "$OUTPUT_FILE" | cut -f1)
    log_success "Image saved. Size: $file_size"
    log "To load: docker load -i $OUTPUT_FILE"
}

# --- Main ---
main() {
    mkdir -p "$LOG_DIR"
    log "=== Agrino Web Build Script Started ==="
    parse_args "$@"
    log "Image:      $IMAGE_NAME:$IMAGE_TAG"
    log "Dockerfile: $DOCKERFILE"
    log "Branch:     $GIT_BRANCH"
    [ -n "$ENV_FILE" ]    && log "Env file:   $ENV_FILE"
    [ -n "$OUTPUT_FILE" ] && log "Output:     $OUTPUT_FILE"

    if [ "$CLEANUP" = true ]; then
        run_cleanup
    fi

    load_env
    update_git
    build_image

    if [ -n "$OUTPUT_FILE" ]; then
        save_image
    elif [ "$PUSH_IMAGE" = true ]; then
        push_image
    else
        log "Build only completed (no push/save requested)"
    fi

    log_success "Build completed successfully."
    log "Image: $IMAGE_NAME:$IMAGE_TAG"
    [ -n "$OUTPUT_FILE" ] && log "Saved to: $OUTPUT_FILE"
    [ "$PUSH_IMAGE" = true ] && log "Pushed to registry"
    log "Log file: $LOG_FILE"
}

main "$@"
