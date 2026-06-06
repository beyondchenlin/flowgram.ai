#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd "$SCRIPT_DIR/.." && pwd)
TMP_BASE=${TMPDIR:-/tmp}
LOG_DIR=${FLOWGRAM_DEMO_LOG_DIR:-${TMP_BASE%/}/flowgram-dev-logs}
NODE_BIN_DIR=${FLOWGRAM_NODE_BIN_DIR:-}

if [ -n "$NODE_BIN_DIR" ]; then
  PATH=$NODE_BIN_DIR:$PATH
  export PATH
fi

usage() {
  cat <<EOF
Usage: scripts/start-local-demos.sh [start|stop|restart|status]

Starts the local FlowGram demo servers in detached screen sessions:
  3001  apps/demo-fixed-layout
  3002  apps/demo-playground
  3003  apps/demo-free-layout

Environment:
  FLOWGRAM_DEMO_LOG_DIR   Log directory. Default: \${TMPDIR:-/tmp}/flowgram-dev-logs
  FLOWGRAM_NODE_BIN_DIR   Optional Node.js bin directory prepended to PATH.
EOF
}

ensure_screen() {
  if ! command -v screen >/dev/null 2>&1; then
    echo "screen is required to keep dev servers running in the background." >&2
    exit 1
  fi
}

ensure_app_ready() {
  app_dir=$1
  if [ ! -x "$app_dir/node_modules/.bin/rsbuild" ]; then
    cat >&2 <<EOF
Missing rsbuild for $app_dir.
Run this first from the repository root:
  node common/scripts/install-run-rush.js install
EOF
    exit 1
  fi
}

start_demo() {
  session=$1
  app_path=$2
  port=$3
  app_dir=$REPO_ROOT/$app_path
  log_file=$LOG_DIR/$port-$(basename "$app_path").log

  ensure_app_ready "$app_dir"
  mkdir -p "$LOG_DIR"
  screen -S "$session" -X quit >/dev/null 2>&1 || true
  screen -dmS "$session" sh -lc \
    'log_file=$1; app_dir=$2; shift 2; cd "$app_dir" && exec "$@" >> "$log_file" 2>&1' sh \
    "$log_file" "$app_dir" env MODE=app NODE_ENV=development node_modules/.bin/rsbuild dev --host 0.0.0.0 --port "$port"
  printf '[OK] %s -> http://localhost:%s/ (log: %s)\n' "$app_path" "$port" "$log_file"
}

stop_demo() {
  session=$1
  if screen -S "$session" -X quit >/dev/null 2>&1; then
    printf '[OK] stopped %s\n' "$session"
  else
    printf '[INFO] %s was not running\n' "$session"
  fi
}

status_demo() {
  session=$1
  port=$2
  if screen -ls | grep -F ".$session" >/dev/null 2>&1; then
    printf '[OK] %s screen session is running\n' "$session"
  else
    printf '[INFO] %s screen session is not running\n' "$session"
  fi

  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    printf '[OK] port %s is listening\n' "$port"
  else
    printf '[INFO] port %s is not listening\n' "$port"
  fi
}

start_all() {
  ensure_screen
  start_demo flowgram-3001 apps/demo-fixed-layout 3001
  start_demo flowgram-3002 apps/demo-playground 3002
  start_demo flowgram-3003 apps/demo-free-layout 3003
}

stop_all() {
  ensure_screen
  stop_demo flowgram-3001
  stop_demo flowgram-3002
  stop_demo flowgram-3003
}

status_all() {
  ensure_screen
  status_demo flowgram-3001 3001
  status_demo flowgram-3002 3002
  status_demo flowgram-3003 3003
  printf '[INFO] logs: %s\n' "$LOG_DIR"
}

case "${1:-start}" in
  start)
    start_all
    ;;
  stop)
    stop_all
    ;;
  restart)
    stop_all
    start_all
    ;;
  status)
    status_all
    ;;
  --help|-h|help)
    usage
    ;;
  *)
    echo "Unknown command: $1" >&2
    usage >&2
    exit 2
    ;;
esac
