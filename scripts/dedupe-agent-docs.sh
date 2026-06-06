#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd)
SKILL_DIR=$(CDPATH= cd "$SCRIPT_DIR/.." && pwd)
ASSETS_DIR=$SKILL_DIR/assets
PROJECT_ROOT=
GLOBAL_DOC=
APPLY=0

usage() {
  cat <<EOF
用法：dedupe-agent-docs.sh [--project <repo>] [--global <file>] [--apply]

报告全局或模板 agent 文档与项目 AGENTS.md / CLAUDE.md 之间的重复条目。
默认只报告不修改；--apply 目前保留且拒绝执行，避免盲目删除规则。
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --project)
      [ "$#" -ge 2 ] || { echo '--project 需要一个路径。' >&2; exit 2; }
      PROJECT_ROOT=$2
      shift 2
      ;;
    --global)
      [ "$#" -ge 2 ] || { echo '--global 需要一个文件。' >&2; exit 2; }
      GLOBAL_DOC=$2
      shift 2
      ;;
    --apply)
      APPLY=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "未知选项：$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [ "$APPLY" -eq 1 ]; then
  echo '--apply 有意不实现。请先查看报告，再手动编辑或让 Codex 协助编辑。' >&2
  exit 2
fi

if [ -z "$PROJECT_ROOT" ]; then
  PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
fi

PROJECT_ROOT=$(CDPATH= cd "$PROJECT_ROOT" && pwd)
DEFAULT_TEMPLATE=$ASSETS_DIR/AGENTS.template.md
if [ ! -f "$DEFAULT_TEMPLATE" ] && [ -f "$PROJECT_ROOT/.oceans/templates/AGENTS.template.md" ]; then
  DEFAULT_TEMPLATE=$PROJECT_ROOT/.oceans/templates/AGENTS.template.md
fi

if [ -z "$GLOBAL_DOC" ]; then
  if [ -n "${CODEX_HOME:-}" ] && [ -f "$CODEX_HOME/AGENTS.md" ]; then
    GLOBAL_DOC=$CODEX_HOME/AGENTS.md
  elif [ -f "$HOME/.codex/AGENTS.md" ]; then
    GLOBAL_DOC=$HOME/.codex/AGENTS.md
  else
    GLOBAL_DOC=$DEFAULT_TEMPLATE
  fi
fi

if [ ! -f "$GLOBAL_DOC" ]; then
  echo "找不到全局或模板文档：$GLOBAL_DOC" >&2
  exit 1
fi

tmp_global=$(mktemp "${TMPDIR:-/tmp}/oceans-global-rules.XXXXXX")
tmp_project=$(mktemp "${TMPDIR:-/tmp}/oceans-project-rules.XXXXXX")
trap 'rm -f "$tmp_global" "$tmp_project"' EXIT

extract_rules() {
  file=$1
  label=$2
  awk -v label="$label" '
    /^[[:space:]]*[-*][[:space:]]+/ {
      line = $0
      sub(/^[[:space:]]*[-*][[:space:]]+/, "", line)
      gsub(/`/, "", line)
      gsub(/[[:space:]]+/, " ", line)
      sub(/^[[:space:]]+/, "", line)
      sub(/[[:space:]]+$/, "", line)
      normalized = tolower(line)
      if (length(normalized) >= 20) {
        print normalized "\t" label "\t" line
      }
    }
  ' "$file"
}

extract_rules "$GLOBAL_DOC" "global:$GLOBAL_DOC" > "$tmp_global"

for doc in AGENTS.md CLAUDE.md; do
  if [ -f "$PROJECT_ROOT/$doc" ]; then
    extract_rules "$PROJECT_ROOT/$doc" "project:$doc" >> "$tmp_project"
  fi
done

echo "Agent 文档去重报告"
echo
echo "项目：$PROJECT_ROOT"
echo "全局或模板来源：$GLOBAL_DOC"
echo

if [ ! -s "$tmp_project" ]; then
  echo '没有找到项目 AGENTS.md 或 CLAUDE.md 的项目符号规则。'
  exit 0
fi

duplicates=$(awk -F '\t' '
  NR == FNR {
    global[$1] = $3
    next
  }
  $1 in global {
    print "- " $3 "\n  Project: " $2 "\n  Also in global/template: " global[$1]
  }
' "$tmp_global" "$tmp_project")

if [ -z "$duplicates" ]; then
  echo '没有找到完全重复的项目符号规则。'
  echo
  echo '注意：语义重复不会自动删除。需要判断式去重时，让 Codex 使用'
  echo '$agent-operating-system 做审查。'
  exit 0
fi

echo '完全重复的项目符号规则：'
printf '%s\n' "$duplicates"
echo
echo '建议：只有当项目文档中的规则没有增加命令、路径、范围、例外或更严格行为时，'
echo '才从项目文档中删除重复项。'
