/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest';
import { IContainer, IEngine, WorkflowStatus } from '@flowgram.ai/runtime-interface';

import { snapshotsToVOData } from '../utils';
import { WorkflowRuntimeContainer } from '../../container';
import { debugOutputSchema } from './debug-output';

const container: IContainer = WorkflowRuntimeContainer.instance;

describe('WorkflowRuntime debug-output schema', () => {
  it('passes resolved inputs through as outputs without changing the final result contract', async () => {
    const engine = container.get<IEngine>(IEngine);
    const { context, processing } = engine.invoke({
      schema: debugOutputSchema,
      inputs: {
        prompt: 'Review the generated summary',
        metadata: {
          model: 'gpt-4.1',
          tokens: 128,
        },
      },
    });

    const result = await processing;

    expect(context.statusCenter.workflow.status).toBe(WorkflowStatus.Succeeded);
    expect(result).toStrictEqual({
      observedPrompt: 'Review the generated summary',
      observedMetadata: {
        model: 'gpt-4.1',
        tokens: 128,
      },
    });

    const snapshots = snapshotsToVOData(context.snapshotCenter.exportAll());
    expect(snapshots).toContainEqual({
      nodeID: 'debug_output_0',
      inputs: {
        prompt: 'Review the generated summary',
        metadata: {
          model: 'gpt-4.1',
          tokens: 128,
        },
      },
      outputs: {
        prompt: 'Review the generated summary',
        metadata: {
          model: 'gpt-4.1',
          tokens: 128,
        },
      },
      data: {},
    });
  });
});
