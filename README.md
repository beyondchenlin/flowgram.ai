![Image](https://github.com/user-attachments/assets/4f9dfa0e-e600-4d4e-9e73-c919184f7573)

<div align="center">

[![License](https://img.shields.io/github/license/bytedance/flowgram.ai)](https://github.com/bytedance/flowgram.ai/blob/main/LICENSE) [![@flowgram.ai/editor](https://img.shields.io/npm/dm/%40flowgram.ai%2Fcore)](https://www.npmjs.com/package/@flowgram.ai/editor) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/bytedance/flowgram.ai) [![juejin](https://img.shields.io/badge/juejin-FFFFFF?logo=juejin&logoColor=%23007FFF)](https://juejin.cn/column/7479814468601315362)

[![](https://trendshift.io/api/badge/repositories/13877)](https://trendshift.io/repositories/13877)

</div>

# FlowGram｜Workflow development framework

[English](README.md) | [中文](README_ZH.md) | [Español](README_ES.md) | [Русский](README_RU.md) | [Português](README_PT.md) | [Deutsch](README_DE.md) | [日本語](README_JA.md)

FlowGram is a composable, visual, easy-to-integrate, and extensible workflow development framework & toolkit.
Our goal is to help developers build AI workflow platforms **faster** and **simpler**.
FlowGram comes with a suite of built-in tools for workflow development: flow canvas, node configuration form, variable scope chain, and ready-to-use materials (LLM, Condition, Code Editor etc). It’s not a ready-made workflow platform; it’s the framework and toolkit to build yours.

Learn more at [FlowGram.AI 🌐](https://flowgram.ai)

## 🎬 Demo

<https://github.com/user-attachments/assets/fee87890-ceec-4c07-b659-08afc4dedc26>

Open in [CodeSandbox 🌐](https://codesandbox.io/p/github/louisyoungx/flowgram-demo/main) or [StackBlitz 🌐](https://stackblitz.com/~/github.com/louisyoungx/flowgram-demo)

In this demo, we iterate through a list of cities, fetch real-time weather via HTTP, parse temperatures with a Code node, generate outfit suggestions with an LLM, gate by a Condition, aggregate results across the loop, and finally use an Advisor LLM to pick the most comfortable city before sending the result to the End node.

## 🚀 Quick Start

1. Create a new FlowGram project:

```sh
npx @flowgram.ai/create-app@latest
```

> We recommend choosing the `Free Layout Demo ⭐️` template.

2. Start the project:

```sh
cd demo-free-layout
npm install
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🖥️ 本地二次开发启动（中文画布 + 局域网访问）

二次开发请启动 dev server，不要只用 `serve dist`。当前 fork 保留完整中文文档入口，同时把两种画布 demo 单独跑起来：

- `3001`：完整中文文档站
- `3002`：固定布局画布 demo
- `3003`：自由布局画布 demo

先准备环境：

```sh
cd /Users/wangyanxiang/Documents/code/flowgram
source ~/.nvm/nvm.sh
nvm use 22.19.0
node common/scripts/install-run-rush.js install
```

终端 1：监听并编译除 docs 以外的包。

```sh
cd /Users/wangyanxiang/Documents/code/flowgram
source ~/.nvm/nvm.sh
nvm use 22.19.0
node common/scripts/install-run-rush.js build:watch --to-except @flowgram.ai/docs
```

终端 2：启动完整中文文档站。

```sh
cd /Users/wangyanxiang/Documents/code/flowgram/apps/docs
source ~/.nvm/nvm.sh
nvm use 22.19.0
node ../../common/scripts/install-run-rushx.js dev --host 0.0.0.0 --port 3001
```

终端 3：启动固定布局画布。

```sh
cd /Users/wangyanxiang/Documents/code/flowgram/apps/demo-fixed-layout
source ~/.nvm/nvm.sh
nvm use 22.19.0
MODE=app NODE_ENV=development ./node_modules/.bin/rsbuild dev --host 0.0.0.0 --port 3002
```

终端 4：启动自由布局画布。

```sh
cd /Users/wangyanxiang/Documents/code/flowgram/apps/demo-free-layout
source ~/.nvm/nvm.sh
nvm use 22.19.0
MODE=app NODE_ENV=development ./node_modules/.bin/rsbuild dev --host 0.0.0.0 --port 3003
```

查看本机局域网 IP：

```sh
ipconfig getifaddr en0
```

如果输出为 `192.168.1.127`，同一局域网设备访问：

- `http://192.168.1.127:3001/`：完整中文文档站
- `http://192.168.1.127:3002/`：固定布局画布
- `http://192.168.1.127:3003/`：自由布局画布

如果端口被占用：

```sh
lsof -tiTCP:3001 -sTCP:LISTEN | xargs kill
lsof -tiTCP:3002 -sTCP:LISTEN | xargs kill
lsof -tiTCP:3003 -sTCP:LISTEN | xargs kill
```

### Demo i18n 规则

当前 demo 默认使用 `zh-CN`，也可以通过 URL 切英文，例如 `http://192.168.1.127:3003/?locale=en-US`。

新增节点名、节点说明、表单校验、工具栏和试运行面板文案不要再硬编码中文或英文，统一放到：

- `apps/demo-free-layout/src/i18n/demo-languages.ts`
- `apps/demo-fixed-layout/src/i18n/demo-languages.ts`

代码里使用英文 key：

```ts
import { t } from '../../i18n';

title: t('LLM_{{index}}', { index: 1 });
description: t('Call the large language model and use variables and prompts to generate responses.');
```

变量 key 如 `query`、`result`、`array_obj` 属于流程数据字段，不建议直接改成中文；需要中文展示时，在 i18n 语言包里给显示层加映射。

## ✨ Features

| Feature                                                                                      | Description                                                                                                                                                                                               | Demo                                                                                         |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [Free Layout Canvas](https://flowgram.ai/examples/free-layout/free-feature-overview.html)    | Free layout canvas where nodes can be placed anywhere and connected using free-form lines.                                                                                                                | ![Free Layout Demo](./apps/docs/src/public/free-layout/free-layout-demo.gif)                 |
| [Fixed Layout Canvas](https://flowgram.ai/examples/fixed-layout/fixed-feature-overview.html) | Fixed layout canvas where nodes can be dragged to specified positions, with support for compound nodes like branches and loops.                                                                           | ![Fixed Layout Demo](./apps/docs/src/public/fixed-layout/fixed-layout-demo.gif)              |
| [Form](https://flowgram.ai/examples/node-form/basic.html)                                    | The form engine manages the CRUD operations of node data and provides rendering, validation, side effects, linkage, and error-capturing capabilities, simplifying the development of node configurations. | ![Form](https://github.com/user-attachments/assets/13e9b4cd-e993-4d21-901c-fb6cf106de78)     |
| [Variable](https://flowgram.ai/guide/variable/basic.html)                                    | The variable engine supports scope constraints, variable structure inspection, and type inference, making it easy to manage data flow within the workflow.                                                | ![Variable](https://github.com/user-attachments/assets/442006db-25e3-4fb5-972c-7a0545638ff5) |


## 📖 Documentation

You can find the FlowGram documentation [on the website](https://flowgram.ai).

The documentation is divided into several sections:

- [Quick Start](https://flowgram.ai/guide/getting-started/introduction.html)
- [Canvas](https://flowgram.ai/guide/free-layout/load.html)
- [Form](https://flowgram.ai/guide/form/form.html)
- [Variable](https://flowgram.ai/guide/variable/basic.html)
- [Material](https://flowgram.ai/materials/introduction.html)
- [Runtime](https://flowgram.ai/guide/runtime/introduction.html)
- [Advanced Guides](https://flowgram.ai/guide/advanced/zoom-scroll.html)
- [API Reference](https://flowgram.ai/api/index.html)
- [Where to get Support](https://flowgram.ai/guide/contact-us.html)
- [Contributing Guide](https://flowgram.ai/guide/contributing.html)

## 🙌 Contributors

[![FlowGram.AI Contributors](https://contrib.rocks/image?repo=bytedance/flowgram.ai)](https://github.com/bytedance/flowgram.ai/graphs/contributors)

## 🌍 Adoption

- [Coze Studio](https://github.com/coze-dev/coze-studio) is an all-in-one AI agent development tool. Providing the latest large models and tools, various development modes and frameworks, Coze Studio offers the most convenient AI agent development environment, from development to deployment.
- [NNDeploy](https://github.com/NNDeploy/nndeploy) is a workflow-based multi-platform ai deployment tool.
- [Certimate](https://github.com/certimate-go/certimate)  is an open-source SSL certificate management tool that helps you automatically apply for and deploy SSL certificates with a visual workflow. It is one of the ACME client options listed in the official documentation of Let's Encrypt.

## 📬 Contact us

- Issues: [Issues](https://github.com/bytedance/flowgram.ai/issues)
- Lark: Scan the QR code below with [Register Feishu](https://www.feishu.cn/en/) to join our FlowGram user group.

<img src="./apps/docs/src/public/lark-group.png" width="200"/>
