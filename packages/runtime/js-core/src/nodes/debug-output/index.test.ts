/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest';
import { FlowGramNode, type DebugOutputNodeData } from '@flowgram.ai/runtime-interface';

import { DebugOutputExecutor } from './index';

describe('DebugOutputExecutor', () => {
  it('is registered with the built-in debug output node type', () => {
    expect(new DebugOutputExecutor().type).toBe(FlowGramNode.DebugOutput);
  });

  it('passes resolved inputs through as outputs', async () => {
    const executor = new DebugOutputExecutor();
    const nodeData: DebugOutputNodeData = {
      title: 'Debug Output',
      inputs: {
        type: 'object',
        properties: {},
      },
      inputsValues: {},
      outputs: {
        type: 'object',
        properties: {},
      },
    };

    const result = await executor.execute({
      inputs: {
        prompt: 'Review the generated summary',
        metadata: {
          tokens: 128,
        },
      },
      node: {
        id: 'debug_output_0',
        type: FlowGramNode.DebugOutput,
        data: nodeData,
      },
    } as unknown as Parameters<DebugOutputExecutor['execute']>[0]);

    expect(result).toEqual({
      outputs: {
        prompt: 'Review the generated summary',
        metadata: {
          tokens: 128,
        },
      },
    });
  });
});
