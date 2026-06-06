param(
    [switch]$SkipVerify
)

$ErrorActionPreference = 'Stop'

function Pass($message) {
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Cyan
}

function Fail($message) {
    throw $message
}

$repoRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($repoRoot)) {
    Fail '当前目录不在 Git 仓库中。'
}

$repoRoot = $repoRoot.Trim()
Set-Location $repoRoot

$hooksDir = Join-Path $repoRoot '.githooks'
$preCommitHook = Join-Path $hooksDir 'pre-commit'
$commitMsgHook = Join-Path $hooksDir 'commit-msg'
$agentVerify = Join-Path $repoRoot 'scripts/agent-verify.ps1'
$agentStandardsHook = Join-Path $repoRoot 'scripts/agent-standards-hook.sh'
$dedupeAgentDocs = Join-Path $repoRoot 'scripts/dedupe-agent-docs.sh'

if (-not (Test-Path -LiteralPath $hooksDir -PathType Container)) {
    Fail "找不到 hooks 目录：$hooksDir"
}

if (-not (Test-Path -LiteralPath $preCommitHook -PathType Leaf)) {
    Fail "找不到 pre-commit hook：$preCommitHook"
}

if (-not (Test-Path -LiteralPath $commitMsgHook -PathType Leaf)) {
    Fail "找不到 commit-msg hook：$commitMsgHook"
}

if (-not (Test-Path -LiteralPath $agentVerify -PathType Leaf)) {
    Fail "找不到 agent 验证脚本：$agentVerify"
}

if (-not (Test-Path -LiteralPath $agentStandardsHook -PathType Leaf)) {
    Fail "找不到 agent 标准 hook 脚本：$agentStandardsHook"
}

if (-not (Test-Path -LiteralPath $dedupeAgentDocs -PathType Leaf)) {
    Fail "找不到 agent 文档去重脚本：$dedupeAgentDocs"
}

Info "仓库：$repoRoot"

& git config core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) {
    Fail '配置 core.hooksPath 失败。'
}

$hooksPath = (& git config --get core.hooksPath).Trim()
if ($hooksPath -ne '.githooks') {
    Fail "bootstrap 后 core.hooksPath 不符合预期：$hooksPath"
}

Pass 'Git hooks 路径已配置：.githooks'

if (-not $SkipVerify) {
    & $agentVerify -AllowDevBranch
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}

Pass 'agent bootstrap 已完成'
exit 0
