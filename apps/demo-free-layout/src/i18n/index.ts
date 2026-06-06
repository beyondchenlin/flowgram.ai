/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { I18n } from '@flowgram.ai/free-layout-editor';

import { demoI18nLanguageList, demoI18nLanguages, getDemoLocale } from './demo-languages';

export const demoLocale = getDemoLocale();

I18n.addLanguages(demoI18nLanguageList);
I18n.locale = demoLocale;

export const demoI18nOptions = {
  locale: demoLocale,
  languages: demoI18nLanguages,
};

export const t = (key: string, options?: Record<string, unknown>): string => I18n.t(key, options);

export { demoI18nLanguages, getDemoLocale, normalizeDemoLocale } from './demo-languages';
