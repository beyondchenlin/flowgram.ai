/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { WorkflowSchema } from '@flowgram.ai/runtime-interface';

export const debugOutputSchema: WorkflowSchema = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      meta: {
        position: {
          x: 180,
          y: 180,
        },
      },
      data: {
        title: 'Start',
        outputs: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
            },
            metadata: {
              type: 'object',
              properties: {
                model: {
                  type: 'string',
                },
                tokens: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
    {
      id: 'debug_output_0',
      type: 'debug-output',
      meta: {
        position: {
          x: 560,
          y: 180,
        },
      },
      data: {
        title: 'Debug Output',
        inputsValues: {
          prompt: {
            type: 'ref',
            content: ['start_0', 'prompt'],
          },
          metadata: {
            type: 'ref',
            content: ['start_0', 'metadata'],
          },
        },
        inputs: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
            },
            metadata: {
              type: 'object',
              properties: {
                model: {
                  type: 'string',
                },
                tokens: {
                  type: 'number',
                },
              },
            },
          },
        },
        outputs: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
            },
            metadata: {
              type: 'object',
              properties: {
                model: {
                  type: 'string',
                },
                tokens: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
    {
      id: 'end_0',
      type: 'end',
      meta: {
        position: {
          x: 940,
          y: 180,
        },
      },
      data: {
        title: 'End',
        inputsValues: {
          observedPrompt: {
            type: 'ref',
            content: ['debug_output_0', 'prompt'],
          },
          observedMetadata: {
            type: 'ref',
            content: ['debug_output_0', 'metadata'],
          },
        },
        inputs: {
          type: 'object',
          properties: {
            observedPrompt: {
              type: 'string',
            },
            observedMetadata: {
              type: 'object',
              properties: {
                model: {
                  type: 'string',
                },
                tokens: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
    },
  ],
  edges: [
    {
      sourceNodeID: 'start_0',
      targetNodeID: 'debug_output_0',
    },
    {
      sourceNodeID: 'debug_output_0',
      targetNodeID: 'end_0',
    },
  ],
};
