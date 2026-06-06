/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rsbuild/core';

const demoLLMEnvKeys = [
  'FLOWGRAM_DEMO_LLM_MODEL_NAME',
  'FLOWGRAM_DEMO_LLM_API_KEY',
  'FLOWGRAM_DEMO_LLM_API_HOST',
  'FLOWGRAM_DEMO_LLM_TEMPERATURE',
  'FLOWGRAM_DEMO_LLM_SYSTEM_PROMPT',
  'FLOWGRAM_DEMO_LLM_MAX_TOKENS',
  'FLOWGRAM_DEMO_LLM_TIMEOUT',
  'FLOWGRAM_DEMO_LLM_MAX_RETRIES',
  'FLOWGRAM_DEMO_LLM_ENABLE_THINKING',
] as const;
type ProcessWithEnvFileLoader = typeof process & {
  loadEnvFile?: (path: string) => void;
};

function loadLocalEnvFile(fileName: string): void {
  const envPath = fileURLToPath(new URL(fileName, import.meta.url));
  if (!existsSync(envPath)) {
    return;
  }

  const loadEnvFile = (process as ProcessWithEnvFileLoader).loadEnvFile;
  if (loadEnvFile) {
    loadEnvFile(envPath);
    return;
  }

  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const parsedEnv = parseEnvLine(line);
      if (!parsedEnv || process.env[parsedEnv.key] !== undefined) {
        return;
      }

      process.env[parsedEnv.key] = parsedEnv.value;
    });
}

function parseEnvLine(line: string): { key: string; value: string } | undefined {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith('#')) {
    return;
  }

  const normalizedLine = trimmedLine.startsWith('export ')
    ? trimmedLine.slice('export '.length).trimStart()
    : trimmedLine;
  const separatorIndex = normalizedLine.indexOf('=');
  if (separatorIndex === -1) {
    return;
  }

  const key = normalizedLine.slice(0, separatorIndex).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    return;
  }

  return {
    key,
    value: parseEnvValue(normalizedLine.slice(separatorIndex + 1).trim()),
  };
}

function parseEnvValue(rawValue: string): string {
  const quote = rawValue[0];
  if ((quote !== '"' && quote !== "'") || rawValue[rawValue.length - 1] !== quote) {
    return rawValue;
  }

  const value = rawValue.slice(1, -1);
  if (quote === "'") {
    return value;
  }

  return value.replace(/\\([nrt"\\])/g, (_, escapedChar: string) => {
    switch (escapedChar) {
      case 'n':
        return '\n';
      case 'r':
        return '\r';
      case 't':
        return '\t';
      default:
        return escapedChar;
    }
  });
}

if (process.env.NODE_ENV) {
  loadLocalEnvFile(`.env.${process.env.NODE_ENV}.local`);
}
loadLocalEnvFile('.env.local');

export default defineConfig({
  plugins: [pluginReact(), pluginLess()],
  source: {
    entry: {
      index: './src/app.tsx',
    },
    /**
     * support inversify @injectable() and @inject decorators
     */
    decorators: {
      version: 'legacy',
    },
    define: Object.fromEntries(
      demoLLMEnvKeys.map((envKey) => [
        `process.env.${envKey}`,
        JSON.stringify(process.env[envKey] ?? ''),
      ])
    ),
  },
  html: {
    title: 'demo-free-layout',
  },
  tools: {
    rspack: {
      /**
       * ignore warnings from @coze-editor/editor/language-typescript
       */
      ignoreWarnings: [/Critical dependency: the request of a dependency is an expression/],
    },
  },
});
