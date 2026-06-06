/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

export type DemoLocale = 'zh-CN' | 'en-US';

export const DEMO_DEFAULT_LOCALE: DemoLocale = 'zh-CN';

const zhCNContents = {
  Start: '开始',
  End: '结束',
  Condition: '条件判断',
  LLM: '大模型',
  'HTTP Request': 'HTTP 请求',
  Loop: '循环',
  Code: '代码',
  Variable: '变量',
  Break: '中断',
  Continue: '继续',
  'Multi Condition': '多条件',
  'HTTP Request_{{index}}': 'HTTP 请求_{{index}}',
  'Loop_{{index}}': '循环_{{index}}',
  'LLM_{{index}}': '大模型_{{index}}',
  'Code_{{index}}': '代码_{{index}}',
  'Variable_{{index}}': '变量_{{index}}',
  'Break_{{index}}': '中断_{{index}}',
  'Continue_{{index}}': '继续_{{index}}',
  'Group_{{index}}': '分组_{{index}}',
  'Multi Condition_{{index}}': '多条件_{{index}}',
  'Global Variable': '全局变量',
  'Variable List': '变量列表',
  'Global Variable Editor': '全局变量编辑',
  'Open/close variable panel': '打开/关闭变量面板',
  'Title is required': '标题不能为空',
  'Condition is required': '条件不能为空',
  '{{name}} is required': '{{name}} 不能为空',
  'Workflow start node, used to set the information required to start the workflow.':
    '工作流的开始节点，用于设置启动工作流所需的信息。',
  'Workflow end node, used to return the result information after the workflow runs.':
    '工作流的结束节点，用于返回工作流运行后的结果信息。',
  'Connect multiple downstream branches and execute only the matched branch.':
    '连接多个下游分支，满足条件时只执行对应分支。',
  'Call the large language model and use variables and prompts to generate responses.':
    '调用大语言模型，结合变量和提示词生成回复。',
  'Call HTTP API': '调用 HTTP API',
  'Execute script code': '执行脚本代码',
  'Variable assignment and declaration': '变量赋值与声明',
  'Repeat a group of tasks by setting loop counts and logic.':
    '通过设置循环次数和逻辑，重复执行一组任务。',
  'Interrupt the current loop.': '中断当前循环。',
  'Skip the remaining steps of the current loop and continue the next loop.':
    '跳过当前循环剩余步骤，继续下一轮循环。',
  'Block start node.': '块的开始节点。',
  'Block end node.': '块的结束节点。',
  Collapse: '折叠',
  Expand: '展开',
  'Create Group': '创建分组',
  Group: '分组',
  Copy: '复制',
  Delete: '删除',
  'Edit Title': '编辑标题',
  'Move out': '移出容器',
  'Create Copy': '创建副本',
  'Auto Layout': '自动布局',
  Add: '添加',
  'Add Node': '添加节点',
  if: '如果',
  else: '否则',
  IF: '如果',
  'ELSE-IF': '否则如果',
  ELSE: '否则',
  AND: '且',
  OR: '或',
  'Add condition': '添加条件',
  'Remove branch': '删除分支',
  'Add branch': '添加分支',
  True: '真',
  False: '假',
  Problem: '问题',
  Ungroup: '取消分组',
  Paste: '粘贴',
  Download: '下载',
  FitView: '适应视图',
  Minimap: '缩略图',
  Readonly: '只读',
  Editable: '可编辑',
  Undo: '撤销',
  Redo: '重做',
  'Switch Line': '切换连线',
  Comment: '注释',
  Save: '保存',
  Run: '运行',
  'Test Run': '试运行',
  Cancel: '取消',
  Empty: '空',
  'Running...': '运行中...',
  'Input Form': '输入表单',
  'JSON Mode': 'JSON 模式',
  'Inputs Result': '输入结果',
  'Outputs Result': '输出结果',
  Inputs: '输入',
  Outputs: '输出',
  Branch: '分支',
  Data: '数据',
  'Total: {{count}}': '总数：{{count}}',
  'No inputs found in start node': '开始节点未找到输入',
  'Please input integer': '请输入整数',
  'Please input number': '请输入数字',
  'Please input text': '请输入文本',
  API: 'API',
  Body: '请求体',
  None: '无',
  'Raw Text': '原始文本',
  'Timeout(ms)': '超时(毫秒)',
  'Retry Times': '重试次数',
  "Input URL, use var by '{'": "输入 URL，可用 '{' 引用变量",
  "Input raw text, use var by '{'": "输入原始文本，可用 '{' 引用变量",
  loopFor: '循环对象',
  loopOutputs: '循环输出',
  Running: '运行中',
  'Run terminated': '运行已终止',
  Succeed: '成功',
  Failed: '失败',
  Cancelled: '已取消',
  'Mouse-Friendly': '鼠标模式',
  'Touchpad-Friendly': '触控板模式',
  'Interaction mode': '交互模式',
  'Drag the canvas with the left mouse button, zoom with the scroll wheel.':
    '按住鼠标左键拖动画布，滚动滚轮缩放。',
  'Drag with two fingers moving in the same direction, zoom by pinching or spreading two fingers.':
    '双指同向滑动拖动画布，双指捏合或张开缩放。',
  'Zoom in': '放大',
  'Zoom out': '缩小',
  'Zoom to 50%': '缩放到 50%',
  'Zoom to 100%': '缩放到 100%',
  'Zoom to 150%': '缩放到 150%',
  'Zoom to 200%': '缩放到 200%',
  'Download {{format}} successfully': '{{format}} 下载成功',
  'Never Remind': '不再提示',
  'Hold {{key}} to drag node out': '按住 {{key}} 可将节点拖出分组',
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
  params: '参数',
  enable: '启用',
  array_obj: '数组对象',
  int: '整数',
  str: '字符串',
  body: '响应体',
  headers: '请求头',
  statusCode: '状态码',
  result: '结果',
};

const enUSContents = Object.fromEntries(
  Object.keys(zhCNContents).map((key) => [key, key])
) as Record<keyof typeof zhCNContents, string>;

const nodePanelLabelKeys: Record<string, keyof typeof zhCNContents> = {
  start: 'Start',
  end: 'End',
  condition: 'Condition',
  llm: 'LLM',
  http: 'HTTP Request',
  loop: 'Loop',
  code: 'Code',
  variable: 'Variable',
  break: 'Break',
  continue: 'Continue',
  group: 'Group',
  comment: 'Comment',
  'multi-condition': 'Multi Condition',
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
