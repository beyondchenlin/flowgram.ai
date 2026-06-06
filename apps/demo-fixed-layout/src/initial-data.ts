/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { FlowDocumentJSON } from './typings';
import { t } from './i18n';

export const initialData: FlowDocumentJSON = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      blocks: [],
      data: {
        title: t('Start'),
        outputs: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              default: 'Hello Flow.',
            },
            enable: {
              type: 'boolean',
              default: true,
            },
            array_obj: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  int: {
                    type: 'number',
                  },
                  str: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      id: 'agent_0',
      type: 'agent',
      data: {
        title: t('Agent'),
      },
      blocks: [
        {
          id: 'agentLLM_0',
          type: 'agentLLM',
          blocks: [
            {
              id: 'llm_5',
              type: 'llm',
              meta: {
                defaultExpanded: false,
              },
              data: {
                title: t('LLM'),
                inputsValues: {
                  modelType: {
                    type: 'constant',
                    content: 'gpt-3.5-turbo',
                  },
                  temperature: {
                    type: 'constant',
                    content: 0.5,
                  },
                  systemPrompt: {
                    type: 'template',
                    content: '# Role\nYou are an AI assistant.\n',
                  },
                  prompt: {
                    type: 'template',
                    content: '',
                  },
                },
                inputs: {
                  type: 'object',
                  required: ['modelType', 'temperature', 'prompt'],
                  properties: {
                    modelType: {
                      type: 'string',
                    },
                    temperature: {
                      type: 'number',
                    },
                    systemPrompt: {
                      type: 'string',
                      extra: { formComponent: 'prompt-editor' },
                    },
                    prompt: {
                      type: 'string',
                      extra: { formComponent: 'prompt-editor' },
                    },
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
        },
        {
          id: 'agentMemory_0',
          type: 'agentMemory',
          blocks: [
            {
              id: 'memory_0',
              type: 'memory',
              meta: {
                defaultExpanded: false,
              },
              data: {
                title: t('Memory'),
              },
            },
          ],
        },
        {
          id: 'agentTools_0',
          type: 'agentTools',
          blocks: [
            {
              id: 'tool_0',
              type: 'tool',
              data: {
                title: t('Tool{{index}}', { index: 0 }),
              },
            },
            {
              id: 'tool_1',
              type: 'tool',
              data: {
                title: t('Tool{{index}}', { index: 1 }),
              },
            },
          ],
        },
      ],
    },
    {
      id: 'llm_0',
      type: 'llm',
      blocks: [],
      data: {
        title: t('LLM'),
        inputsValues: {
          modelType: {
            type: 'constant',
            content: 'gpt-3.5-turbo',
          },
          temperature: {
            type: 'constant',
            content: 0.5,
          },
          systemPrompt: {
            type: 'template',
            content: '# Role\nYou are an AI assistant.\n',
          },
          prompt: {
            type: 'template',
            content: '',
          },
        },
        inputs: {
          type: 'object',
          required: ['modelType', 'temperature', 'prompt'],
          properties: {
            modelType: {
              type: 'string',
            },
            temperature: {
              type: 'number',
            },
            systemPrompt: {
              type: 'string',
              extra: { formComponent: 'prompt-editor' },
            },
            prompt: {
              type: 'string',
              extra: { formComponent: 'prompt-editor' },
            },
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
    {
      id: 'switch_0',
      type: 'switch',
      data: {
        title: t('Switch'),
        outputs: {
          type: 'object',
          properties: {
            result: { type: 'string' },
          },
        },
      },
      blocks: [
        {
          id: 'case_0',
          type: 'case',
          data: {
            title: t('Case_{{index}}', { index: 0 }),
            inputsValues: {
              condition: { type: 'constant', content: true },
            },
            inputs: {
              type: 'object',
              required: ['condition'],
              properties: {
                condition: {
                  type: 'boolean',
                },
              },
            },
          },
          blocks: [],
        },
        {
          id: 'case_1',
          type: 'case',
          data: {
            title: t('Case_{{index}}', { index: 1 }),
            inputsValues: {
              condition: { type: 'constant', content: true },
            },
            inputs: {
              type: 'object',
              required: ['condition'],
              properties: {
                condition: {
                  type: 'boolean',
                },
              },
            },
          },
        },
        {
          id: 'case_default_1',
          type: 'caseDefault',
          data: {
            title: t('Default Branch'),
          },
          blocks: [],
        },
      ],
    },
    {
      id: 'loop_0',
      type: 'loop',
      data: {
        title: t('Loop'),
        loopFor: {
          type: 'ref',
          content: ['start_0', 'array_obj'],
        },
      },
      blocks: [
        {
          id: 'if_0',
          type: 'if',
          data: {
            title: t('If'),
            inputsValues: {
              condition: { type: 'constant', content: true },
            },
            inputs: {
              type: 'object',
              required: ['condition'],
              properties: {
                condition: {
                  type: 'boolean',
                },
              },
            },
          },
          blocks: [
            {
              id: 'if_true',
              type: 'ifBlock',
              data: {
                title: t('True Branch'),
              },
              blocks: [],
            },
            {
              id: 'if_false',
              type: 'ifBlock',
              data: {
                title: t('False Branch'),
              },
              blocks: [
                {
                  id: 'break_0',
                  type: 'breakLoop',
                  data: {
                    title: t('BreakLoop'),
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'tryCatch_0',
      type: 'tryCatch',
      data: {
        title: t('TryCatch'),
      },
      blocks: [
        {
          id: 'tryBlock_0',
          type: 'tryBlock',
          blocks: [],
        },
        {
          id: 'catchBlock_0',
          type: 'catchBlock',
          data: {
            title: t('Catch Block {{index}}', { index: 1 }),
            inputsValues: {
              condition: { type: 'constant', content: true },
            },
            inputs: {
              type: 'object',
              required: ['condition'],
              properties: {
                condition: {
                  type: 'boolean',
                },
              },
            },
          },
          blocks: [],
        },
        {
          id: 'catchBlock_1',
          type: 'catchBlock',
          data: {
            title: t('Catch Block {{index}}', { index: 2 }),
            inputsValues: {
              condition: { type: 'constant', content: true },
            },
            inputs: {
              type: 'object',
              required: ['condition'],
              properties: {
                condition: {
                  type: 'boolean',
                },
              },
            },
          },
          blocks: [],
        },
      ],
    },
    {
      id: 'end_0',
      type: 'end',
      blocks: [],
      data: {
        title: t('End'),
        inputsValues: {
          success: { type: 'constant', content: true, schema: { type: 'boolean' } },
        },
      },
    },
  ],
};
