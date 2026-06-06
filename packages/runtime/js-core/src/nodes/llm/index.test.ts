/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it, vi } from 'vitest';
import type { ExecutionContext } from '@flowgram.ai/runtime-interface';

const chatOpenAIInstances: Array<{
  fields: Record<string, unknown>;
  invoke: ReturnType<typeof vi.fn>;
}> = [];

describe('LLMExecutor', () => {
  it('passes optional latency controls to the OpenAI-compatible chat model', async () => {
    vi.resetModules();
    chatOpenAIInstances.length = 0;
    vi.doMock('@langchain/openai', () => ({
      ChatOpenAI: vi.fn().mockImplementation((fields: Record<string, unknown>) => {
        const instance = {
          fields,
          invoke: vi.fn().mockResolvedValue({ content: 'ok' }),
        };
        chatOpenAIInstances.push(instance);
        return instance;
      }),
    }));

    const { LLMExecutor } = await import('./index');
    const executor = new LLMExecutor();

    const result = await executor.execute({
      inputs: {
        modelName: 'qwen3.7-plus',
        apiKey: 'sk-test',
        apiHost: 'http://127.0.0.1:17777/v1',
        temperature: 0.2,
        systemPrompt: '你是全知全能。回答必须不超过20个中文字。',
        prompt: '你是谁',
        maxTokens: 32,
        timeout: 60000,
        maxRetries: 0,
        enableThinking: false,
      },
    } as unknown as ExecutionContext);

    expect(result).toEqual({
      outputs: {
        result: 'ok',
      },
    });
    expect(chatOpenAIInstances).toHaveLength(1);
    expect(chatOpenAIInstances[0].fields).toMatchObject({
      modelName: 'qwen3.7-plus',
      temperature: 0.2,
      apiKey: 'sk-test',
      maxTokens: 32,
      timeout: 60000,
      maxRetries: 0,
      modelKwargs: {
        enable_thinking: false,
      },
      configuration: {
        baseURL: 'http://127.0.0.1:17777/v1',
      },
    });
  });
});
