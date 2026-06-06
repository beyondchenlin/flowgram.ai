param(
    [switch]$AllowBaselineBranch,
    [switch]$AllowDevBranch,
    [switch]$AllowRiskyFiles,
    [string]$CommitMessageFile,
    [string]$BaselineBranch = 'main',
    [string]$TaskPrefix = 'codex'
)

$ErrorActionPreference = 'Continue'
$failed = $false

function Fail($message) {
    Write-Host "[FAIL] $message" -ForegroundColor Red
    $script:failed = $true
}

function Pass($message) {
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Cyan
}

function Get-AgentConfigValue($path, $key, $defaultValue) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        return $defaultValue
    }

    $lines = Get-Content -LiteralPath $path -Encoding UTF8
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq '' -or $trimmed.StartsWith('#') -or $trimmed -notmatch '=') {
            continue
        }

        $parts = $trimmed -split '=', 2
        if ($parts[0].Trim() -eq $key) {
            return $parts[1].Trim()
        }
    }

    return $defaultValue
}

function Test-Enabled($value) {
    return ($value -in @('1', 'true', 'yes', 'on'))
}

function Test-TrackedOrStaged($path) {
    & git ls-files --error-unmatch $path *> $null
    if ($LASTEXITCODE -eq 0) {
        return $true
    }

    $staged = GitLines @('diff', '--cached', '--name-only', '--', $path)
    return ($staged.Count -gt 0)
}

function Test-AgentDoc($path, $required) {
    if (-not (Test-Enabled $required)) {
        return
    }

    if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $path) -PathType Leaf)) {
        Fail "缺少 $path。请运行 agent-operating-system bootstrap，或安装 agent 标准 hook。"
    } elseif (-not (Test-TrackedOrStaged $path)) {
        Fail "$path 已存在，但未被 Git 跟踪或暂存。"
    } else {
        Pass "$path 存在"
    }
}

function GitLines($arguments) {
    $output = & git @arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw ($output -join [Environment]::NewLine)
    }
    return @($output | Where-Object { $_ -ne $null -and $_ -ne '' })
}

$repoRoot = (& git rev-parse --show-toplevel 2>$null)
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($repoRoot)) {
    throw '当前目录不在 Git 仓库中。'
}
Set-Location $repoRoot

$configFile = Join-Path $repoRoot '.oceans/agent-standards.conf'
$BaselineBranch = Get-AgentConfigValue $configFile 'baseline_branch' $BaselineBranch
$TaskPrefix = Get-AgentConfigValue $configFile 'task_prefix' $TaskPrefix
$requireAgents = Get-AgentConfigValue $configFile 'require_agents_md' '1'
$requireClaude = Get-AgentConfigValue $configFile 'require_claude_md' '0'
$commitMessagePolicy = Get-AgentConfigValue $configFile 'commit_message' 'conventional'

$gitDir = (& git rev-parse --git-dir).Trim()
$isMergeInProgress = Test-Path -LiteralPath (Join-Path $gitDir 'MERGE_HEAD')

Info "仓库：$repoRoot"

$branch = (& git branch --show-current).Trim()
if ([string]::IsNullOrWhiteSpace($branch)) {
    Fail '常规 agent 工作不允许处于 detached HEAD 状态。'
} elseif ($branch -eq $BaselineBranch -and -not ($AllowBaselineBranch -or $AllowDevBranch -or $isMergeInProgress)) {
    Fail "当前位于 $BaselineBranch。请使用 $TaskPrefix/<task-name> 分支，或在明确合并时传入 -AllowDevBranch。"
} elseif ($branch -ne $BaselineBranch -and $branch -notlike "$TaskPrefix/*") {
    Fail "分支 '$branch' 不符合预期。应为 $TaskPrefix/<task-name> 或 $BaselineBranch。"
} else {
    Pass "分支规则：$branch"
}

$stagedFiles = GitLines @('diff', '--cached', '--name-only', '--diff-filter=ACMRD')
if ($stagedFiles.Count -eq 0) {
    Info '没有暂存文件。将对工作区 diff 运行空白字符检查。'
} else {
    Pass "暂存文件数量：$($stagedFiles.Count)"
}

$diffCheckArgs = if ($stagedFiles.Count -gt 0) { @('diff', '--check', '--cached') } else { @('diff', '--check') }
$diffCheck = & git @diffCheckArgs 2>&1
if ($LASTEXITCODE -ne 0) {
    Fail "git diff --check 失败：`n$($diffCheck -join [Environment]::NewLine)"
} else {
    Pass 'git diff --check'
}

$riskyPatterns = @(
    '(^|/)\.env($|[./])',
    '\.(pem|key|p12|pfx)$',
    '\.(zip|7z|rar)$',
    '(^|/)data/cache/',
    '(^|/)data/template/',
    '(^|/)data/attachment/',
    '\.log$'
)

if ($stagedFiles.Count -gt 0 -and -not $AllowRiskyFiles) {
    $risky = @()
    foreach ($file in $stagedFiles) {
        $normalized = $file -replace '\\', '/'
        foreach ($pattern in $riskyPatterns) {
            if ($normalized -match $pattern) {
                $risky += $file
                break
            }
        }
    }
    if ($risky.Count -gt 0) {
        Fail "高风险暂存文件需要明确审查：`n$($risky -join [Environment]::NewLine)"
    } else {
        Pass '没有高风险暂存文件'
    }
}

Test-AgentDoc 'AGENTS.md' $requireAgents
Test-AgentDoc 'CLAUDE.md' $requireClaude

$phpFiles = @()
if ($stagedFiles.Count -gt 0) {
    $phpFiles = $stagedFiles | Where-Object {
        $_ -match '\.php$' -and (Test-Path -LiteralPath $_ -PathType Leaf)
    }
}

if ($phpFiles.Count -gt 0) {
    $php = Get-Command php -ErrorAction SilentlyContinue
    if (-not $php) {
        Fail '找不到 php 命令；无法对暂存 PHP 文件运行 php -l。'
    } else {
        foreach ($file in $phpFiles) {
            $lint = & php -l $file 2>&1
            if ($LASTEXITCODE -ne 0) {
                Fail "${file} 的 php -l 检查失败：`n$($lint -join [Environment]::NewLine)"
            }
        }
        if (-not $failed) {
            Pass "php -l 已检查 $($phpFiles.Count) 个文件"
        }
    }
} else {
    Info '没有需要 lint 的暂存 PHP 文件。'
}

if ($CommitMessageFile -and $commitMessagePolicy -notin @('off', 'none')) {
    if (-not (Test-Path -LiteralPath $CommitMessageFile -PathType Leaf)) {
        Fail "找不到提交说明文件：$CommitMessageFile"
    } else {
        $firstLine = (Get-Content -LiteralPath $CommitMessageFile -Encoding UTF8 | Select-Object -First 1)
        if ($firstLine -notmatch '^(feat|fix|docs|style|refactor|perf|test|chore)(\([A-Za-z0-9._-]+\))?: .+') {
            Fail "提交说明必须使用 '<type>: <title>' 或 '<type>(scope): <title>'。当前为：$firstLine"
        } else {
            Pass '提交说明格式'
        }
    }
}

if ($failed) {
    exit 1
}

Pass 'agent 验证通过'
