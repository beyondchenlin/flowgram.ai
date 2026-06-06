/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { nanoid } from 'nanoid';

import { WorkflowNodeType } from '../constants';
import { FlowNodeRegistry } from '../../typings';
import { t } from '../../i18n';
import iconLLM from '../../assets/icon-llm.jpg';
import { createLLMDefaultData, createLLMInputSchema } from './defaults';

let index = 0;
export const LLMNodeRegistry: FlowNodeRegistry = {
  type: WorkflowNodeType.LLM,
  info: {
    icon: iconLLM,
    description: t(
      'Call the large language model and use variables and prompts to generate responses.'
    ),
  },
  meta: {
    size: {
      width: 360,
      height: 390,
    },
  },
  onAdd() {
    return {
      id: `llm_${nanoid(5)}`,
      type: 'llm',
      data: {
        title: t('LLM_{{index}}', { index: ++index }),
        ...createLLMDefaultData(),
        inputs: createLLMInputSchema(),
        outputs: {
          type: 'object',
          properties: {
            result: { type: 'string' },
          },
        },
      },
    };
  },
};
