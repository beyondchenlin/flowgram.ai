/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from 'vitest';

import { normalizeGlobalVariableSchema } from '../src/services/global-variable';

describe('demo free layout global variable state', () => {
  it('resets to an empty object schema when a document has no global variable state', () => {
    expect(normalizeGlobalVariableSchema(undefined)).toEqual({
      type: 'object',
      properties: {},
    });
  });
});
