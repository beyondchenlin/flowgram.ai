# 分支工作流

## 基线

- 基线分支：`main`
- 任务分支前缀：`codex/`
- Worktree 目录：`.worktrees`

## 开始任务

```powershell
git switch main
git pull --ff-only origin main
git worktree add .worktrees/<task-name> -b codex/<task-name>
```

## 开发过程

- 一个 worktree 只服务一个变更意图。
- 只暂存当前任务拥有的文件。
- macOS/Linux 提交前运行 `scripts/agent-verify.sh`。
- Windows 或已安装 PowerShell Core 时，可运行 `scripts/agent-verify.ps1`。
- FlowGram 代码改动还应按范围运行对应 Rush 验证，例如 `rush build`、`rush lint`、`rush ts-check`、`rush test` 或包内 `rushx` 命令。

## 启用本地 hooks

macOS/Linux:

```sh
sh scripts/agent-bootstrap.sh
```

Windows 或已安装 PowerShell Core:

```powershell
pwsh -NoProfile -File scripts/agent-bootstrap.ps1
```

## 完成任务

```powershell
git add -- <task-files>
git commit -m "<type>: <title>"
git push -u origin codex/<task-name>
```

## 合并回基线

```powershell
git switch main
git pull --ff-only origin main
git merge --no-ff -m "chore: merge <task-name>" codex/<task-name>
git push origin main
```
