/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import {
  ExecutionContext,
  ExecutionResult,
  FlowGramNode,
  INodeExecutor,
} from '@flowgram.ai/runtime-interface';

export class DebugOutputExecutor implements INodeExecutor {
  public readonly type = FlowGramNode.DebugOutput;

  public async execute(context: ExecutionContext): Promise<ExecutionResult> {
    return {
      outputs: context.inputs,
    };
  }
}
