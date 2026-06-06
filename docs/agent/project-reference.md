# 项目参考

本文件是非常驻的项目参考层。长链接、目录地图、API 说明和领域背景放在这里，不要塞进 `AGENTS.md` 常驻上下文。

## 项目路径

```text
/Users/wangyanxiang/Documents/code/flowgram
```

重要源码、测试和工具路径：

```text
packages/canvas-engine/*      画布、文档、渲染器、自由布局和固定布局核心
packages/node-engine/*        节点数据、节点表单和表单核心
packages/variable-engine/*    变量作用域、JSON Schema 和类型推导
packages/runtime/*            工作流运行时接口、浏览器执行器和 Node.js 执行器
packages/client/*             高层 React 编辑器组件
packages/plugins/*            历史、拖拽、吸附、缩略图、分组、布局等编辑器插件
packages/materials/*          节点物料、表单物料和编辑器物料
packages/common/*             工具、命令、历史、响应式状态、存储和 i18n
apps/docs                     文档站点
apps/demo-*                   示例应用
apps/create-app               脚手架应用
apps/cli                      CLI 应用
e2e/*                         Playwright E2E 测试套件
config/eslint-config          共享 ESLint 配置
config/ts-config              共享 TypeScript 配置
common/config/rush            Rush 配置
common/git-hooks              Rush Git hooks
common/autoinstallers         Rush 自安装工具
```

## 文档

- `README.md`：英文项目介绍。
- `README_ZH.md`：中文项目介绍。
- `CONTRIBUTING.md`：贡献流程、环境和提交格式。
- `apps/docs/src/en`：英文文档内容。
- `apps/docs/src/zh`：中文文档内容。
- `.github/workflows/ci.yml`：主 CI 流程。
- `.github/workflows/e2e.yml`：E2E 流程。
- `docs/plugin-marketplace-proposal.md`：本地已有插件市场方案文档。

## 生成或风险路径

- `common/temp/`：Rush 临时依赖和构建状态，不作为业务源码修改。
- `common/config/rush/pnpm-lock.yaml`：Rush 管理的锁文件，依赖变化后由 Rush 更新。
- `e2e/*/tests/**/__screenshots__` 或同类截图目录：Playwright 截图变更必须与 UI 预期变化对应。
- `.env*`、私钥、凭证、日志、压缩包、本地缓存和机器专属配置不得提交。

## FlowGram 开发要点

- 依赖注入使用 Inversify，优先沿用已有 container module 和 service 注册方式。
- 编辑器能力通过 plugin 体系扩展，新增能力优先落到最接近的既有 plugin、client 或 engine package。
- 命令体系来自 `@flowgram.ai/command`，涉及撤销/重做或编辑器级动作时先查现有 command registry 模式。
- 响应式状态来自 `@flowgram.ai/reactive`，React 侧优先沿用 `useReactiveState`、`useReadonlyReactiveState`、`useObserve` 等既有 hook。
- 公共 API 变更需要同步检查对应 package 的 `src/index.ts` barrel export 和 `apps/docs` 文档。
