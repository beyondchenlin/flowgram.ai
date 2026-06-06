#!/bin/sh
set -eu

SKIP_VERIFY=0

usage() {
  cat <<EOF
用法：agent-bootstrap.sh [--skip-verify]

启用本仓库的 agent hooks，并在默认情况下运行一次 agent 验证。
macOS/Linux 默认使用本脚本；Windows 或已安装 PowerShell Core 时也可使用 scripts/agent-bootstrap.ps1。
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --skip-verify)
      SKIP_VERIFY=1
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

pass() {
  printf '[OK] %s\n' "$*"
}

info() {
  printf '[INFO] %s\n' "$*"
}

fail() {
  printf '[FAIL] %s\n' "$*" >&2
  exit 1
}

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [ -z "$repo_root" ]; then
  fail '当前目录不在 Git 仓库中。'
fi

cd "$repo_root"

[ -d .githooks ] || fail "找不到 hooks 目录：$repo_root/.githooks"
[ -f .githooks/pre-commit ] || fail "找不到 pre-commit hook：$repo_root/.githooks/pre-commit"
[ -f .githooks/commit-msg ] || fail "找不到 commit-msg hook：$repo_root/.githooks/commit-msg"
[ -f scripts/agent-verify.sh ] || fail "找不到 agent 验证脚本：$repo_root/scripts/agent-verify.sh"
[ -f scripts/agent-standards-hook.sh ] || fail "找不到 agent 标准 hook 脚本：$repo_root/scripts/agent-standards-hook.sh"
[ -f scripts/dedupe-agent-docs.sh ] || fail "找不到 agent 文档去重脚本：$repo_root/scripts/dedupe-agent-docs.sh"

info "仓库：$repo_root"

git config core.hooksPath .githooks || fail '配置 core.hooksPath 失败。'
hooks_path=$(git config --get core.hooksPath || true)
if [ "$hooks_path" != ".githooks" ]; then
  fail "bootstrap 后 core.hooksPath 不符合预期：$hooks_path"
fi

pass 'Git hooks 路径已配置：.githooks'

if [ "$SKIP_VERIFY" -ne 1 ]; then
  sh scripts/agent-verify.sh --allow-dev-branch
fi

pass 'agent bootstrap 已完成'
