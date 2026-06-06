/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest';

import {
  DEMO_DEFAULT_LOCALE,
  demoI18nLanguages,
  normalizeDemoLocale,
} from '../src/i18n/demo-languages';

describe('demo free layout i18n languages', () => {
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
    expect(demoI18nLanguages['zh-CN'].LLM).toBe('大模型');
    expect(demoI18nLanguages['zh-CN']['Title is required']).toBe('标题不能为空');
  });
});
