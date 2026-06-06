/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

export type DemoLocale = 'zh-CN' | 'en-US';

export const DEMO_DEFAULT_LOCALE: DemoLocale = 'zh-CN';

const zhCNContents = {
  Start: '开始',
  End: '结束',
  Agent: '智能体',
  LLM: '大模型',
  'Debug Output': '调试输出',
  Memory: '记忆',
  Tool: '工具',
  Tools: '工具',
  'Tool{{index}}': '工具{{index}}',
  'Tool_{{index}}': '工具_{{index}}',
  'Agent_{{index}}': '智能体_{{index}}',
  'LLM_{{index}}': '大模型_{{index}}',
  'Debug Output_{{index}}': '调试输出_{{index}}',
  'Memory_{{index}}': '记忆_{{index}}',
  Switch: '分支选择',
  Loop: '循环',
  If: '条件判断',
  'True Branch': '满足条件',
  'False Branch': '不满足条件',
  BreakLoop: '跳出循环',
  TryCatch: '异常捕获',
  'Case_{{index}}': '分支_{{index}}',
  'Default Branch': '默认分支',
  'Catch Block {{index}}': '捕获分支 {{index}}',
  'Global Variable': '全局变量',
  'Variable List': '变量列表',
  'Global Variable Editor': '全局变量编辑',
  'Open/close variable panel': '打开/关闭变量面板',
  'Title is required': '标题不能为空',
  '{{name}} is required': '{{name}} 不能为空',
  'Workflow start node, used to set the information required to start the workflow.':
    '工作流的开始节点，用于设置启动工作流所需的信息。',
  'Workflow end node, used to return the result information after the workflow runs.':
    '工作流的结束节点，用于返回工作流运行后的结果信息。',
  'Connect multiple downstream branches and execute only the matched branch.':
    '连接多个下游分支，满足条件时只执行对应分支。',
  'Execute only the matched branch when the condition is met.': '满足条件时只执行对应分支。',
  'Call the large language model and use variables and prompts to generate responses.':
    '调用大语言模型，结合变量和提示词生成回复。',
  'Pass upstream values through unchanged and display runtime outputs for debugging.':
    '透传上游值，并展示运行时输出，方便调试。',
  'Repeat a group of tasks by setting loop counts and logic.':
    '通过设置循环次数和逻辑，重复执行一组任务。',
  'Catch and handle errors.': '捕获并处理异常。',
  'Execute this branch when the condition is met.': '条件满足时执行该分支。',
  'Execute this catch branch when the condition is met.': '满足条件时执行该异常捕获分支。',
  'Default branch of the switch.': '分支选择的默认分支',
  'Break out of the current loop.': '跳出当前循环。',
  'AI agent.': 'AI 智能体。',
  'Agent LLM.': '智能体大模型。',
  'Agent Memory.': '智能体记忆。',
  'Agent Tools.': '智能体工具。',
  'Memory.': '记忆。',
  'Tool.': '工具。',
  'Loop End': '循环结束',
  'Try Start': '异常捕获开始',
  'Try End': '异常捕获结束',
  'Catch Error': '捕获错误',
  Drag: '拖拽',
  Collapse: '折叠',
  Expand: '展开',
  Group: '分组',
  Ungroup: '取消分组',
  Copy: '复制',
  Delete: '删除',
  Paste: '粘贴',
  Add: '添加',
  True: '真',
  False: '假',
  'Edit Title': '编辑标题',
  'Auto Layout': '自动布局',
  Download: '下载',
  FitView: '适应视图',
  Minimap: '缩略图',
  Readonly: '只读',
  Editable: '可编辑',
  Undo: '撤销',
  Redo: '重做',
  Save: '保存',
  Saved: '已保存',
  'Save failed': '保存失败',
  'Please fix validation errors before saving': '请先修复校验错误再保存',
  Run: '运行',
  'Vertical Layout': '纵向布局',
  'Horizontal Layout': '横向布局',
  'Mouse-Friendly': '鼠标模式',
  'Touchpad-Friendly': '触控板模式',
  'Interaction mode': '交互模式',
  'Drag the canvas with the left mouse button, zoom with the scroll wheel.':
    '按住鼠标左键拖动画布，滚动滚轮缩放。',
  'Drag with two fingers moving in the same direction, zoom by pinching or spreading two fingers.':
    '双指同向滑动拖动画布，双指捏合或张开缩放。',
  Zoomin: '放大',
  Zoomout: '缩小',
  'Copied. You can move to any [+] to paste.': '已复制，可移动到任意 [+] 位置粘贴。',
  'Download {{format}} successfully': '{{format}} 下载成功',
  'Import {{file}} successfully': '{{file}} 导入成功',
  modelName: '模型名称',
  modelType: '模型类型',
  apiKey: 'API 密钥',
  apiHost: 'API 地址',
  temperature: '温度',
  systemPrompt: '系统提示词',
  prompt: '用户提示词',
  condition: '条件',
  input: '输入',
  success: '是否成功',
  query: '查询内容',
  loopFor: '循环对象',
  enable: '启用',
  array_obj: '数组对象',
  int: '整数',
  str: '字符串',
  result: '结果',
};

const enUSContents = Object.fromEntries(
  Object.keys(zhCNContents).map((key) => [key, key])
) as Record<keyof typeof zhCNContents, string>;

const nodePanelLabelKeys: Record<string, keyof typeof zhCNContents> = {
  start: 'Start',
  end: 'End',
  switch: 'Switch',
  llm: 'LLM',
  'debug-output': 'Debug Output',
  loop: 'Loop',
  tryCatch: 'TryCatch',
  if: 'If',
  breakLoop: 'BreakLoop',
  agent: 'Agent',
  tool: 'Tool',
};

export function getNodePanelLabelKey(nodeType: string): string {
  return nodePanelLabelKeys[nodeType] ?? nodeType;
}

export const demoI18nLanguages = {
  'en-US': enUSContents,
  'zh-CN': zhCNContents,
} satisfies Record<DemoLocale, Record<string, string>>;

export const demoI18nLanguageList = (Object.keys(demoI18nLanguages) as DemoLocale[]).map(
  (languageId) => ({
    languageId,
    contents: demoI18nLanguages[languageId],
  })
);

export function normalizeDemoLocale(locale?: string | null): DemoLocale {
  const normalizedLocale = locale?.toLowerCase();
  if (normalizedLocale?.startsWith('en')) {
    return 'en-US';
  }
  if (normalizedLocale?.startsWith('zh')) {
    return 'zh-CN';
  }
  return DEMO_DEFAULT_LOCALE;
}

export function getDemoLocale(): DemoLocale {
  if (typeof window !== 'object') {
    return DEMO_DEFAULT_LOCALE;
  }

  const queryLocale = new URLSearchParams(window.location.search).get('locale');
  if (queryLocale) {
    return normalizeDemoLocale(queryLocale);
  }

  try {
    const cachedLocale = window.localStorage.getItem('flowgram-demo-locale');
    if (cachedLocale) {
      return normalizeDemoLocale(cachedLocale);
    }
  } catch {
    return DEMO_DEFAULT_LOCALE;
  }

  return DEMO_DEFAULT_LOCALE;
}
