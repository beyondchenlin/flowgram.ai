/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { IFlowValue } from '@schema/value';
import { WorkflowNodeSchema } from '@schema/node';
import { IJsonSchema } from '@schema/json-schema';
import { FlowGramNode } from '@node/constant';

interface DebugOutputNodeData {
  title: string;
  inputs: IJsonSchema<'object'>;
  inputsValues: Record<string, IFlowValue>;
  outputs: IJsonSchema<'object'>;
}

export type DebugOutputNodeSchema = WorkflowNodeSchema<
  FlowGramNode.DebugOutput,
  DebugOutputNodeData
>;
