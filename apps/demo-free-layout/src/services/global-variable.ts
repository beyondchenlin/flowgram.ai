/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { type IJsonSchema } from '@flowgram.ai/form-materials';

export function createEmptyGlobalVariableSchema(): IJsonSchema {
  return {
    type: 'object',
    properties: {},
  };
}

export function normalizeGlobalVariableSchema(schema: IJsonSchema | undefined): IJsonSchema {
  return schema ?? createEmptyGlobalVariableSchema();
}
