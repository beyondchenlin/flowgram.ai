/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rsbuild/core';

const localEnvDir = fileURLToPath(new URL('.', import.meta.url));
const demoLLMEnvKeys = [
  'FLOWGRAM_DEMO_LLM_MODEL_NAME',
  'FLOWGRAM_DEMO_LLM_API_KEY',
  'FLOWGRAM_DEMO_LLM_API_HOST',
] as const;

function readLocalEnvFile(fileName: string): void {
  const envPath = `${localEnvDir}${fileName}`;
  if (!existsSync(envPath)) {
    return;
  }

  const envText = readFileSync(envPath, 'utf8');
  envText.split(/\r?\n/).forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    if (process.env[key] !== undefined) {
      return;
    }

    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    process.env[key] = stripEnvValueQuotes(rawValue);
  });
}

function stripEnvValueQuotes(rawValue: string): string {
  const isDoubleQuoted = rawValue.startsWith('"') && rawValue.endsWith('"');
  const isSingleQuoted = rawValue.startsWith("'") && rawValue.endsWith("'");
  if (isDoubleQuoted || isSingleQuoted) {
    return rawValue.slice(1, -1);
  }
  return rawValue;
}

if (process.env.NODE_ENV) {
  readLocalEnvFile(`.env.${process.env.NODE_ENV}.local`);
}
readLocalEnvFile('.env.local');

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
