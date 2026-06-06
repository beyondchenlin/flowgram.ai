/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest';

import {
  DEMO_DEFAULT_LOCALE,
  demoI18nLanguages,
  getNodePanelLabelKey,
  normalizeDemoLocale,
} from '../src/i18n/demo-languages';

describe('demo fixed layout i18n languages', () => {
  it('defaults to Chinese for the local development demo', () => {
    expect(DEMO_DEFAULT_LOCALE).toBe('zh-CN');
    expect(normalizeDemoLocale()).toBe('zh-CN');
  });

  it('keeps English available as a switchable locale', () => {
    expect(normalizeDemoLocale('en')).toBe('en-US');
    expect(normalizeDemoLocale('en-US')).toBe('en-US');
  });

  it('contains Chinese translations for demo node labels', () => {
    expect(demoI18nLanguages['zh-CN'].Start).toBe('开始');
    expect(demoI18nLanguages['zh-CN'].Agent).toBe('智能体');
    expect(demoI18nLanguages['zh-CN']['Catch Block {{index}}']).toBe('捕获分支 {{index}}');
  });

  it('maps add-node panel types to translated display labels', () => {
    expect(getNodePanelLabelKey('switch')).toBe('Switch');
    expect(getNodePanelLabelKey('llm')).toBe('LLM');
    expect(getNodePanelLabelKey('loop')).toBe('Loop');
    expect(getNodePanelLabelKey('tryCatch')).toBe('TryCatch');
    expect(getNodePanelLabelKey('if')).toBe('If');
    expect(getNodePanelLabelKey('breakLoop')).toBe('BreakLoop');
    expect(getNodePanelLabelKey('agent')).toBe('Agent');
    expect(getNodePanelLabelKey('tool')).toBe('Tool');
    expect(demoI18nLanguages['zh-CN'][getNodePanelLabelKey('switch')]).toBe('分支选择');
    expect(demoI18nLanguages['zh-CN'][getNodePanelLabelKey('tryCatch')]).toBe('异常捕获');
    expect(demoI18nLanguages['zh-CN'][getNodePanelLabelKey('tool')]).toBe('工具');
  });
});
