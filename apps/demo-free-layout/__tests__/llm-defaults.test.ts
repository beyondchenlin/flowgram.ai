/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FlowDocumentJSON } from '../src/typings';

const llmEnvKeys = [
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

describe('demo free layout LLM defaults', () => {
  afterEach(() => {
    llmEnvKeys.forEach((key) => {
      delete process.env[key];
    });
    vi.resetModules();
  });

  it('creates LLM default inputs from local env configuration', async () => {
    setLLMEnv();

    const { createLLMInputSchema, createLLMInputsValues } = await import(
      '../src/nodes/llm/defaults'
    );

    expect(createLLMInputsValues()).toMatchObject({
      modelName: { type: 'constant', content: 'deepseek-chat' },
      apiKey: { type: 'constant', content: 'sk-demo-placeholder' },
      apiHost: { type: 'constant', content: 'http://127.0.0.1:17777/v1' },
      temperature: { type: 'constant', content: 0.2 },
      systemPrompt: {
        type: 'template',
        content: '你是全知全能。回答必须不超过20个中文字。',
      },
      maxTokens: { type: 'constant', content: 32 },
      timeout: { type: 'constant', content: 60000 },
      maxRetries: { type: 'constant', content: 0 },
      enableThinking: { type: 'constant', content: false },
    });
    expect(createLLMInputSchema()).toMatchObject({
      required: ['modelName', 'apiKey', 'apiHost', 'temperature', 'prompt'],
      properties: {
        maxTokens: { type: 'number' },
        timeout: { type: 'number' },
        maxRetries: { type: 'number' },
        enableThinking: { type: 'boolean' },
      },
    });
  });

  it('migrates saved managed LLM nodes to the current env-backed defaults', async () => {
    setLLMEnv();

    const { applyDemoLLMConfig } = await import('../src/nodes/llm/defaults');
    const migrated = applyDemoLLMConfig(createLegacyManagedDocument());
    const llmNode = migrated.nodes[0];

    expect(llmNode.data.inputsValues).toMatchObject({
      modelName: { type: 'constant', content: 'deepseek-chat' },
      apiKey: { type: 'constant', content: 'sk-demo-placeholder' },
      apiHost: { type: 'constant', content: 'http://127.0.0.1:17777/v1' },
      temperature: { type: 'constant', content: 0.2 },
      systemPrompt: {
        type: 'template',
        content: '你是全知全能。回答必须不超过20个中文字。',
      },
      maxTokens: { type: 'constant', content: 32 },
      timeout: { type: 'constant', content: 60000 },
      maxRetries: { type: 'constant', content: 0 },
      enableThinking: { type: 'constant', content: false },
    });
    expect(llmNode.data.inputs?.properties).toMatchObject({
      maxTokens: { type: 'number' },
      timeout: { type: 'number' },
      maxRetries: { type: 'number' },
      enableThinking: { type: 'boolean' },
    });
  });

  it('does not overwrite manually edited LLM connection settings during migration', async () => {
    setLLMEnv();

    const { applyDemoLLMConfig } = await import('../src/nodes/llm/defaults');
    const manualDocument = createLegacyManagedDocument();
    const llmNode = manualDocument.nodes[0];
    llmNode.data.inputsValues = {
      ...llmNode.data.inputsValues,
      modelName: { type: 'constant', content: 'qwen3.7-plus' },
      apiHost: { type: 'constant', content: 'http://192.168.1.127:17777/v1' },
    };

    const migrated = applyDemoLLMConfig(manualDocument);

    expect(migrated.nodes[0].data.inputsValues).toMatchObject({
      modelName: { type: 'constant', content: 'qwen3.7-plus' },
      apiKey: { type: 'constant', content: 'sk-demo-placeholder' },
      apiHost: { type: 'constant', content: 'http://192.168.1.127:17777/v1' },
      maxTokens: { type: 'constant', content: 32 },
      timeout: { type: 'constant', content: 60000 },
      maxRetries: { type: 'constant', content: 0 },
      enableThinking: { type: 'constant', content: false },
    });
  });
});

function setLLMEnv(): void {
  process.env.FLOWGRAM_DEMO_LLM_MODEL_NAME = 'deepseek-chat';
  process.env.FLOWGRAM_DEMO_LLM_API_KEY = 'sk-demo-placeholder';
  process.env.FLOWGRAM_DEMO_LLM_API_HOST = 'http://127.0.0.1:17777';
  process.env.FLOWGRAM_DEMO_LLM_TEMPERATURE = '0.2';
  process.env.FLOWGRAM_DEMO_LLM_SYSTEM_PROMPT = '你是全知全能。回答必须不超过20个中文字。';
  process.env.FLOWGRAM_DEMO_LLM_MAX_TOKENS = '32';
  process.env.FLOWGRAM_DEMO_LLM_TIMEOUT = '60000';
  process.env.FLOWGRAM_DEMO_LLM_MAX_RETRIES = '0';
  process.env.FLOWGRAM_DEMO_LLM_ENABLE_THINKING = 'false';
}

function createLegacyManagedDocument(): FlowDocumentJSON {
  return {
    nodes: [
      {
        id: 'llm_0',
        type: 'llm',
        meta: {
          position: { x: 0, y: 0 },
        },
        data: {
          title: 'LLM_1',
          inputsValues: {
            modelName: { type: 'constant', content: 'gpt-3.5-turbo' },
            apiKey: { type: 'constant', content: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
            apiHost: { type: 'constant', content: 'https://mock-ai-url/api/v3' },
            temperature: { type: 'constant', content: 0.5 },
            systemPrompt: { type: 'template', content: '# Role\nYou are an AI assistant.\n' },
            prompt: { type: 'template', content: '' },
          },
          inputs: {
            type: 'object',
            required: ['modelName', 'apiKey', 'apiHost', 'temperature', 'prompt'],
            properties: {
              modelName: { type: 'string' },
              apiKey: { type: 'string' },
              apiHost: { type: 'string' },
              temperature: { type: 'number' },
              systemPrompt: { type: 'string', extra: { formComponent: 'prompt-editor' } },
              prompt: { type: 'string', extra: { formComponent: 'prompt-editor' } },
            },
          },
          outputs: {
            type: 'object',
            properties: {
              result: { type: 'string' },
            },
          },
        },
      },
    ],
    edges: [],
  };
}
